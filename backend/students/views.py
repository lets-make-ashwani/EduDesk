from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Student
from core.models import School, Class, Section
from .serializers import StudentSerializer
import csv
import io

class StudentViewSet(viewsets.ModelViewSet):
    serializer_class = StudentSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return Student.objects.select_related('school', 'student_class', 'section').all()
        if user.school:
            return Student.objects.select_related('school', 'student_class', 'section').filter(school=user.school)
        return Student.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SUPERADMIN':
            serializer.save(school=user.school)
        else:
            serializer.save()

    @action(detail=False, methods=['post'])
    def generate_credentials(self, request):
        """
        Backfill: generate username + password for every student
        in this school who does not yet have a linked user account.
        Uses bulk_create for Users to minimise DB round-trips.
        """
        from users.models import User
        from .models import Student as StudentModel

        students_qs = list(
            self.get_queryset()
            .filter(user__isnull=True)
            .select_related('school')
        )

        if not students_qs:
            return Response(
                {"message": "All students already have login credentials.", "errors": []},
                status=status.HTTP_200_OK,
            )

        created = 0
        errors = []
        CHUNK = 50   # process 50 students at a time

        # Pre-load all existing usernames once to avoid repeated DB hits
        existing_usernames = set(User.objects.values_list('username', flat=True))

        for i in range(0, len(students_qs), CHUNK):
            chunk = students_qs[i : i + CHUNK]
            users_to_create = []
            plan = []   # (student, username, password)

            for student in chunk:
                try:
                    base = StudentModel._make_username(student.name)
                    username = base
                    counter = 1
                    while username in existing_usernames:
                        username = f"{base}{counter}"
                        counter += 1
                    existing_usernames.add(username)   # reserve it locally

                    password = StudentModel._make_password()

                    u = User(
                        username=username,
                        email=f"{username}@school.com",
                        role='student',
                        school=student.school,
                    )
                    u.set_password(password)
                    users_to_create.append(u)
                    plan.append((student, username, password))
                except Exception as e:
                    errors.append(f"Student '{student.name}' (id={student.id}): {str(e)}")

            # Single bulk insert for the whole chunk
            try:
                User.objects.bulk_create(users_to_create, ignore_conflicts=True)
            except Exception as e:
                errors.append(f"Bulk create error for chunk {i}-{i+CHUNK}: {str(e)}")
                continue

            # Fetch the newly created users by username
            usernames_in_chunk = [u.username for u in users_to_create]
            created_users = {u.username: u for u in User.objects.filter(username__in=usernames_in_chunk)}

            # Link users back to students
            students_to_update = []
            for student, username, password in plan:
                user_obj = created_users.get(username)
                if user_obj:
                    student.user = user_obj
                    student.temp_password = password
                    students_to_update.append(student)
                    created += 1
                else:
                    errors.append(f"Could not find created user '{username}' for student '{student.name}'")

            if students_to_update:
                Student.objects.bulk_update(students_to_update, ['user', 'temp_password'])

        return Response(
            {
                "message": f"Generated credentials for {created} student(s).",
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        count, _ = self.get_queryset().delete()
        return Response({"message": f"Successfully deleted {count} students."}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'])
    def bulk_upload(self, request):
        if 'file' not in request.FILES:
            return Response({"error": "No file provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        file = request.FILES['file']
        if not file.name.endswith('.csv'):
            return Response({"error": "File is not a CSV. Please make sure to save your Excel file as a CSV (Comma Delimited) format."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            decoded_file = file.read().decode('utf-8-sig') # Handle BOM from Excel
        except UnicodeDecodeError:
            decoded_file = file.read().decode('iso-8859-1')
            
        io_string = io.StringIO(decoded_file)
        reader = csv.DictReader(io_string)
        
        # Trim whitespace from headers
        reader.fieldnames = [str(field).strip() for field in reader.fieldnames]

        user = request.user
        if user.role == 'SUPERADMIN':
            school_id = request.data.get('school_id')
            if not school_id:
                return Response({"error": "School ID must be provided"}, status=status.HTTP_400_BAD_REQUEST)
            try:
                school = School.objects.get(id=school_id)
            except Exception as e:
                return Response({"error": "Invalid School ID"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            school = user.school
            if not school:
                return Response({"error": "User is not associated with any school"}, status=status.HTTP_400_BAD_REQUEST)

        students_created = 0
        errors = []

        try:
            with transaction.atomic():
                for row_index, row in enumerate(reader, start=2): # Start at 2 for header row
                    try:
                        # Dynamically get or create class and section from CSV row
                        class_name = str(row.get('Class', '')).strip()
                        if not class_name:
                            raise ValueError("Missing 'Class' data for this row in the CSV.")
                        
                        # Get or Create the Class for this school
                        student_class, _ = Class.objects.get_or_create(
                            name=class_name,
                            school=school
                        )
                        
                        # Get or Create a default section 'A' for this class
                        section, _ = Section.objects.get_or_create(
                            name='A',
                            school_class=student_class
                        )

                        # Need to gracefully handle values missing from specific row dict based on the exact user text provided
                        student_name = str(row.get('Student Name', '')).strip()
                        if not student_name:
                             raise ValueError("Missing 'Student Name' data for this row.")

                        # Graceful extraction checking multiple variations of headers
                        age_val = str(row.get('Age', '')).strip()
                        roll_val = str(row.get('Roll Number', row.get('Roll.No', row.get('Roll', '')))).strip()
                        father_val = str(row.get('Father Name', row.get('Father', ''))).strip()
                        mother_val = str(row.get('Mother Name', row.get('Mother', ''))).strip()
                        contact_val = str(row.get('Contact Number', row.get('Contact No', row.get('Phone', '')))).strip()
                        admission_val = str(row.get('Admission Number', row.get('Admission No', row.get('Adm No', '')))).strip()
                        aadhar_val = str(row.get('Aadhaar Number', row.get('Aadhar Number', row.get('Aadhaar No (FAKE)', '')))).strip()
                        apaar_val = str(row.get('APPAR Number', row.get('APAAR Number', row.get('APPAR No (FAKE)', '')))).strip()
                        blood_val = str(row.get('Blood Group', '')).strip()

                        Student.objects.create(
                            name=student_name,
                            gender=str(row.get('Gender', '')).strip() or None,
                            age=int(age_val) if age_val.isdigit() else None,
                            roll_number=roll_val or None,
                            father_name=father_val or None,
                            mother_name=mother_val or None,
                            contact_number=contact_val or None,
                            parent_phone=contact_val or 'N/A', # Fallback since it was required
                            admission_number=admission_val or None,
                            aadhar_number=aadhar_val or None,
                            apaar_number=apaar_val or None,
                            blood_group=blood_val or None,
                            school=school,
                            student_class=student_class,
                            section=section
                        )
                        students_created += 1
                    except Exception as e:
                        errors.append(f"Row {row_index} ({row.get('Student Name', 'Unknown')}): {str(e)}")
                        
                if errors:
                    raise ValueError("Errors occurred during bulk upload validation.")
        except Exception as e:
            return Response({
                "error": "Bulk upload failed. No student records were saved.",
                "errors": errors
            }, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": f"Bulk upload successful. Created {students_created} students."
        }, status=status.HTTP_201_CREATED)
