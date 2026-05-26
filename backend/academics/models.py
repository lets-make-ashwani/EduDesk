from django.db import models
from core.models import Class, Section
from users.models import User

class Subject(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return self.name

class ClassSubject(models.Model):
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='academic_subjects')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    teacher = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'teacher'})
    
    class Meta:
        unique_together = ('school_class', 'subject')
        
    def __str__(self):
        return f"{self.school_class.name} - {self.subject.name}"

class Homework(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='homeworks/', blank=True, null=True)
    due_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='homeworks')
    section = models.ForeignKey(Section, on_delete=models.CASCADE, null=True, blank=True) # Optional: if homework is section-specific
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role__in': ['admin', 'teacher']})
    
    def __str__(self):
        return f"{self.title} - {self.class_subject}"

class StudyMaterial(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='study_materials/')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='materials')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role__in': ['admin', 'teacher']})

    def __str__(self):
        return f"{self.title} - {self.class_subject}"

class TimeTable(models.Model):
    DAYS_OF_WEEK = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
    ]
    class_subject = models.ForeignKey(ClassSubject, on_delete=models.CASCADE, related_name='timetables')
    day_of_week = models.CharField(max_length=20, choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.class_subject} - {self.day_of_week} {self.start_time}-{self.end_time}"
