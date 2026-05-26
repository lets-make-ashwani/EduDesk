from rest_framework import serializers
from .models import Subject, ClassSubject, Homework, StudyMaterial, TimeTable

class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'

class ClassSubjectSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    class_name = serializers.CharField(source='school_class.name', read_only=True)
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)

    class Meta:
        model = ClassSubject
        fields = '__all__'

class HomeworkSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)
    class_name = serializers.CharField(source='class_subject.school_class.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)

    class Meta:
        model = Homework
        fields = '__all__'

class StudyMaterialSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)
    class_name = serializers.CharField(source='class_subject.school_class.name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = StudyMaterial
        fields = '__all__'

class TimeTableSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='class_subject.subject.name', read_only=True)
    class_name = serializers.CharField(source='class_subject.school_class.name', read_only=True)
    teacher_name = serializers.CharField(source='class_subject.teacher.get_full_name', read_only=True)

    class Meta:
        model = TimeTable
        fields = '__all__'
