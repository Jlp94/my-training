import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../common/response-interface';
import { Rutina, SesionRutina } from '../common/routine-interface';

@Injectable({
  providedIn: 'root',
})
export class RoutinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Listar rutinas (filtro opcional por userId)
  findAll(userId?: string): Observable<Rutina[]> {
    let url = `${this.apiUrl}${environment.routines.base}`;
    if (userId) url += `?userId=${userId}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener una rutina por ID (con ejercicios enriquecidos)
  findOne(routineId: string): Observable<Rutina> {
    const url = `${this.apiUrl}${environment.routines.byId.replace(':id', routineId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener una sesión específica por día
  findSession(routineId: string, day: number): Observable<SesionRutina> {
    const url = `${this.apiUrl}${environment.routines.sessionByDay
      .replace(':id', routineId)
      .replace(':day', day.toString())}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }
}
