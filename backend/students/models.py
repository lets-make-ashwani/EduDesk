from django.db import models
from django.conf import settings
from core.models import School, Class, Section

class Student(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='student_profile')
    name = models.CharField(max_length=200)
    gender = models.CharField(max_length=20, choices=[('Male', 'Male'), ('Female', 'Female'), ('Other', 'Other')], blank=True, null=True)
    age = models.IntegerField(blank=True, null=True)
    roll_number = models.CharField(max_length=50, blank=True, null=True)
    father_name = models.CharField(max_length=200, blank=True, null=True)
    mother_name = models.CharField(max_length=200, blank=True, null=True)
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    parent_phone = models.CharField(max_length=20, blank=True, null=True) # Keeping for backward compat / primary contact
    admission_number = models.CharField(max_length=100, blank=True, null=True, unique=True)
    aadhar_number = models.CharField(max_length=20, blank=True, null=True, unique=True)
    apaar_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    blood_group = models.CharField(max_length=10, blank=True, null=True)
    admission_date = models.DateField(auto_now_add=True)
    
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    def __str__(self): return f"{self.name} ({self.student_class.name} {self.section.name})"
