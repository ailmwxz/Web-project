import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-coach',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './coach.html',
  styleUrls: ['./coach.css']
})
export class CoachComponent implements OnInit {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  isLoading = false;
  advice: string = '';
  debugInfo: string = '';

  ngOnInit() {
    this.getAdvice();
  }

  getAdvice() {
    this.isLoading = true;
    this.advice = '';
    this.cdr.detectChanges();

    this.authService.getAIAdvice().subscribe({
      next: (res: any) => {
        this.advice = res.advice;
        this.debugInfo = res.debug_info;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('AI Error:', err);
        this.advice = "Система временно недоступна. Попробуй позже. <3";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}