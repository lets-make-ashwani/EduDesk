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
    temp_password = models.CharField(max_length=50, blank=True, null=True)
    
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    student_class = models.ForeignKey(Class, on_delete=models.CASCADE)
    section = models.ForeignKey(Section, on_delete=models.CASCADE)

    def __str__(self): return f"{self.name} ({self.student_class.name} {self.section.name})"

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.user:
            from users.models import User
            import uuid
            import random
            import string
            
            username = self.admission_number
            if not username:
                clean_name = "".join(c for c in self.name.lower() if c.isalnum())
                username = f"std_{clean_name}_{uuid.uuid4().hex[:6]}"
            else:
                username = "".join(c for c in username.lower() if c.isalnum())
                
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
                
            # Generate a dynamic unique password for each student (e.g., Name@9034)
            name_part = "".join(c for c in self.name if c.isalpha())[:4].capitalize()
            if not name_part:
                name_part = "Std"
            random_digits = "".join(random.choices(string.digits, k=4))
            password = f"{name_part}@{random_digits}"
                
            user = User.objects.create_user(
                username=username,
                email=f"{username}@school.com",
                role='student',
                school=self.school
            )
            user.set_password(password)
            user.save()
            
            self.user = user
            self.temp_password = password
            super().save(update_fields=['user', 'temp_password'])
