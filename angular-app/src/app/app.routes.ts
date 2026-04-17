import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login';
<<<<<<< HEAD

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
=======
import { DashboardComponent } from './components/dashboard/dashboard';


export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent},
  

>>>>>>> fb56709 (updated)
];