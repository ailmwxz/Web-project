import requests
import json
import os
from django.db import models
from dotenv import load_dotenv
from django.utils import timezone
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.authentication import TokenAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework import generics

from .models import Profile, Exercise, WorkoutLog, WorkoutSet, DailyMetric
from .serializers import (
    LoginSerializer, RegisterSerializer,
    ProfileSerializer, ExerciseSerializer,
    WorkoutLogSerializer, WorkoutSetSerializer
)

load_dotenv()


# Авторизация
#FBV1
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'username': user.username}, status=status.HTTP_201_CREATED) 

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'username': user.username})

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

#FBV2 - инфа, сколько всего тренировок сделал юзер
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_daily_summary(request):
    total = WorkoutLog.objects.filter(user=request.user).count()
    return Response({
        "total_workouts": total, 
        "date": timezone.now().date()
    })

#FBV2 - ии повестка дня 
@api_view(['GET'])
@permission_classes([IsAuthenticated]) 
def get_ai_advice(request):
    if request.user.is_authenticated:
        profile = request.user.profile
        goal = profile.get_goal_display()
        weight = profile.weight
        metric = DailyMetric.objects.filter(user=request.user).last()
        kcal = metric.calories_consumed if metric else 0
        sleep = metric.sleep_hours if metric else 0
    else:
        # если без логина (Аноним)
        goal, weight, kcal, sleep = "Силовая", 70, 0, 0

    #промпт
    prompt_content = f"Цель: {goal}, Вес: {weight}кг, Ккал съедено: {kcal}, Сон: {sleep}ч."

    system_rules = (
        """Ты — фитнес-коуч. Дай КОРОТКИЙ (1–3 предложения) практический совет дня.
        Данные пользователя: Сон, тренировка, время тренировки(утро / день / вечер),
        ККал съедено(учитывай время, ибо не все приемы пищи до тренировки), цель.
        В конце сообщения добавь <3

        Правила:
        -Всегда сообщение только на "Вы".
        -Если день ещё не завершён, НЕ делай окончательных выводов по калориям
        - Вместо этого давай рекомендацию на оставшуюся часть дня
        - Учитывай, что после утренней тренировки пользователь ещё может поесть
        - Если сон < 6 часов — упомяни восстановление
        - Если была силовая — учитывай важность белка и энергии
        - Без осуждения, без воды, конкретно

        Ограничения:
        - До 30 слов
        - Минимум 1 конкретное действие
        - Пиши на русском"""
    )

    # запрос к Groq
    try:
        api_key = os.getenv("GROQ_API_KEY")        
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "system", "content": system_rules},
                    {"role": "user", "content": prompt_content}
                ]
            },
            timeout=5
        )
        data = response.json()
        advice = data['choices'][0]['message']['content']
    except Exception as e:
        #если что-то не так (нет ключа или инета), ошибка в консоли и сообщение 
        print(f"Ошибка ИИ: {e}")
        advice = "Сегодня просто отдохни. Но не забывай, дисциплина — залог успеза!"
    return Response({"advice": advice, "debug_info": prompt_content})

# --- CBV Section ---

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        profile, created = Profile.objects.get_or_create(user=request.user)
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)
    def put(self, request):
        profile = get_object_or_404(Profile, user=request.user)
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class WorkoutListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        workouts = WorkoutLog.objects.filter(user=request.user).order_by('-start_time')
        return Response(WorkoutLogSerializer(workouts, many=True).data)
    def post(self, request):
        serializer = WorkoutLogSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class WorkoutDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def _get_obj(self, pk, user):
        return get_object_or_404(WorkoutLog, pk=pk, user=user)
    def get(self, request, pk):
        return Response(WorkoutLogSerializer(self._get_obj(pk, request.user)).data)
    def delete(self, request, pk):
        self._get_obj(pk, request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class DailyMetricView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        today = timezone.now().date()
        metric = DailyMetric.objects.filter(user=request.user, date=today).first()
        
        data = {
            "calories": metric.calories_consumed if metric else 0,
            "sleep": metric.sleep_hours if metric else 0,
            "workoutDone": metric.workout_done if metric else False
        }
        return Response(data)

    def post(self, request):
        today = timezone.now().date()
        
        metric, created = DailyMetric.objects.update_or_create(
            user=request.user, 
            date=today,
            defaults={
                'calories_consumed': request.data.get('calories', 0),
                'sleep_hours': request.data.get('sleep', 0),
                'workout_done': request.data.get('workoutDone', False)
            }
        )
        
        return Response({
            "status": "updated" if not created else "created",
            "date": today
        })

class ExerciseView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        exercises = Exercise.objects.filter(
            models.Q(created_by__isnull=True) | models.Q(created_by=request.user)
        ).order_by('name')
        serializer = ExerciseSerializer(exercises, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ExerciseSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(created_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WorkoutSetView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = WorkoutSetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, pk):
        set_obj = get_object_or_404(WorkoutSet, pk=pk, workout__user=request.user)
        set_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class WorkoutSetCreateView(generics.CreateAPIView):
    queryset = WorkoutSet.objects.all()
    serializer_class = WorkoutSetSerializer

    def post(self, request, *args, **kwargs):
        print("DEBUG DATA:", request.data) 
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        print("DEBUG ERRORS:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)