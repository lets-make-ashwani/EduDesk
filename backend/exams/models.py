from django.db import models
from core.models import School, Class
from students.models import Student

class Exam(models.Model):
    name = models.CharField(max_length=100)
    school = models.ForeignKey(School, on_delete=models.CASCADE)
    date = models.DateField(null=True, blank=True)
    def __str__(self): return self.name

class Subject(models.Model):
    name = models.CharField(max_length=100)
    school_class = models.ForeignKey(Class, on_delete=models.CASCADE, related_name='subjects')
    def __str__(self): return f"{self.name} - {self.school_class.name}"

class Marks(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE)
    marks_obtained = models.DecimalField(max_digits=5, decimal_places=2)
    max_marks = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ('student', 'exam', 'subject')

    def __str__(self): return f"{self.student.name} - {self.subject.name}: {self.marks_obtained}/{self.max_marks}"
