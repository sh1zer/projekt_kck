from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views import ProblemViewSet

router = DefaultRouter()
router.register(r'problems', ProblemViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # API endpoints go here
    path('login/', views.login_view, name='api_login'),
    path('problems/<int:problem_id>/test/', views.test_submission, name='test_submission'),
]
