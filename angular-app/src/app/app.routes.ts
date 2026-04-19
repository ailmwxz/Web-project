import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login'; 
import { DashboardComponent } from './components/dashboard/dashboard';
import { WorkoutsComponent } from './components/workouts/workouts';
import { RegisterComponent } from './components/register/register';
import { Profile } from './components/profile/profile';
import { Stats } from './components/stats/stats';
import { CoachComponent } from './components/coach/coach';
import { WorkoutSessionComponent } from './components/workout-session/workout-session';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, 
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'coach', component: CoachComponent },
  { path: 'workouts', component: WorkoutsComponent },
  { path: 'profile', component: Profile },
  { path: 'stats', component: Stats },
  { path: 'workout-session', component: WorkoutSessionComponent },
];