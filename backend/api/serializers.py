from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Problem, Duel, DuelSubmission

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = '__all__'

class SimpleUserSerializer(serializers.ModelSerializer):
    """A simple serializer for user info to nest in other serializers."""
    class Meta:
        model = User
        fields = ['id', 'username']

class DuelSubmissionSerializer(serializers.ModelSerializer):
    player = SimpleUserSerializer(read_only=True)

    class Meta:
        model = DuelSubmission
        fields = ['id', 'player', 'result', 'submission_time']

class DuelSerializer(serializers.ModelSerializer):
    player1 = SimpleUserSerializer(read_only=True)
    player2 = SimpleUserSerializer(read_only=True)
    winner = SimpleUserSerializer(read_only=True)
    problem = ProblemSerializer(read_only=True)
    submissions = DuelSubmissionSerializer(many=True, read_only=True)

    class Meta:
        model = Duel
        fields = [
            'id', 'problem', 'player1', 'player2', 'status',
            'winner', 'start_time', 'updated_at', 'submissions'
        ]