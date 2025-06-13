from django.db import models
from django.contrib.auth.models import User

class Problem(models.Model):
    DIFFICULTY_CHOICES = [
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES)
    time_limit = models.IntegerField(help_text="Time limit in seconds")
    test_cases = models.JSONField(help_text="List of test cases with inputs and expected outputs")
    sample_input = models.TextField(help_text="Sample input for the problem")
    sample_output = models.TextField(help_text="Sample output for the problem")
    solution_template = models.TextField(blank=True, help_text="Optional starter code template")
    test_file = models.CharField(max_length=200, help_text="Name of the test file in problem_tests directory")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.difficulty})"

    class Meta:
        ordering = ['difficulty', 'title']

class Duel(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('active', 'Active'),
        ('completed', 'Completed'),
    ]

    problem = models.ForeignKey(Problem, on_delete=models.CASCADE, related_name='duels')
    player1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='duels_as_player1')
    player2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='duels_as_player2')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='active')
    winner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='won_duels')
    start_time = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Duel {self.id} between {self.player1.username} and {self.player2.username}"

class DuelSubmission(models.Model):
    duel = models.ForeignKey(Duel, on_delete=models.CASCADE, related_name='submissions')
    player = models.ForeignKey(User, on_delete=models.CASCADE, related_name='duel_submissions')
    code = models.TextField()
    result = models.JSONField() # Stores the output from execute_submission
    submission_time = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.player.username} for Duel {self.duel.id}"