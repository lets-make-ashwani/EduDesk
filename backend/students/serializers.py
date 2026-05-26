from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='student_class.name', read_only=True)
    section_name = serializers.CharField(source='section.name', read_only=True)
    school_name = serializers.CharField(source='school.name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Student
        fields = '__all__'
