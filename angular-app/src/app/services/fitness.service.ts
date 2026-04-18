import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DashboardData, Workout } from '../models/exercise.model';

@Injectable({
  providedIn: 'root'
})
export class FitnessService {
  private http = inject(HttpClient);
  private apiUrl = 'https://api.fitnessapp.com/v1';

  getDashboard(): Observable<DashboardData> {
    return this.http
      .get<DashboardData>(`${this.apiUrl}/dashboard`)
      .pipe(catchError(this.handleError));
  }

  getWorkouts(): Observable<Workout[]> {
    return this.http
      .get<Workout[]>(`${this.apiUrl}/workouts`)
      .pipe(catchError(this.handleError));
  }

  addWorkout(workout: Workout): Observable<Workout> {
    return this.http
      .post<Workout>(`${this.apiUrl}/workouts`, workout)
      .pipe(catchError(this.handleError));
  }

  deleteWorkout(id: number): Observable<void> {
    return this.http
      .delete<void>(`${this.apiUrl}/workouts/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = `Server Error code ${error.status}: ${error.message}`;
    }

    return throwError(() => new Error(errorMessage));
  }
}