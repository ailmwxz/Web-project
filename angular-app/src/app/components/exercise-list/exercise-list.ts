import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Workout } from '../../models/exercise.model';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './exercise-list.html',
  styleUrl: './exercise-list.css'
})
export class WorkoutsComponent {
  public authService = inject(AuthService);

  isLoading = false;
  errorMessage = '';
  isModalOpen = false;
  isCustomMode = false;

  workouts: Workout[] = [
    {
      id: 1,
      name: 'Weight Training',
      duration: 30,
      kcal_burn: 180,
      difficulty: 'Hard',
      date: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Yoga',
      duration: 30,
      kcal_burn: 120,
      difficulty: 'Easy',
      date: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Walking',
      duration: 15,
      kcal_burn: 75,
      difficulty: 'Easy',
      date: new Date().toISOString()
    }
  ];

  quickActivities = [
    { name: 'Walking', duration: 15, kcal_burn: 75, difficulty: 'Easy' as const },
    { name: 'Running', duration: 25, kcal_burn: 180, difficulty: 'Hard' as const },
    { name: 'Cycling', duration: 30, kcal_burn: 200, difficulty: 'Medium' as const },
    { name: 'Swimming', duration: 30, kcal_burn: 300, difficulty: 'Medium' as const },
    { name: 'Yoga', duration: 30, kcal_burn: 120, difficulty: 'Easy' as const },
    { name: 'Weight Training', duration: 30, kcal_burn: 180, difficulty: 'Hard' as const }
  ];

  formModel: {
    name: string;
    duration: number;
    kcal_burn: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  } = this.getEmptyForm();

  private getEmptyForm() {
    return {
      name: '',
      duration: 0,
      kcal_burn: 0,
      difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard'
    };
  }

  get todayWorkouts(): Workout[] {
    const today = new Date().toISOString().slice(0, 10);
    return this.workouts.filter(w => (w.date || '').slice(0, 10) === today);
  }

  get totalActiveMinutes(): number {
    return this.todayWorkouts.reduce((sum, item) => sum + (item.duration || 0), 0);
  }

  openQuickActivityModal(activity: {
    name: string;
    duration: number;
    kcal_burn: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
  }): void {
    this.errorMessage = '';
    this.isCustomMode = false;
    this.formModel = {
      name: activity.name,
      duration: activity.duration,
      kcal_burn: activity.kcal_burn,
      difficulty: activity.difficulty
    };
    this.isModalOpen = true;
  }

  openCustomActivityModal(): void {
    this.errorMessage = '';
    this.isCustomMode = true;
    this.formModel = this.getEmptyForm();
    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.errorMessage = '';
    this.formModel = this.getEmptyForm();
    this.isCustomMode = false;
  }


  loadWorkouts(): void {
    const saved = localStorage.getItem('fitness_workouts');
    if(saved){
        this.workouts = JSON.parse(saved);
    }
  }

  ngOnInit(): void {
    this.loadWorkouts();
  }

  saveWorkouts(): void {
    localStorage.setItem('fitness_workouts', JSON.stringify(this.workouts));
  }

  addActivity(): void {
    this.errorMessage = '';

    if (!this.formModel.name.trim()) {
      this.errorMessage = 'Введите название активности';
      return;
    }

    if (this.formModel.duration <= 0) {
      this.errorMessage = 'Введите корректную длительность';
      return;
    }

    if (this.formModel.kcal_burn <= 0) {
      this.errorMessage = 'Введите корректное количество калорий';
      return;
    }

    const newWorkout: Workout = {
      id: Date.now(),
      name: this.formModel.name.trim(),
      duration: this.formModel.duration,
      kcal_burn: this.formModel.kcal_burn,
      difficulty: this.formModel.difficulty,
      date: new Date().toISOString()
    };

    this.workouts.unshift(newWorkout);
    this.saveWorkouts();
    this.closeModal();
  }

  deleteWorkout(id: number): void {
    this.workouts = this.workouts.filter(w => w.id !== id);
    this.saveWorkouts();
  }

  formatTime(date: string): string {
    const parsed = new Date(date);
    return parsed.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  logout(): void {
    this.authService.logout();
  }
}