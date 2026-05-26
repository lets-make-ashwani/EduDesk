from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SubjectViewSet, ClassSubjectViewSet, HomeworkViewSet, StudyMaterialViewSet, TimeTableViewSet

router = DefaultRouter()
router.register(r'subjects', SubjectViewSet, basename='academic-subject')
router.register(r'class-subjects', ClassSubjectViewSet, basename='class-subject')
router.register(r'homeworks', HomeworkViewSet)
router.register(r'study-materials', StudyMaterialViewSet)
router.register(r'timetables', TimeTableViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
