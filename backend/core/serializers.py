from rest_framework import serializers
from .models import School, Class, Section

class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = '__all__'

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
