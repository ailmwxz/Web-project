import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { User } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = 'http://127.0.0.1:8000/api'; 

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

getHeaders() {
  const token = localStorage.getItem('fitness_token');
  return {
    headers: new HttpHeaders({
      'Authorization': `Bearer ${token}` 
    })
  };
}

  // --- AUTH ---
login(credentials: any): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/login/`, credentials).pipe(
    tap(res => {
      if (res.access) {
        localStorage.setItem('fitness_token', res.access);
        localStorage.setItem('fitness_refresh', res.refresh);
        
        const userData: any = { username: res.username };
        localStorage.setItem('fitness_user', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
      }
    })
  );
}

logout(): void {
    localStorage.removeItem('fitness_token');
    localStorage.removeItem('fitness_user');
    localStorage.removeItem('fitness_refresh');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
}

register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/`, userData).pipe(
      catchError(this.handleError)
    );
}

  // --- PROFILE ---
getProfile(): Observable<any> {
  return this.http.get(`${this.apiUrl}/profile/`, this.getHeaders());
}

updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
 }


getDashboardData(): Observable<any> {
  return this.http.get(`${this.apiUrl}/dashboard-summary/`, this.getHeaders()).pipe(
  catchError(this.handleError));
  }

getWorkouts(): Observable<any> {
  return this.http.get(`${this.apiUrl}/workouts/`, this.getHeaders());
}

addWorkout(workoutData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/workouts/`, workoutData, this.getHeaders());
}

deleteWorkout(id: number): Observable<any> {
  return this.http.delete(`${this.apiUrl}/workouts/${id}/`, this.getHeaders());
}

  // --- HELPERS ---
private getUserFromStorage(): User | null {
  const userJson = localStorage.getItem('fitness_user');
  try { return userJson ? JSON.parse(userJson) : null; } 
  catch (e) { return null; }
}

private handleError(error: any) {
  const msg = error.error?.detail || error.error?.message || 'Server error';
  return throwError(() => new Error(msg));
  }

getDailyMetrics(): Observable<any> {
  return this.http.get(`${this.apiUrl}/daily-metrics/`, this.getHeaders());
}

updateDailyMetrics(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/daily-metrics/`, data, this.getHeaders());
}

getAIAdvice(): Observable<any> {
  return this.http.get(`${this.apiUrl}/ai-advice/`, this.getHeaders());
}

isAuthenticated(): boolean {
  return !!localStorage.getItem('fitness_token');
}

addSet(setData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/workout-sets/`, setData, this.getHeaders());
}

getExercises(): Observable<any> {
  return this.http.get(`${this.apiUrl}/exercises/`, this.getHeaders());
}

createExercise(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/exercises/`, data, this.getHeaders());
}
}