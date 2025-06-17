
from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework import status
from unittest.mock import patch
from rest_framework.test import APIClient
import json

from .views import MATCHMAKING_QUEUE
from .models import Problem, Duel, DuelSubmission

class MatchmakingTests(TestCase):
    def setUp(self):
        """
        This method is run before each test.
        """
        MATCHMAKING_QUEUE.clear()

        self.user1 = User.objects.create_user(username='player1', password='password123')
        self.user2 = User.objects.create_user(username='player2', password='password123')

        Problem.objects.create(
            title="Test Problem",
            description="A simple problem for testing.",
            difficulty="easy",
            time_limit=2,
            test_cases={},
            sample_input="",
            sample_output="",
            test_file="dummy_test.c"
        )

    def test_single_user_joins_queue_and_waits(self):
        """
        Tests that a single user calling the endpoint is put into a waiting state.
        """
        self.client.force_login(self.user1)
        url = reverse('matchmaking')
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertEqual(response.data['status'], 'waiting_for_opponent')
        # Assert that the user was actually added to the in-memory queue
        self.assertIn(self.user1, MATCHMAKING_QUEUE)

    def test_two_users_join_and_create_duel(self):
        """
        Tests that when a second user joins, a duel is created and returned.
        """
        # First user joins and waits
        self.client.force_login(self.user1)
        url = reverse('matchmaking')
        self.client.post(url)

        # Second user joins
        self.client.force_login(self.user2)
        response = self.client.post(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['player1']['username'], 'player1')
        self.assertEqual(response.data['player2']['username'], 'player2')
        # Assert that the queue is now empty after the match was made
        self.assertEqual(len(MATCHMAKING_QUEUE), 0)


class DuelSubmissionTests(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='player1', password='password123')
        self.user2 = User.objects.create_user(username='player2', password='password123')
        self.non_participant = User.objects.create_user(username='spectator', password='password123')
        self.problem = Problem.objects.create(
            id=1,
            title="Two sum",
            description="Given an array of integers nums...",
            difficulty="easy",
            time_limit=600,
            test_file="two_sum_test.c",
            test_cases={},
            sample_input="",
            sample_output=""
        )
        self.duel = Duel.objects.create(
            problem=self.problem,
            player1=self.user1,
            player2=self.user2,
            status='active'
        )

    @patch('api.views.execute_submission')
    def test_successful_submission_ends_duel(self, mock_execute_submission):
        mock_execute_submission.return_value = {"status": "success", "tests": {}}
        self.client.force_login(self.user1)
        url = reverse('duel-submit', kwargs={'pk': self.duel.id})
        response = self.client.post(url, {"code": ""}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.duel.refresh_from_db()
        self.assertEqual(self.duel.status, 'completed')

    @patch('api.views.execute_submission')
    def test_successful_submission_ends_duel(self, mock_execute_submission):
        mock_execute_submission.return_value = {"status": "success", "tests": {}}
        self.client.force_login(self.user1)
        url = reverse('duel-submit', kwargs={'pk': self.duel.id})
        code_payload = {"code": "int main() { return 0; }"}

        response = self.client.post(
            url,
            data=json.dumps(code_payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.duel.refresh_from_db()
        self.assertEqual(self.duel.status, 'completed')
        self.assertEqual(self.duel.winner, self.user1)

    @patch('api.views.execute_submission')
    def test_failed_submission_does_not_end_duel(self, mock_execute_submission):
        mock_execute_submission.return_value = {"status": "test_failed", "tests": {}}
        self.client.force_login(self.user2)
        url = reverse('duel-submit', kwargs={'pk': self.duel.id})
        code_payload = {"code": "int main() { return 1; }"}

        response = self.client.post(
            url,
            data=json.dumps(code_payload),
            content_type='application/json'
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.duel.refresh_from_db()
        self.assertEqual(self.duel.status, 'active')

    def test_non_participant_cannot_submit(self):
        self.client.force_login(self.non_participant)
        url = reverse('duel-submit', kwargs={'pk': self.duel.id})
        code_payload = {"code": "int main() { return 0; }"}

        response = self.client.post(
            url,
            data=json.dumps(code_payload),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)