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
    goal: 'Maintain Weight',
    memberSince: 'January 2026'
  };

  editForm: ProfileDetails = {
    age: null,
    weight: null,
    height: null,
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
    const savedProfile = localStorage.getItem('fitness_profile');
    if (savedProfile) {
      this.profile = JSON.parse(savedProfile);
    }
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

  saveProfile(): void {
    this.profile = { ...this.editForm };
    localStorage.setItem('fitness_profile', JSON.stringify(this.profile));
    this.isEditModalOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }
}