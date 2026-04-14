import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  user = {
    name: 'Атлет',
    weight: 80,
    goal: 75
  };

  workouts = [
    { title: 'Приседания', reps: '3x15', status: 'Done' },
    { title: 'Отжимания', reps: '4x20', status: 'Pending' },
    { title: 'Планка', reps: '3 мин', status: 'Pending' }
  ];

  updateWeight() {
    alert(`Вес обновлен: ${this.user.weight} кг. До цели: ${this.user.weight - this.user.goal} кг!`);
  }
}