from rest_framework import serializers
from .models import Problem

class ProblemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Problem
        fields = [
            'id', 'title', 'description', 'difficulty', 
            'time_limit', 'test_cases', 'sample_input', 
            'sample_output', 'solution_template', 'test_file'
        ]