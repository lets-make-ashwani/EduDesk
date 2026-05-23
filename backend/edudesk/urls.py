from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from users.views import UserViewSet, me
from core.views import SchoolViewSet, ClassViewSet, SectionViewSet
from students.views import StudentViewSet
from attendance.views import AttendanceViewSet
from fees.views import FeeViewSet, PaymentViewSet, FeeStructureViewSet
from exams.views import ExamViewSet, SubjectViewSet, MarksViewSet
from notices.views import NoticeViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'schools', SchoolViewSet)
router.register(r'classes', ClassViewSet)
router.register(r'sections', SectionViewSet)
router.register(r'students', StudentViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'fees', FeeViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'fee-structures', FeeStructureViewSet)
router.register(r'exams', ExamViewSet)
router.register(r'subjects', SubjectViewSet)
router.register(r'marks', MarksViewSet)
router.register(r'notices', NoticeViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/auth/me/', me, name='me'),
    path('api/academics/', include('academics.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include(router.urls)),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
