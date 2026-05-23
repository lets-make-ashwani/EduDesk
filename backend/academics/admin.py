from django.contrib import admin
from .models import Subject, ClassSubject, Homework, StudyMaterial

# Register your models here.
admin.site.register(Subject)
admin.site.register(ClassSubject)
admin.site.register(Homework)
admin.site.register(StudyMaterial)
