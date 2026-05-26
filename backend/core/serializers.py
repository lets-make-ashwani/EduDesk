from rest_framework import serializers
from .models import School, Class, Section

class SchoolSerializer(serializers.ModelSerializer):
    student_count = serializers.SerializerMethodField()
    class_count = serializers.SerializerMethodField()
    teacher_count = serializers.SerializerMethodField()
    admin_count = serializers.SerializerMethodField()

    class Meta:
        model = School
        fields = '__all__'

    def get_student_count(self, obj):
        from students.models import Student
        return Student.objects.filter(school=obj).count()

    def get_class_count(self, obj):
        return obj.classes.count()

    def get_teacher_count(self, obj):
        from users.models import User
        return User.objects.filter(school=obj, role='teacher').count()

    def get_admin_count(self, obj):
        from users.models import User
        return User.objects.filter(school=obj, role__in=['SCHOOL_ADMIN', 'admin']).count()

class ClassSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    class Meta:
        model = Class
        fields = '__all__'

class SectionSerializer(serializers.ModelSerializer):
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    class Meta:
        model = Section
        fields = '__all__'
