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
    // Загрузка списка упражнений для селекта
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
      this.loadSetsForWorkout(this.currentWorkoutId);
    } else {
      // ИСПРАВЛЕНО: Отправляем объект с title и start_time
      const workoutData = {
        title: sessionTitle,
        start_time: new Date().toISOString()
      };

      this.authService.addWorkout(workoutData).subscribe({
        next: (res: any) => {
          this.currentWorkoutId = res.id;
          console.log(`Создана сессия ID: ${res.id}`);
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Ошибка 400: Проверь формат JSON или поля на бэкенде', err);
          alert('Не удалось создать тренировку.');
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
        }
      }
    });
  }

  logSet() {
    if (!this.currentWorkoutId || !this.selectedExerciseId || !this.reps) return;

    const setData = {
      workout: this.currentWorkoutId,
      exercise: parseInt(this.selectedExerciseId), 
      reps: this.reps,
      weight: this.weight || 0 
    };

    this.authService.addSet(setData).subscribe({
      next: (res: any) => {
        const ex = this.exercises.find(e => e.id.toString() === this.selectedExerciseId);
        this.addedSets.unshift({ 
          name: ex ? ex.name : 'Упражнение', 
          reps: this.reps, 
          weight: this.weight || 0 
        });
        this.reps = undefined; 
        this.cdr.detectChanges();
      }
    });
  }

  finish() { this.router.navigate(['/workouts']); }
}