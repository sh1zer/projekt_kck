from django.db import models

# Create your models here.

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
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.difficulty})"

    class Meta:
        ordering = ['difficulty', 'title']
