import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../../common/response-interface';
import { User, UserMacros, UserNeat, UserProfile, WorkoutLog } from '../../common/userInterface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = environment.apiUrl;

  getUser(): Observable<User> {
    const url = `${this.apiUrl}${environment.users.me}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  getProfile(): Observable<UserProfile> {
    const url = `${this.apiUrl}${environment.users.me}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data.profile));
  }

  findOne(userId: string): Observable<User> {
    const url = `${this.apiUrl}${environment.users.byId.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  update(userId: string, payload: any): Observable<User> {
    const url = `${this.apiUrl}${environment.users.byId.replace(':id', userId)}`;
    return this.http.patch<MessageApiResponse>(url, payload).pipe(map(res => res.data));
  }

  getMacros(userId: string): Observable<UserMacros> {
    const url = `${this.apiUrl}${environment.users.macros.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  getWorkoutLogs(userId: string): Observable<WorkoutLog[]> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  getWorkoutLogByDate(userId: string, date: string): Observable<WorkoutLog> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}/${date}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  addWorkoutLog(userId: string, log: WorkoutLog): Observable<User> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}`;
    return this.http.post<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }

  updateWorkoutLog(userId: string, date: string, log: WorkoutLog): Observable<User> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}/${date}`;
    return this.http.patch<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }
}
