from django.urls import path
from .views import (
    register_view, LoginView, LogoutView, 
    ProfileView, WorkoutListView, WorkoutDetailView,
    get_ai_advice, get_daily_summary
)

urlpatterns = [
    path('register/', register_view),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('workouts/', WorkoutListView.as_view()),
    path('workouts/<int:pk>/', WorkoutDetailView.as_view()),
    path('ai-advice/', get_ai_advice),
    path('summary/', get_daily_summary),
]