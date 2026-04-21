from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    register_view, ProfileView, WorkoutListView, WorkoutDetailView,
    get_ai_advice, get_daily_summary, DailyMetricView, ExerciseView, 
    WorkoutSetView, WorkoutSetCreateView,
)

urlpatterns = [
    path('register/', register_view),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('profile/', ProfileView.as_view()),
    path('summary/', get_daily_summary),
    path('ai-advice/', get_ai_advice),
    path('daily-metrics/', DailyMetricView.as_view(), name='daily-metrics'),
    
    path('workouts/', WorkoutListView.as_view()),
    path('workouts/<int:pk>/', WorkoutDetailView.as_view()),
    path('exercises/', ExerciseView.as_view(), name='exercises'),
    path('workout-sets/', WorkoutSetView.as_view(), name='workout-sets'),
    # path('workout-sets/', WorkoutSetCreateView.as_view(), name='add-set'),
    path('workout-sets/<int:pk>/', WorkoutSetView.as_view(), name='workout-set-detail'),
]