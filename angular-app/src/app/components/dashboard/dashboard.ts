import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = true;
  
  data: any = { 
    dailyCalories: 0, 
    goalCalories: 2500, 
    recentWorkouts: [] 
  };

  dailyMetrics = { 
    calories: 0, 
    sleep: 0, 
    workoutDone: false 
  };

  quickCardio = {
    type: '',
    duration: null as number | null,
    kcal: null as number | null
  };

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.authService.getDashboardData().subscribe({
      next: (res: any) => {
        this.data = res;
        this.authService.getDailyMetrics().subscribe({
          next: (m: any) => {
            if (m) {
              this.dailyMetrics = {
                calories: m.calories || 0,
                sleep: m.sleep || 0,
                workoutDone: m.workoutDone || false
              };
              // СИНХРОНИЗАЦИЯ: Чтобы прогресс-бар сверху видел калории из метрик
              this.data.dailyCalories = this.dailyMetrics.calories;
            }
            this.isLoading = false;
          },
          error: () => this.isLoading = false
        });
      },
      error: () => this.isLoading = false
    });
  }

  saveDailyMetrics() {
    this.authService.updateDailyMetrics(this.dailyMetrics).subscribe({
      next: () => {
        alert('Статус дня обновлен!');
        this.loadData(); 
      },
      error: (err) => console.error(err)
    });
  }

addQuickCardio() {
  if (!this.quickCardio.type) return;

  // 1. Формируем объект, а не строку!
  const workoutData = { 
    title: `🏃 ${this.quickCardio.type} (${this.quickCardio.duration || 0}m)` 
  };
  
  this.authService.addWorkout(workoutData).subscribe({
    next: () => {
      // 2. Логика ККАЛ: Сначала обновляем локально, потом шлем на сервер
      if (this.quickCardio.kcal) {
        this.dailyMetrics.calories = Number(this.dailyMetrics.calories) + Number(this.quickCardio.kcal);
        
        this.authService.updateDailyMetrics(this.dailyMetrics).subscribe({
          next: () => {
            this.loadData();
            this.resetQuickCardio();
          }
        });
      } else {
        this.loadData();
        this.resetQuickCardio();
      }
    },
    error: (err) => console.error('Ошибка при добавлении кардио:', err)
  });
}

private resetQuickCardio() {
  this.quickCardio = { type: '', duration: null, kcal: null };
}
  deleteWorkout(id: number) {
    if (confirm('Удалить запись?')) {
      this.authService.deleteWorkout(id).subscribe({
        next: () => this.loadData()
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}