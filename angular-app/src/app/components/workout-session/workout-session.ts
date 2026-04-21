import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-workout-session',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './workout-session.html',
  styleUrls: ['./workout-session.css']
})
export class WorkoutSessionComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef); 

  exercises: any[] = [];
  currentWorkoutId: number | null = null;
  
  selectedExerciseId: string = "";
  reps: number | undefined;
  weight: number | undefined;
  
  addedSets: any[] = [];

  ngOnInit() {
    this.authService.getExercises().subscribe({
      next: (data) => {
        this.exercises = data;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Ошибка загрузки упражнений:', err)
    });
    
    const existingId = this.route.snapshot.queryParams['id'];
    const sessionTitle = this.route.snapshot.queryParams['title'] || 'Новая тренировка';

    if (existingId) {
      this.currentWorkoutId = parseInt(existingId);
      console.log('Открыта существующая сессия ID:', this.currentWorkoutId);
      this.loadSetsForWorkout(this.currentWorkoutId);
    } else {
      this.authService.addWorkout(sessionTitle).subscribe({
        next: (res: any) => {
          this.currentWorkoutId = res.id;
          console.log(`Создана новая сессия: ${sessionTitle} (ID: ${res.id})`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Ошибка при создании сессии:', err);
          alert('Не удалось создать тренировку в базе данных.');
        }
      });
    }
  }

  loadSetsForWorkout(id: number) {
    this.authService.getWorkouts().subscribe({
      next: (workouts: any[]) => {
        const current = workouts.find(w => w.id === id);
        if (current && current.sets) {
          this.addedSets = current.sets.map((s: any) => ({
            name: s.exercise_name, 
            reps: s.reps,
            weight: s.weight
          }));
          this.cdr.detectChanges(); 
          console.log('Подходы подгружены:', this.addedSets);
        }
      },
      error: (err) => console.error('Ошибка при подгрузке сетов:', err)
    });
  }

  // Сохранение нового подхода
  logSet() {
    if (!this.currentWorkoutId) {
      alert("Ошибка: Тренировка еще не инициализирована.");
      return;
    }

    if (!this.selectedExerciseId || !this.reps || this.reps <= 0) {
      alert("Выберите упражнение и укажите количество повторений!");
      return;
    }

    const setData = {
      workout: this.currentWorkoutId,
      exercise: parseInt(this.selectedExerciseId), 
      reps: this.reps,
      weight: this.weight || 0 
    };

    this.authService.addSet(setData).subscribe({
      next: (res: any) => {
        const exercise = this.exercises.find(e => e.id.toString() === this.selectedExerciseId);
        
        this.addedSets.unshift({ 
          name: exercise ? exercise.name : 'Упражнение', 
          reps: this.reps, 
          weight: this.weight || 0 
        });
        
        this.reps = undefined; 
        this.cdr.detectChanges(); 
        console.log('Сет успешно сохранен в БД');
      },
      error: (err) => {
        console.error('Ошибка сохранения сета:', err);
        alert('Сервер вернул ошибку при сохранении подхода.');
      }
    });
  }

  finish() {
    this.router.navigate(['/workouts']);
  }
}