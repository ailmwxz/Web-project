import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User, Workout } from '../../models/exercise.model';

interface ProfileDetails {
  username: string | undefined;
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
  private cdr = inject(ChangeDetectorRef);
  public authService = inject(AuthService);

  currentUser: User | null = null;
  isEditModalOpen = false;

  profile: ProfileDetails = {
  username: undefined,
  age: null,
  weight: null,
  height: null,
  gender: '',
  goal: '',
  memberSince: ''
};

editForm: ProfileDetails = {
  username: undefined,
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
  return this.profile.username || this.currentUser?.username || 'User';
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
      this.editForm = { ...data }; 
      this.cdr.detectChanges();  
    },
    error: (err) => console.error('Ошибка загрузки профиля', err)
  });
}

saveProfile(): void {
  const dataToSend: any = { ...this.editForm };

  delete dataToSend.memberSince;
  delete dataToSend.username;
  delete dataToSend.email;

  dataToSend.age = dataToSend.age ? Number(dataToSend.age) : null;
  dataToSend.weight = dataToSend.weight ? Number(dataToSend.weight) : null;
  dataToSend.height = dataToSend.height ? Number(dataToSend.height) : null;

  const validGenders = ['Man', 'Woman', 'Other'];
  if (!dataToSend.gender || !validGenders.includes(dataToSend.gender)) {
    delete dataToSend.gender; 
  }

  const validGoals = ['Muscle gain', 'Power', 'Сardio', 'Weight_loss', 'Maintenance'];
  if (!dataToSend.goal || !validGoals.includes(dataToSend.goal)) {
    delete dataToSend.goal;
  }

  console.log('Отправляем на сервер:', dataToSend);

  this.authService.updateProfile(dataToSend).subscribe({
    next: (updatedData) => {
      this.profile = updatedData;
      this.isEditModalOpen = false;
      alert('Profile updated successfully!');
    },
    error: (err) => {
      console.error('Django Error Details:', err.error);
      const serverError = JSON.stringify(err.error);
      alert('Server refused data: ' + serverError);
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