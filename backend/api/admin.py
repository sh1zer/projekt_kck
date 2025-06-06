from django.contrib import admin
from .models import Problem

@admin.register(Problem)
class ProblemAdmin(admin.ModelAdmin):
    list_display = ('title', 'difficulty', 'time_limit', 'created_at')
    list_filter = ('difficulty', 'created_at')
    search_fields = ('title', 'description')
