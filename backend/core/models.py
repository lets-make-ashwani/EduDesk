from django.db import models

class School(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True)
    def __str__(self): return self.name

class Class(models.Model):
    name = models.CharField(max_length=50) # e.g. "Class 1"
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='classes')
    def __str__(self): return f"{self.name} - {self.school.name}"

class Section(models.Model):
    name = models.CharField(max_length=50) # e.g. "A"
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='sections')
    def __str__(self): return f"{self.school_class.name} {self.name}"
