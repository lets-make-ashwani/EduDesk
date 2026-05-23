from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Subject, ClassSubject, Homework, StudyMaterial
from .serializers import SubjectSerializer, ClassSubjectSerializer, HomeworkSerializer, StudyMaterialSerializer

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
        if user.role == 'teacher':
            return ClassSubject.objects.filter(teacher=user)
        return ClassSubject.objects.all()

class HomeworkViewSet(viewsets.ModelViewSet):
    queryset = Homework.objects.all()
    serializer_class = HomeworkSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return Homework.objects.filter(class_subject__teacher=user)
        return Homework.objects.all()

    def perform_create(self, serializer):
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
        if user.role == 'teacher':
            return StudyMaterial.objects.filter(class_subject__teacher=user)
        return StudyMaterial.objects.all()

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)
