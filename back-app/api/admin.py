from django.contrib import admin
from .models import User, Profile, Exercise, WorkoutLog, WorkoutSet, DailyMetric

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin): 
    list_display = ('user', 'gender', 'age', 'weight', 'goal')
    search_fields = ('user__username',)

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_by')
    list_filter = ('category',)
    search_fields = ('name',)
    prepopulated_fields = {'slug': ('name',)}

class WorkoutSetInline(admin.TabularInline):
    model = WorkoutSet
    extra = 1

@admin.register(WorkoutLog)
class WorkoutLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'id', 'start_time') 
    list_filter = ('start_time', 'user')
    search_fields = ('title', 'user__username')

@admin.register(DailyMetric)
class DailyMetricAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'calories_consumed', 'sleep_hours')
    list_filter = ('date', 'user')

@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    list_display = ('workout', 'exercise', 'weight', 'reps') 
    list_filter = ('workout', 'exercise', 'weight', 'reps')
