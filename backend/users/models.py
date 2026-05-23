from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin (Principal)'),
        ('teacher', 'Teacher'),
        ('parent', 'Parent'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='admin')
    
    def __str__(self):
        return f"{self.username} - {self.get_role_display()}"

class TeacherProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='teacher_profile')
    phone = models.CharField(max_length=20, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    # They can be mapped to subjects via a many-to-many or specific subject model later
    
    def __str__(self):
        return f"Teacher: {self.user.get_full_name() or self.user.username}"

class ParentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='parent_profile')
    primary_contact = models.CharField(max_length=20)
    address = models.TextField(blank=True)
    
    def __str__(self):
        return f"Parent: {self.user.get_full_name() or self.user.username}"
