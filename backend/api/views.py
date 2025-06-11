from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from .auth import verify_credentials, generate_token
from .models import Problem
from .serializers import ProblemSerializer
from .code_executor import execute_submission
import os

DUMMY_CREDENTIALS = {
    "admin": "admin123",
    "user": "user123"
}

@api_view(['POST']) 
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {"error": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    if verify_credentials(username, password):
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

@api_view(['POST'])
def test_submission(request, problem_id):
    """
    Test a code submission for a specific problem.

    Request:
        POST /api/problems/{problem_id}/test/
        
        Body:
        {
            "code": str  # The C code to be tested
        }

    Response:
        {
            "status": str,  # One of: "success", "error", "compilation_error", "runtime_error", "timeout", "memory_error", "test_failed"
            "tests": {
                "1": {  # Test number
                    "status": str,  # "PASS" or "FAIL"
                    "message": str  # Error message if failed, empty if passed
                },
                ...
            }
        }

    Status Codes:
        200: Test completed successfully
        400: No code provided
        404: Problem not found
    """
    try:
        problem = Problem.objects.get(id=problem_id)
    except Problem.DoesNotExist:
        return Response(
            {"error": "Problem not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    user_code = request.data.get('code')
    if not user_code:
        return Response(
            {"error": "No code provided"},
            status=status.HTTP_400_BAD_REQUEST
        )

    test_file_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "problem_tests",
        problem.test_file
    )

    result = execute_submission(user_code, test_file_path)
    return Response(result)

class ProblemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing problems.
    """
    queryset = Problem.objects.all()
    serializer_class = ProblemSerializer
    permission_classes = []  # Empty list means no permissions required

    def get_queryset(self):
        """
        Optionally filter problems by difficulty
        """
        queryset = Problem.objects.all()
        difficulty = self.request.query_params.get('difficulty', None)
        if difficulty is not None:
            queryset = queryset.filter(difficulty=difficulty)
        return queryset

