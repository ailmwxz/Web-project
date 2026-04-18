from django.db import models
from django.contrib.auth.models import User

#Профиль пользователя
class Profile(models.Model):
    GOALS = [
        ('muscle gain', 'Набор массы'),
        ('power', 'Силовая'),
        ('cardio', 'Кардио / Выносливость'),
        ('weight_loss', 'Похудение'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    weight = models.FloatField(null=True, blank=True)
    goal = models.CharField(max_length=20, choices=GOALS, default='power')    
    age = models.PositiveIntegerField(null=True, blank=True)
    bio = models.TextField(blank=True, default='')
    GENDER_CHOICES = [('Man', 'Мужчина'), ('Woman', 'Женщина'),('other', 'Другой'),]
    gender = models.CharField(max_length=10, choices = GENDER_CHOICES)

    def __str__(self):
        return f'Profile({self.user.username})'

#Дневные показатели
class DailyMetric(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    calories_consumed = models.IntegerField(default=0)
    sleep_hours = models.FloatField(default=0)
    workout_done = models.BooleanField(default=False)

    class Meta:
        unique_together = ('user', 'date')

#Упражнение
class Exercise(models.Model):
    CATEGORY_CHOICES = [
        ('chest',    'Грудь'),
        ('back',     'Спина'),
        ('legs',     'Ноги'),
        ('arms',     'Руки'),
        ('shoulders','Плечи'),
        ('cardio',   'Кардио'),
        ('core',     'Пресс'),
        ]
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True, default='')
    instruction_url = models.URLField(max_length=500, blank=True, null=True)
    image = models.ImageField(upload_to='exercises/', null=True, blank=True)
# ForeignKey1
    created_by = models.ForeignKey(User, related_name='exercises', on_delete=models.SET_NULL,
        null=True, blank=True,)

    def __str__(self):
        return self.name

#Запись тренирови пользователя + # ForeignKey2
class WorkoutLog(models.Model):
    user  = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workouts')  
    title = models.CharField(max_length=120, default='Тренировка')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-start_time']

    @property
    def duration(self):
        if self.end_time and self.start_time:
            return self.end_time - self.start_time
        return None

    def __str__(self):
        return f"{self.user.username} — {self.title} ({self.start_time.strftime('%Y-%m-%d %H:%M')})"
    
#Подход 
class WorkoutSet(models.Model):
    workout = models.ForeignKey(WorkoutLog, on_delete=models.CASCADE, related_name='sets') 
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name='sets') 
    reps = models.PositiveIntegerField()
    weight = models.FloatField(null=True, blank=True)  
    set_number = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['set_number']

    def __str__(self):
        return f'{self.exercise.name}: {self.reps}×{self.weight}kg'