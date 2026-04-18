import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
import { DashboardComponent } from './components/dashboard/dashboard';
import { WorkoutsComponent } from './components/exercise-list/exercise-list';

import { authGuard } from './guards/auth.guard';
import { Profile } from './components/profile/profile';
import { Stats } from './components/stats/stats';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent},
  { path: 'workouts', component: WorkoutsComponent},
  { path: 'profile', component: Profile},
  { path: 'stats', component: Stats},

];