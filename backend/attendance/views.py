from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Attendance
from .serializers import AttendanceSerializer
from students.models import Student

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer

    @action(detail=False, methods=['post'])
    def mark(self, request):
        date = request.data.get('date')
        records = request.data.get('records', []) # list of {student_id, status}
        for rec in records:
            student = Student.objects.get(id=rec['student_id'])
            Attendance.objects.update_or_create(
                student=student, date=date,
                defaults={'status': rec['status']}
            )
        return Response({'status': 'attendance marked successfully'})
