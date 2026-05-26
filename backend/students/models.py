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

    @staticmethod
    def _make_username(name):
        """Build a clean username from a student's name, e.g. 'Rohit Kumar' -> 'rohit_kumar'."""
        import re
        parts = re.split(r'\s+', name.strip())
        cleaned = [re.sub(r'[^a-z0-9]', '', p.lower()) for p in parts]
        cleaned = [p for p in cleaned if p]  # drop empty parts
        return '_'.join(cleaned) if cleaned else 'student'

    @staticmethod
    def _make_password():
        """Generate a random 8-character alphanumeric password."""
        import random, string
        chars = string.ascii_letters + string.digits
        return ''.join(random.choices(chars, k=8))

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        if is_new and not self.user:
            from users.models import User

            # Build username from student name
            base_username = Student._make_username(self.name)
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            # Random 8-char alphanumeric password
            password = Student._make_password()

            user = User.objects.create_user(
                username=username,
                email=f"{username}@school.com",
                role='student',
                school=self.school
            )
            # MD5 hasher — fast for temp passwords (students change on first login)
            from django.contrib.auth.hashers import make_password as _make_hash
            user.password = _make_hash(password, hasher='md5')
            user.save()

            self.user = user
            self.temp_password = password
            super().save(update_fields=['user', 'temp_password'])
