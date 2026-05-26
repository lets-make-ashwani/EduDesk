from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import UserSerializer
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.none()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser or user.role == 'SUPERADMIN':
            return User.objects.all()
        if user.school:
            # Exclude superadmins and return only users within the same school
            return User.objects.filter(school=user.school).exclude(role='SUPERADMIN')
        return User.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'SUPERADMIN' and user.school:
            serializer.save(school=user.school)
        else:
            serializer.save()

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    serializer = UserSerializer(request.user)
    data = dict(serializer.data)
    # Inject the school name for the frontend UI badge
    data['school_name'] = request.user.school.name if request.user.school else None
    return Response(data)
