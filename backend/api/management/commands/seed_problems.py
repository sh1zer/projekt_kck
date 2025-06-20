from django.core.management.base import BaseCommand
from api.models import Problem

class Command(BaseCommand):
    help = "Seed the database with default coding problems so matchmaking can create duels."

    DEFAULT_PROBLEMS = [
        {
            "title": "Two Sum",
            "description": (
                "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\n"
                "You may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n"
                "You can return the answer in any order."
            ),
            "difficulty": "easy",
            "time_limit": 5,
            "test_cases": [],  # The C test harness reads its own cases
            "sample_input": "[2,7,11,15] 9",
            "sample_output": "[0,1]",
            "solution_template": "#include <stdio.h>\n// write your solution here\nint main() { return 0; }\n",
            "test_file": "two_sum_test.c",
        },
        {
            "title": "Longest Common Prefix",
            "description": (
                "Write a function to find the longest common prefix string amongst an array of strings.\n\n"
                "If there is no common prefix, return an empty string \"\"."
            ),
            "difficulty": "easy",
            "time_limit": 5,
            "test_cases": [],
            "sample_input": "[\"flower\", \"flow\", \"flight\"]",
            "sample_output": "fl",
            "solution_template": "#include <stdio.h>\n// write your solution here\nint main() { return 0; }\n",
            "test_file": "longest_common_prefix.c",
        },
    ]

    def handle(self, *args, **options):
        created = 0
        for prob in self.DEFAULT_PROBLEMS:
            if not Problem.objects.filter(title=prob["title"]).exists():
                Problem.objects.create(**prob)
                created += 1
        self.stdout.write(self.style.SUCCESS(f"Seeded {created} new problems.")) 