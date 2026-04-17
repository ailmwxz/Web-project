import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface Workout {
  id?: number;
  name: string;
  duration: number;
  kcal_burn: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  date: string;
}

interface DashboardData {
  dailyCalories: number;
  goalCalories: number;
  recentWorkouts: Workout[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {
  public authService = inject(AuthService);

  data: DashboardData | null = null;
  isLoading = true;
  actionError = '';

  newWorkout: Workout = {
    id: 0, name: '', duration: 0, kcal_burn: 0,
    difficulty: 'Easy', date: new Date().toISOString()
  };

  ngOnInit() {
    this.simulateLoad();
  }

  simulateLoad() {
    setTimeout(() => {
      this.data = {
        dailyCalories: 1420,
        goalCalories: 2200,
        recentWorkouts: [
          { id: 101, name: 'Power Yoga', duration: 40, kcal_burn: 210, difficulty: 'Easy', date: '2026-04-15' },
          { id: 102, name: 'Deadlift Session', duration: 55, kcal_burn: 480, difficulty: 'Hard', date: '2026-04-16' }
        ]
      };
      this.isLoading = false;
    }, 800);
  }

  saveWorkout() {
    if (this.data && this.newWorkout.name) {
      const workoutToAdd = { ...this.newWorkout, id: Math.floor(Math.random() * 1000) };
      this.data.recentWorkouts.unshift(workoutToAdd);
      this.resetForm();
    }
  }

  deleteWorkout(id: number) {
    if (this.data) {
      this.data.recentWorkouts = this.data.recentWorkouts.filter(w => w.id !== id);
    }
  }

  logout() {
    this.authService.logout();
  }

  private resetForm() {
    this.newWorkout = {
      id: 0, name: '', duration: 0, kcal_burn: 0,
      difficulty: 'Easy', date: new Date().toISOString()
    };
  }
}