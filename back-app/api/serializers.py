from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Profile, DailyMetric, Exercise, WorkoutLog, WorkoutSet

#Обычные Serializers
class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['username'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Неверный логин или пароль.')
        data['user'] = user
        return data

class RegisterSerializer(serializers.Serializer):
    username   = serializers.CharField(max_length=150)
    password   = serializers.CharField(write_only=True, min_length=6)
    email      = serializers.EmailField(required=False, allow_blank=True)
    first_name = serializers.CharField(required=False, allow_blank=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError('Это имя уже занято.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username   = validated_data['username'],
            password   = validated_data['password'],
            email      = validated_data.get('email', ''),
            first_name = validated_data.get('first_name', ''),
        )
        Profile.objects.create(user=user)   
        return user

#ModelSerializers
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email    = serializers.CharField(source='user.email',    read_only=True)

    class Meta:
        model  = Profile
        fields = ['username', 'email', 'weight', 'goal', 'age', 'bio', 'gender']

class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Exercise
        fields = ['id', 'name', 'category', 'description']


class WorkoutSetSerializer(serializers.ModelSerializer):
    exercise_name = serializers.CharField(source='exercise.name', read_only=True)

    class Meta:
        model  = WorkoutSet
        fields = ['id', 'exercise', 'exercise_name', 'reps', 'weight', 'set_number']


class WorkoutLogSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True)

    class Meta:
        model  = WorkoutLog
        fields = ['id', 'title', 'start_time', 'end_time', 'notes', 'sets']
    
    def create(self, validated_data):
        sets_data = validated_data.pop('sets')
        workout = WorkoutLog.objects.create(**validated_data)
        for set_data in sets_data:
            WorkoutSet.objects.create(workout=workout, **set_data)
        return workout

class DailyMetricSerializer(serializers.ModelSerializer):
    has_workout = serializers.BooleanField(read_only=True)

    class Meta:
        model = DailyMetric
        fields = ['id', 'date', 'calories_consumed', 'sleep_hours', 'workout_done', 'has_workout']