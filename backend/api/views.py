import os
import time
from datetime import datetime, timedelta, timezone
import threading

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

from django.utils import timezone

# -------------------------------------------------
# Duel staleness configuration
DUEL_TTL = timedelta(minutes=10)          # how long an 'active' duel stays valid
STALE_STATES = {'active'}                 # states that can become stale
ABANDONED_STATE = 'abandoned'             # make sure this is in your Duel.status choices
# -------------------------------------------------

def _expire_stale_duel(duel):
    """
    If `duel` is older than DUEL_TTL, mark it as abandoned and return None.
    Otherwise return the (still valid) duel object.
    """
    if duel and duel.status in STALE_STATES:
        if duel.updated_at < timezone.now() - DUEL_TTL:
            duel.status = ABANDONED_STATE
            duel.save(update_fields=['status', 'updated_at'])
            return None
    return duel


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

MATCHMAKING_QUEUE = []  # List of dicts: {'id': user.id, 'username': user.username}
MATCHMAKING_LOCK = threading.Lock()  # Thread safety for queue operations

def find_user_in_queue(user_id):
    """Helper function to find a user in the queue by ID"""
    print(f"DEBUG: Looking for user {user_id} in queue: {MATCHMAKING_QUEUE}")
    for i, user_info in enumerate(MATCHMAKING_QUEUE):
        if user_info['id'] == user_id:
            print(f"DEBUG: Found user {user_id} at position {i}")
            return i
    print(f"DEBUG: User {user_id} not found in queue")
    return -1

def remove_user_from_queue(user_id):
    """Helper function to safely remove a user from the queue"""
    print(f"DEBUG: Attempting to remove user {user_id} from queue: {MATCHMAKING_QUEUE}")
    index = find_user_in_queue(user_id)
    if index >= 0:
        removed_user = MATCHMAKING_QUEUE.pop(index)
        print(f"DEBUG: Removed user {removed_user} from queue. Queue now: {MATCHMAKING_QUEUE}")
        return removed_user
    print(f"DEBUG: User {user_id} was not in queue, nothing to remove")
    return None

def process_matchmaking_queue():
    """Process the queue and create matches when possible"""
    print(f"DEBUG: Starting queue processing. Current queue: {MATCHMAKING_QUEUE}")
    created_duels = []
    
    while len(MATCHMAKING_QUEUE) >= 2:
        print(f"DEBUG: Queue has {len(MATCHMAKING_QUEUE)} players, attempting to match")
        player1_info = MATCHMAKING_QUEUE.pop(0)
        player2_info = MATCHMAKING_QUEUE.pop(0)
        print(f"DEBUG: Popped players for matching: {player1_info} vs {player2_info}")
        
        try:
            player1 = User.objects.get(id=player1_info['id'])
            player2 = User.objects.get(id=player2_info['id'])
            print(f"DEBUG: Successfully retrieved user objects: {player1.username} vs {player2.username}")
        except User.DoesNotExist as e:
            # If user doesn't exist, skip them
            print(f"WARNING: User not found during matchmaking: {player1_info} or {player2_info}. Error: {e}")
            continue

        # Check if either player is already in an active duel
        player1_duel = _expire_stale_duel(
        Duel.objects.filter(
            (Q(player1=player1) | Q(player2=player1)) & Q(status='active')
        ).first()
        )

        player2_duel = _expire_stale_duel(
            Duel.objects.filter(
                (Q(player1=player2) | Q(player2=player2)) & Q(status='active')
            ).first()
        )


        print(f"DEBUG: Duel check - {player1.username} has active duel: {player1_duel is not None}")
        print(f"DEBUG: Duel check - {player2.username} has active duel: {player2_duel is not None}")

        if player1_duel or player2_duel:
            # If either is in a duel, put the one who is not back in the queue
            if not player1_duel:
                MATCHMAKING_QUEUE.insert(0, player1_info)
                print(f"DEBUG: Put {player1.username} back in queue (not in active duel)")
            if not player2_duel:
                MATCHMAKING_QUEUE.insert(0, player2_info)
                print(f"DEBUG: Put {player2.username} back in queue (not in active duel)")
            print(f"INFO: One or both players already in a duel. Queue now: {MATCHMAKING_QUEUE}")
            continue

        # Neither is in a duel, create a new duel
        print(f"DEBUG: Both players are free, creating duel between {player1.username} and {player2.username}")
        problem = Problem.objects.order_by('?').first()
        if not problem:
            # Put both players back in queue if no problem available
            MATCHMAKING_QUEUE.insert(0, player1_info)
            MATCHMAKING_QUEUE.insert(0, player2_info)
            print("ERROR: No problems available to start a duel, putting players back in queue")
            break
            
        new_duel = Duel.objects.create(
            problem=problem,
            player1=player1,
            player2=player2,
            status='active'
        )
        created_duels.append(new_duel)
        print(f"✅ Created duel {new_duel.id} between {player1.username} and {player2.username}. Problem: {problem.title}. Queue now: {MATCHMAKING_QUEUE}")
    
    print(f"DEBUG: Queue processing complete. Created {len(created_duels)} duels. Final queue: {MATCHMAKING_QUEUE}")
    return created_duels

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def matchmaking_view(request):
    user = request.user
    
    with MATCHMAKING_LOCK:
        print(f"🎯 MATCHMAKING START: User {user.username} (id={user.id}) called matchmaking")
        print(f"DEBUG: Current queue state: {MATCHMAKING_QUEUE}")

        # 1. Check if user is already in an active duel
        print(f"DEBUG: Checking if {user.username} has an active duel...")
        active_duel = Duel.objects.filter(
            (Q(player1=user) | Q(player2=user)) & Q(status='active')
        ).first()
        active_duel = _expire_stale_duel(active_duel)
        if active_duel:
            opponent = active_duel.player1.username if active_duel.player2 == user else active_duel.player2.username
            print(f"✅ {user.username} is already in active duel {active_duel.id} (vs {opponent})")
            # Remove user from queue if they're somehow still there
            removed = remove_user_from_queue(user.id)
            if removed:
                print(f"DEBUG: Removed {user.username} from queue since they have active duel")
            serializer = DuelSerializer(active_duel)
            return Response(serializer.data, status=status.HTTP_200_OK)

        print(f"DEBUG: {user.username} has no active duel, proceeding with matchmaking")

        # 2. Add user to queue if not already in it
        user_position = find_user_in_queue(user.id)
        if user_position == -1:
            MATCHMAKING_QUEUE.append({'id': user.id, 'username': user.username})
            print(f"➕ Added {user.username} to queue. Queue now: {MATCHMAKING_QUEUE}")
        else:
            print(f"DEBUG: {user.username} already in queue at position {user_position}")

        # 3. Process the matchmaking queue
        print("🔄 Starting queue processing...")
        created_duels = process_matchmaking_queue()
        
        # 4. Check if this user got matched in any of the created duels
        print(f"DEBUG: Checking if {user.username} was matched in any of {len(created_duels)} created duels")
        for duel in created_duels:
            if duel.player1 == user or duel.player2 == user:
                opponent = duel.player2 if duel.player1 == user else duel.player1
                print(f"🎉 {user.username} was matched with {opponent.username} in duel {duel.id}!")
                serializer = DuelSerializer(duel)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

        # 5. User is still waiting
        final_position = find_user_in_queue(user.id)
        print(f"⏳ {user.username} is still waiting (position {final_position + 1}). Queue: {MATCHMAKING_QUEUE}")
        return Response(
            {
                "status": "waiting_for_opponent", 
                "queue_position": final_position + 1,
                "queue_size": len(MATCHMAKING_QUEUE)
            }, 
            status=status.HTTP_202_ACCEPTED
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_matchmaking_view(request):
    user = request.user
    
    with MATCHMAKING_LOCK:
        print(f"🚫 CANCEL MATCHMAKING: {user.username} requested to cancel matchmaking")
        print(f"DEBUG: Queue before cancellation: {MATCHMAKING_QUEUE}")
        
        removed_user = remove_user_from_queue(user.id)
        if removed_user:
            print(f"✅ {user.username} successfully cancelled matchmaking. Queue now: {MATCHMAKING_QUEUE}")
            return Response({"status": "cancelled"}, status=status.HTTP_200_OK)
        else:
            print(f"⚠️ {user.username} tried to cancel but was not in queue. Queue: {MATCHMAKING_QUEUE}")
            return Response({"status": "not_in_queue"}, status=status.HTTP_200_OK)

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

        print(f"💻 CODE SUBMISSION: {user.username} submitting code for duel {duel.id}")

        if duel.status != 'active':
            print(f"❌ {user.username} tried to submit to inactive duel {duel.id} (status: {duel.status})")
            return Response(
                {"error": "This duel is not active."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if user != duel.player1 and user != duel.player2:
            print(f"❌ {user.username} tried to submit to duel {duel.id} but is not a participant")
            return Response(
                {"error": "You are not a participant in this duel."}, 
                status=status.HTTP_403_FORBIDDEN
            )

        user_code = request.data.get('code')
        if not user_code:
            print(f"❌ {user.username} submitted empty code to duel {duel.id}")
            return Response(
                {"error": "No code provided."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        print(f"DEBUG: Executing code for {user.username} in duel {duel.id}")

        # Execute the code and get the result.
        test_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)), 
            "problem_tests", 
            duel.problem.test_file
        )
        result = execute_submission(
            user_code, test_file_path, timeout=duel.problem.time_limit
        )

        print(f"DEBUG: Code execution result for {user.username}: {result.get('status', 'unknown')}")

        # Log the submission attempt.
        DuelSubmission.objects.create(
            duel=duel,
            player=user,
            code=user_code,
            result=result
        )

        # The first player to pass all tests wins.
        if result.get("status") == "success":
            print(f"🎉 {user.username} WON duel {duel.id}! Marking duel as completed.")
            duel.winner = user
            duel.status = 'completed'
            
            # Remove both players from matchmaking queue if they're somehow still there
            with MATCHMAKING_LOCK:
                removed1 = remove_user_from_queue(duel.player1.id)
                removed2 = remove_user_from_queue(duel.player2.id)
                if removed1 or removed2:
                    print(f"DEBUG: Cleaned up queue after duel completion: removed {removed1 or 'none'} and {removed2 or 'none'}")
        else:
            print(f"❌ {user.username}'s submission failed in duel {duel.id}: {result.get('error', 'unknown error')}")
        
        # Save changes. This updates the 'updated_at' timestamp, which
        # notifies any clients using the long polling 'retrieve' endpoint.
        duel.save()
        print(f"DEBUG: Duel {duel.id} saved with updated status")

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