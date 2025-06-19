from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'problems', views.ProblemViewSet, basename='problem')
router.register(r'duels', views.DuelViewSet, basename='duel')

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.login_view, name='api_login'),
    path('users/<str:username>/history/', views.user_history_view, name='user-history'),
    path('matchmaking/', views.matchmaking_view, name='matchmaking'),
    
]