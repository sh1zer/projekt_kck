from django.urls import path
from . import views

urlpatterns = [
    # API endpoints go here
    path('login/', views.login_view, name='api_login'),
    path('protected/', views.protected_view, name='protected_view')
]
