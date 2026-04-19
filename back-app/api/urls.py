from django.urls import path
from .views import (
    register_view, LoginView, LogoutView, 
    ProfileView, WorkoutListView, WorkoutDetailView,
    get_ai_advice, get_daily_summary, DailyMetricView, ExerciseView, WorkoutSetView, WorkoutSetCreateView,
)

urlpatterns = [
    path('register/', register_view),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('workouts/', WorkoutListView.as_view()),
    path('workouts/<int:pk>/', WorkoutDetailView.as_view()),
    path('ai-advice/', get_ai_advice),
    path('daily-metrics/', DailyMetricView.as_view(), name='daily-metrics'),
    path('summary/', get_daily_summary),
    path('exercises/', ExerciseView.as_view(), name='exercises'),
    path('workout-sets/', WorkoutSetView.as_view(), name='workout-sets'),
    path('workout-sets/', WorkoutSetCreateView.as_view(), name='add-set'),
    path('workout-sets/<int:pk>/', WorkoutSetView.as_view(), name='workout-set-detail'),
]