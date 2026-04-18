import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Chart, registerables } from 'chart.js';
import { Workout } from '../../models/exercise.model';

Chart.register(...registerables);

@Component({
  selector: 'app-stats',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './stats.html',
  styleUrl: './stats.css'
})
export class Stats implements OnInit, AfterViewInit {
  @ViewChild('caloriesChart') chartRef!: ElementRef<HTMLCanvasElement>;

  workouts: Workout[] = [];

  totalCalories = 0;
  weeklyWorkouts = 0;
  bmi: number | null = null;

  private chartInstance: Chart | null = null;
  private viewInitialized = false;

  ngOnInit(): void {
    this.loadData();
    this.calculateStats();
  }

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.renderChart();
  }

  loadData(): void {
    const savedWorkouts = localStorage.getItem('fitness_workouts');
    if (savedWorkouts) {
      this.workouts = JSON.parse(savedWorkouts);
    } else {
      this.workouts = [];
    }

    const savedProfile = localStorage.getItem('fitness_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);

      if (profile.weight && profile.height) {
        const heightM = profile.height / 100;
        this.bmi = +(profile.weight / (heightM * heightM)).toFixed(1);
      } else {
        this.bmi = null;
      }
    } else {
      this.bmi = null;
    }
  }

  calculateStats(): void {
    const last7Days = this.getLast7Days();

    const weekly = this.workouts.filter(workout =>
      last7Days.includes((workout.date || '').slice(0, 10))
    );

    this.weeklyWorkouts = weekly.length;
    this.totalCalories = weekly.reduce(
      (sum, workout) => sum + (workout.kcal_burn || 0),
      0
    );
  }

  renderChart(): void {
    if (!this.viewInitialized || !this.chartRef) return;

    const canvas = this.chartRef.nativeElement;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const last7Days = this.getLast7Days();

    const caloriesPerDay = last7Days.map(day => {
      return this.workouts
        .filter(workout => (workout.date || '').slice(0, 10) === day)
        .reduce((sum, workout) => sum + (workout.kcal_burn || 0), 0);
    });

    this.chartInstance = new Chart(canvas, {
      type: 'line',
      data: {
        labels: last7Days.map(day => {
          const parts = day.split('-');
          return `${parts[2]}.${parts[1]}`;
        }),
        datasets: [
          {
            label: 'Calories Burned',
            data: caloriesPerDay,
            borderColor: '#d4ff00',
            backgroundColor: 'rgba(212, 255, 0, 0.14)',
            borderWidth: 3,
            fill: true,
            tension: 0.35,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#d4ff00',
            pointBorderColor: '#d4ff00'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 500
        },
        plugins: {
          legend: {
            labels: {
              color: '#f4f4f5'
            }
          },
          tooltip: {
            backgroundColor: '#111214',
            titleColor: '#f4f4f5',
            bodyColor: '#d4ff00',
            borderColor: 'rgba(212, 255, 0, 0.2)',
            borderWidth: 1
          }
        },
        scales: {
          x: {
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: '#a1a1aa'
            },
            grid: {
              color: 'rgba(255,255,255,0.06)'
            }
          }
        }
      }
    });
  }

  getLast7Days(): string[] {
    const days: string[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().slice(0, 10));
    }

    return days;
  }
}