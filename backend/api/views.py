from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['POST']) 
def login_view(request):
    # placeholder login, need to implement login validation later
    username = request.data.get('username')
    password = request.data.get('password')

    if username and password:
        return Response(
            {"message": f"Login attempt for {username}."},
            status=status.HTTP_200_OK
        )
    return Response(
        {"error": "Username and password are required."},
        status=status.HTTP_400_BAD_REQUEST
    )

