from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subject, ClassSubject, Homework, StudyMaterial, TimeTable
from .serializers import SubjectSerializer, ClassSubjectSerializer, HomeworkSerializer, StudyMaterialSerializer, TimeTableSerializer

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer
    permission_classes = [IsAuthenticated]

class ClassSubjectViewSet(viewsets.ModelViewSet):
    queryset = ClassSubject.objects.all()
    serializer_class = ClassSubjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return ClassSubject.objects.all()
        if not user.school:
            return ClassSubject.objects.none()
            
        qs = ClassSubject.objects.filter(school_class__school=user.school)
        if user.role == 'teacher':
            return qs.filter(teacher=user)
        return qs

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return Homework.objects.all()
        if not user.school:
            return Homework.objects.none()
            
        qs = Homework.objects.filter(class_subject__school_class__school=user.school)
        if user.role == 'teacher':
            return qs.filter(class_subject__teacher=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SUPERADMIN':
            class_subject = serializer.validated_data.get('class_subject')
            if class_subject and class_subject.school_class.school != user.school:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only assign homework to your own school.")

        homework = serializer.save(created_by=self.request.user)
        
        # Notify all students in this class
        from students.models import Student
        from notifications.models import Notification
        
        students = Student.objects.filter(student_class=homework.class_subject.school_class)
        # If section is provided, filter students by section too
        if homework.section:
            students = students.filter(section=homework.section)
            
        notifications_to_create = []
        for student in students:
            if student.user: # Only notify students who actually have user accounts linked
                notifications_to_create.append(Notification(
                    user=student.user,
                    title=f"New Homework: {homework.class_subject.subject.name}",
                    message=f"{self.request.user.get_full_name() or 'Your teacher'} assigned: {homework.title}. Due {homework.due_date}.",
                    type='homework'
                ))
        
        if notifications_to_create:
            Notification.objects.bulk_create(notifications_to_create)

class StudyMaterialViewSet(viewsets.ModelViewSet):
    queryset = StudyMaterial.objects.all()
    serializer_class = StudyMaterialSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return StudyMaterial.objects.all()
        if not user.school:
            return StudyMaterial.objects.none()
            
        qs = StudyMaterial.objects.filter(class_subject__school_class__school=user.school)
        if user.role == 'teacher':
            return qs.filter(class_subject__teacher=user)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SUPERADMIN':
            class_subject = serializer.validated_data.get('class_subject')
            if class_subject and class_subject.school_class.school != user.school:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only upload materials to your own school.")

        serializer.save(uploaded_by=self.request.user)

class TimeTableViewSet(viewsets.ModelViewSet):
    queryset = TimeTable.objects.all()
    serializer_class = TimeTableSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return TimeTable.objects.all()
        if not user.school:
            return TimeTable.objects.none()

        qs = TimeTable.objects.filter(class_subject__school_class__school=user.school)
        
        if user.role == 'teacher':
            return qs.filter(class_subject__teacher=user)
        elif user.role == 'student':
            from students.models import Student
            student = Student.objects.filter(user=user).first()
            if student:
                return qs.filter(class_subject__school_class=student.student_class)
            return qs.none()
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SUPERADMIN':
            class_subject = serializer.validated_data.get('class_subject')
            if class_subject and class_subject.school_class.school != user.school:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied("You can only schedule timetables for your own school.")
        serializer.save()
