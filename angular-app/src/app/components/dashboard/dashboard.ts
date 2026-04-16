import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FitnessService } from '../../services/fitness.service';
import { DashboardData, Workout } from '../../models/exercise.model';
import { AuthService } from '../../services/auth.service';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit{
  public authService = inject(AuthService);
  
  data: DashboardData | null = null;
  isLoading = false;
  actionError = '';

  // Form model for [(ngModel)]
  newWorkout: Workout = { 
    id: 0, name: '', duration: 0, kcal_burn: 0, 
    difficulty: 'Easy', date: new Date().toISOString() 
  };

  ngOnInit() {
    this.simulateLoad();
  }

  simulateLoad() {
    // Artificial delay to see the "Syncing" animation for just a second
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
      this.data.recentWorkouts.unshift(workoutToAdd); // Add to local list
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
    this.newWorkout = { id: 0, name: '', duration: 0, kcal_burn: 0, difficulty: 'Easy', date: new Date().toISOString() };
  }
}