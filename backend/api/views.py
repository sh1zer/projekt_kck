from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
import jwt
from datetime import datetime, timedelta
from django.conf import settings

DUMMY_CREDENTIALS = {
    "admin": "admin123",
    "user": "user123"
}

def generate_token(username):
    """Generate a simple JWT token"""
    payload = {
        'username': username,
        'exp': datetime.utcnow() + timedelta(days=1),
        'iat': datetime.utcnow()
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

@api_view(['POST']) 
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if username in DUMMY_CREDENTIALS and DUMMY_CREDENTIALS[username] == password:
        token = generate_token(username)
        return Response({
            "message": "Login successful",
            "token": token,
            "username": username
        }, status=status.HTTP_200_OK)
    
    return Response(
        {"error": "Invalid credentials"},
        status=status.HTTP_401_UNAUTHORIZED
    )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    """Placeholder for protected endpoint (testing purposes)"""
    return Response({
        "message": f"Hello {request.user}! This is a protected endpoint.",
        "data": "Some protected data"
    })

