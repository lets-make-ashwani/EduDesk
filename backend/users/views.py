from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer, TeacherSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from rest_framework.exceptions import PermissionDenied

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.none()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return User.objects.select_related('school').all()
        if user.school:
            # Exclude superadmins and return only users within the same school
            return User.objects.select_related('school').filter(school=user.school).exclude(role='SUPERADMIN')
        return User.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        requested_role = self.request.data.get('role')
        if requested_role == 'SUPERADMIN' and user.role != 'SUPERADMIN' and not user.is_superuser:
            raise PermissionDenied("You are not authorized to create SUPERADMIN users.")
            
        if user.role != 'SUPERADMIN' and user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        requested_role = self.request.data.get('role')
        if requested_role == 'SUPERADMIN' and user.role != 'SUPERADMIN' and not user.is_superuser:
            raise PermissionDenied("You are not authorized to update a user to SUPERADMIN.")
            
        serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    data = dict(serializer.data)
    # Inject the school name for the frontend UI badge
    data['school_name'] = request.user.school.name if request.user.school else None
    return Response(data)

class TeacherViewSet(viewsets.ModelViewSet):
    queryset = User.objects.none()
    serializer_class = TeacherSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return User.objects.filter(role='teacher').select_related('school', 'teacher_profile')
        if user.school:
            return User.objects.filter(school=user.school, role='teacher').select_related('school', 'teacher_profile')
        return User.objects.none()
