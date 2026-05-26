import os
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.contrib.auth.hashers import make_password
from .models import School, Class, Section
from .serializers import SchoolSerializer, ClassSerializer, SectionSerializer
from users.models import User

class SchoolViewSet(viewsets.ModelViewSet):
    serializer_class = SchoolSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return School.objects.all()
        if user.school:
            return School.objects.filter(id=user.school.id)
        return School.objects.none()

class ClassViewSet(viewsets.ModelViewSet):
    serializer_class = ClassSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return Class.objects.all()
        if user.school:
            return Class.objects.filter(school=user.school)
        return Class.objects.none()

class SectionViewSet(viewsets.ModelViewSet):
    serializer_class = SectionSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return Section.objects.all()
        if user.school:
            return Section.objects.filter(school_class__school=user.school)
        return Section.objects.none()

class SaaSOnboardingView(APIView):
    permission_classes = [IsAdminUser] 

    def post(self, request):
        school_name = request.data.get('school_name')
        admin_email = request.data.get('email')
        admin_username = request.data.get('username')
        admin_password = request.data.get('password')

        school = School.objects.create(name=school_name)
        user = User.objects.create(
            username=admin_username,
            email=admin_email,
            role='SCHOOL_ADMIN',
            school=school,
            password=make_password(admin_password)
        )

        return Response({
            "message": "School and Admin created successfully!",
            "school": school.name,
            "admin_credentials": {
                "username": user.username,
                "password": admin_password,
                "login_url": os.environ.get("FRONTEND_URL", "https://edu-desk-beryl.vercel.app").rstrip("/") + "/login"
            }
        })
