from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Attendance
from .serializers import AttendanceSerializer
from students.models import Student

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'SUPERADMIN':
            return Attendance.objects.all()
        if user.school:
            return Attendance.objects.filter(student__school=user.school)
        return Attendance.objects.none()

    @action(detail=False, methods=['post'])
    def mark(self, request):
        date = request.data.get('date')
        records = request.data.get('records', []) # list of {student_id, status}
        for rec in records:
            # Prevent marking attendance for students from other schools
            student = Student.objects.filter(id=rec['student_id']).first()
            if student and (request.user.role == 'SUPERADMIN' or student.school == request.user.school):
                Attendance.objects.update_or_create(
                    student=student, date=date,
                    defaults={'status': rec['status']}
                )
        return Response({'status': 'attendance marked successfully'})
