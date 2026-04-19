import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, Workout } from '../../models/exercise.model';

interface ProfileDetails {
  age: number | null;
  weight: number | null;
  height: number | null;
  gender: string;
  goal: string;
  memberSince: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  public authService = inject(AuthService);

  currentUser: User | null = null;
  isEditModalOpen = false;

  profile: ProfileDetails = {
    age: 30,
    weight: 72,
    height: 178,
    gender: "Man",
    goal: 'maintenance',
    memberSince: 'January 2026'
  };

  editForm: ProfileDetails = {
    age: null,
    weight: null,
    height: null,
    gender: '',
    goal: '',
    memberSince: ''
  };

  workouts: Workout[] = [];

  constructor() {
    this.loadUser();
    this.loadProfile();
    this.loadWorkouts();
  }

  get displayName(): string {
    return this.currentUser?.username || 'User';
  }

  get todayActivities(): number {
    const today = new Date().toISOString().slice(0,10);
    return this.workouts.filter(w => (w.date || '').slice(0,10) === today).length;
  }

  loadUser(): void {
    const savedUser = localStorage.getItem('fitness_user');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }
loadProfile(): void {
  this.authService.getProfile().subscribe({
    next: (data) => {
      this.profile = data;
    },
    error: (err) => console.error('Ошибка загрузки профиля', err)
  });
}

saveProfile(): void {
  // 1. Копируем данные из формы
  const dataToSend: any = { ...this.editForm };

  // 2. ЧИСТКА: Удаляем поля, которые Django запрещает менять (Read-only)
  // Именно они чаще всего дают ошибку 400 при методе PUT
  delete dataToSend.memberSince;
  delete dataToSend.username;
  delete dataToSend.email;

  // 3. ПРЕОБРАЗОВАНИЕ ТИПОВ: Инпуты всегда шлют строки, а нам нужны числа или null
  dataToSend.age = dataToSend.age ? Number(dataToSend.age) : null;
  dataToSend.weight = dataToSend.weight ? Number(dataToSend.weight) : null;
  dataToSend.height = dataToSend.height ? Number(dataToSend.height) : null;

  // 4. ГИГИЕНА СТРОК: Не шлем пустые строки в Choices
  if (!dataToSend.gender || dataToSend.gender.trim() === '') {
    delete dataToSend.gender; 
  }
  if (!dataToSend.goal || dataToSend.goal.trim() === '') {
    delete dataToSend.goal;
  }

  console.log('Финальные данные перед отправкой:', dataToSend);

  this.authService.updateProfile(dataToSend).subscribe({
    next: (updatedData) => {
      this.profile = updatedData; 
      this.isEditModalOpen = false;
      alert('Профиль успешно обновлен!');
    },
    error: (err) => {
      console.error('Сервер ругается на:', err.error);
      alert('Ошибка 400: ' + JSON.stringify(err.error));
    }
  });
}

  loadWorkouts(): void {
    const savedWorkouts = localStorage.getItem('fitness_workouts');
    if(savedWorkouts){
      this.workouts = JSON.parse(savedWorkouts);
    }
  }

  openEditProfile(): void {
    this.editForm = { ...this.profile };
    this.isEditModalOpen = true;
  }

  closeEditProfile(): void {
    this.isEditModalOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}