import os
import time
from datetime import datetime, timedelta, timezone
import logging

logger = logging.getLogger(__name__)

from django.db.models import Q
from django.contrib.auth.models import User
from django.conf import settings

from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Problem, Duel, DuelSubmission
from .serializers import ProblemSerializer, DuelSerializer
from .code_executor import execute_submission

# Dummy credentials for proof of concept
DUMMY_CREDENTIALS = {
    "admin": "admin123",
    "user": "user123",
    "player1": "password123",
    "player2": "password123"
}

def verify_credentials(username, password):
    """Verify if the provided credentials are valid"""
    return (
        username in DUMMY_CREDENTIALS 
        and DUMMY_CREDENTIALS[username] == password
    ) 

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
        user, created = User.objects.get_or_create(username=username)
        if created:
            user.set_unusable_password()
            user.save()

        # Use SimpleJWT to generate tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            "message": "Login successful",
            "token": str(refresh.access_token),
            "refresh": str(refresh),
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

MATCHMAKING_QUEUE = []

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def matchmaking_view(request):
    """
    A unified endpoint to handle joining the queue and checking match status.
    The client should call this endpoint repeatedly until a duel is returned.
    """
    user = request.user

    active_duel = Duel.objects.filter(
        (Q(player1=user) | Q(player2=user)) & Q(status='active')
    ).first()
    if active_duel:
        serializer = DuelSerializer(active_duel)
        return Response(serializer.data, status=status.HTTP_200_OK)

    if user not in MATCHMAKING_QUEUE:
        MATCHMAKING_QUEUE.append(user)

    if len(MATCHMAKING_QUEUE) >= 2:
        player1 = MATCHMAKING_QUEUE.pop(0)
        player2 = MATCHMAKING_QUEUE.pop(0)

        problem = Problem.objects.order_by('?').first()
        if not problem:
            return Response(
                {"error": "No problems available to start a duel."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        new_duel = Duel.objects.create(
            problem=problem,
            player1=player1,
            player2=player2,
            status='active'
        )
        serializer = DuelSerializer(new_duel)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(
        {"status": "waiting_for_opponent"}, 
        status=status.HTTP_202_ACCEPTED
    )

class DuelViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing Duels and submitting code."""
    queryset = Duel.objects.all()
    serializer_class = DuelSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Users can only see duels they participate in."""
        user = self.request.user
        return Duel.objects.filter(Q(player1=user) | Q(player2=user))

    def retrieve(self, request, *args, **kwargs):
        """
        Implements long polling to wait for duel state changes.
        
        WARNING: This is a simple but inefficient implementation for a PoC. 
        Real system would require rewrite
        """
        duel = self.get_object()
        initial_update_time = duel.updated_at

        # Poll for up to 30 seconds, checking for changes every second.
        for _ in range(30):
            duel.refresh_from_db()
            if duel.updated_at > initial_update_time:
                serializer = self.get_serializer(duel)
                return Response(serializer.data)
            time.sleep(1)
        
        # If no update after 30 seconds, return current state
        serializer = self.get_serializer(duel)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Handles a code submission for a duel."""
        duel = self.get_object()
        user = request.user

        if duel.status != 'active':
            return Response(
                {"error": "This duel is not active."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user != duel.player1 and user != duel.player2:
            return Response(
                {"error": "You are not a participant in this duel."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        user_code = request.data.get('code')
        if not user_code:
            return Response(
                {"error": "No code provided."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        # Execute the code and get the result.
        test_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            "problem_tests", 
            duel.problem.test_file
        )
        result = execute_submission(
            user_code, test_file_path, timeout=duel.problem.time_limit
        )

        # Log the submission attempt.
        DuelSubmission.objects.create(
            duel=duel,
            player=user,
            code=user_code,
            result=result
        )

        # The first player to pass all tests wins.
        if result.get("status") == "success":
            duel.winner = user
            duel.status = 'completed'
        
        # Save changes. This updates the 'updated_at' timestamp, which
        # notifies any clients using the long polling 'retrieve' endpoint.
        duel.save()

        return Response(result)
    
    
@api_view(['GET'])
def user_history_view(request, username):
    """
    Get match history for a user by username.
    Returns last 5 problems and win/loss statistics.
    """
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"error": "User not found"}, 
            status=status.HTTP_404_NOT_FOUND
        )

    # Get all completed duels for this user
    all_duels = Duel.objects.filter(
        (Q(player1=user) | Q(player2=user)) & Q(status='completed')
    ).order_by('-updated_at')

    # Calculate win/loss statistics
    total_games = all_duels.count()
    wins = all_duels.filter(winner=user).count()
    losses = total_games - wins

    # Get last 5 duels with problem info
    recent_duels = all_duels[:5]
    recent_matches = []
    
    for duel in recent_duels:
        opponent = duel.player2 if duel.player1 == user else duel.player1
        match_data = {
            "duel_id": duel.id,
            "problem_title": duel.problem.title,
            "problem_difficulty": duel.problem.difficulty,
            "opponent": opponent.username,
            "result": "win" if duel.winner == user else "loss",
            "completed_at": duel.updated_at
        }
        recent_matches.append(match_data)

    return Response({
        "username": username,
        "statistics": {
            "total_games": total_games,
            "wins": wins,
            "losses": losses,
            "win_rate": round(wins / total_games * 100, 1) if total_games > 0 else 0
        },
        "recent_matches": recent_matches
    })