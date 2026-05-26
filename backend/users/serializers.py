from rest_framework import serializers
from .models import User, TeacherProfile

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'role', 'password')
        extra_kwargs = {'password': {'write_only': True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance

class TeacherSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='teacher_profile.phone', required=False, allow_blank=True)
    qualification = serializers.CharField(source='teacher_profile.qualification', required=False, allow_blank=True)
    password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'phone', 'qualification', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        profile_data = validated_data.pop('teacher_profile', {})
        phone = profile_data.get('phone', '')
        qualification = profile_data.get('qualification', '')
        password = validated_data.pop('password', None)
        
        request = self.context.get('request')
        school = request.user.school if (request and request.user.role != 'SUPERADMIN') else None
        
        user = User.objects.create_user(role='teacher', school=school, **validated_data)
        if password:
            user.set_password(password)
            user.save()
            
        TeacherProfile.objects.create(user=user, phone=phone, qualification=qualification)
        return user

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('teacher_profile', {})
        password = validated_data.pop('password', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        
        profile, _ = TeacherProfile.objects.get_or_create(user=instance)
        if 'phone' in profile_data:
            profile.phone = profile_data['phone']
        if 'qualification' in profile_data:
            profile.qualification = profile_data['qualification']
        profile.save()
        
        return instance
