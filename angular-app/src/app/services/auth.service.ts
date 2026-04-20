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

  // Помогашка для заголовков, чтобы не дублировать код
  private getHeaders(): { headers: HttpHeaders } {
    const token = localStorage.getItem('fitness_token');
    return {
      headers: new HttpHeaders().set('Authorization', `Token ${token}`)
    };
  }

  // --- AUTH ---
  login(credentials: { username: string, password: string }): Observable<any> {
  // Теперь credentials — это объект, и мы его целиком шлем в POST
  return this.http.post<any>(`${this.apiUrl}/login/`, credentials).pipe(
    tap(response => {
      if (response.token) {
        const userData: User = {
          id: response.user_id || 0,
          username: credentials.username, // берем из входных данных
          token: response.token
        };
        localStorage.setItem('fitness_token', response.token);
        localStorage.setItem('fitness_user', JSON.stringify(userData));
        this.currentUserSubject.next(userData);
      }
    }),
    catchError(this.handleError)
  );
}

  logout(): void {
    localStorage.removeItem('fitness_token');
    localStorage.removeItem('fitness_user');
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
    return this.http.get(`${this.apiUrl}/profile/`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile/`, data, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // --- DASHBOARD & METRICS (Те самые методы, которых не хватало) ---
  getDashboardData(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-summary/`, this.getHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  // Метод для добавления тренировки 
  // src/app/services/auth.service.ts

getWorkouts(): Observable<any> {
  return this.http.get(`${this.apiUrl}/workouts/`, this.getHeaders());
}

// Этот метод нужен для твоего Дашборда (кнопка APPEND LOG)
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

getExercises(): Observable<any> {
  return this.http.get(`${this.apiUrl}/exercises/`, this.getHeaders());
}

createExercise(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/exercises/`, data, this.getHeaders());
}

createWorkoutLog(title: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/workouts/`, { title }, this.getHeaders());
}

createWorkout(title: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/workouts/`, { title }, this.getHeaders());
}

addSet(setData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/workout-sets/`, setData, this.getHeaders());
}
}