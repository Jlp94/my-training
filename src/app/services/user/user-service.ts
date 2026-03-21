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

  // Obtener el perfil completo del usuario autenticado (GET /users/me)
  getUser(): Observable<User> {
    const url = `${this.apiUrl}${environment.users.me}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  getProfile(): Observable<UserProfile> {
    const url = `${this.apiUrl}${environment.users.me}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data.profile));
  }

  // Obtener un usuario por ID (GET /users/:id)
  findOne(userId: string): Observable<User> {
    const url = `${this.apiUrl}${environment.users.byId.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Actualizar datos del usuario (PATCH /users/:id)
  update(userId: string, payload: any): Observable<User> {
    const url = `${this.apiUrl}${environment.users.byId.replace(':id', userId)}`;
    return this.http.patch<MessageApiResponse>(url, payload).pipe(map(res => res.data));
  }

  // Obtener macros del usuario
  getMacros(userId: string): Observable<UserMacros> {
    const url = `${this.apiUrl}${environment.users.macros.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener logs de NEAT (peso/pasos)
  getNeatLogs(userId: string): Observable<UserNeat[]> {
    const url = `${this.apiUrl}${environment.users.neatLogs.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Añadir log NEAT (POST /users/:id/neat-logs)
  addNeatLog(userId: string, log: { date: string; weight?: number; steps?: number }): Observable<User> {
    const url = `${this.apiUrl}${environment.users.neatLogs.replace(':id', userId)}`;
    return this.http.post<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }

  // Actualizar log NEAT (PATCH /users/:id/neat-logs/:date)
  updateNeatLog(userId: string, date: string, log: { weight?: number; steps?: number }): Observable<User> {
    const url = `${this.apiUrl}${environment.users.neatLogByDate.replace(':id', userId).replace(':date', date)}`;
    return this.http.patch<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }

  // Obtener logs de entrenamiento
  getWorkoutLogs(userId: string): Observable<WorkoutLog[]> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener log de entrenamiento por fecha
  getWorkoutLogByDate(userId: string, date: string): Observable<WorkoutLog> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}/${date}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Añadir log de entrenamiento (POST /users/:id/workout-logs)
  addWorkoutLog(userId: string, log: WorkoutLog): Observable<User> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}`;
    return this.http.post<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }

  // Actualizar log de entrenamiento (PATCH /users/:id/workout-logs/:date)
  updateWorkoutLog(userId: string, date: string, log: WorkoutLog): Observable<User> {
    const url = `${this.apiUrl}${environment.users.workoutLogs.replace(':id', userId)}/${date}`;
    return this.http.patch<MessageApiResponse>(url, log).pipe(map(res => res.data));
  }
}
