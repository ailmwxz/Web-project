import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './workouts.html',
  styleUrls: ['./workouts.css']
})
export class WorkoutsComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router); 

  workouts: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadWorkouts();
  }

  loadWorkouts() {
    this.isLoading = true;
    this.authService.getWorkouts().subscribe({
      next: (res: any) => {
        this.workouts = res;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Ошибка загрузки:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  startNewSession() {
    const defaultName = `Тренировка ${new Date().toLocaleDateString()}`;
    const title = prompt('Введите название тренировки:', defaultName);
    
    if (title !== null) { 
      this.router.navigate(['/workout-session'], { queryParams: { title: title || defaultName } });
    }
  }

  goToWorkout(id: number) {
    this.router.navigate(['/workout-session'], { queryParams: { id: id } });
  }

  deleteWorkout(id: number) {
    if (confirm('Удалить эту тренировку из истории?')) {
      this.authService.deleteWorkout(id).subscribe(() => {
        this.workouts = this.workouts.filter(w => w.id !== id);
        this.cdr.detectChanges();
      });
    }
  }

  logout() {
    this.authService.logout();
  }
}