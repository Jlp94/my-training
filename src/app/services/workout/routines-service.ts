import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../../common/response-interface';
import { Rutina, SesionRutina } from '../../common/routine-interface';
import { UserService } from '../user/user-service';
import { UserProfile } from '../../common/userInterface';
import { switchMap, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RoutinesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly userService = inject(UserService);

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

  // Obtiene el perfil del usuario y su sesión de rutina para un día específico
  getMyRoutineSession(day: number): Observable<{ profile: UserProfile; session: SesionRutina }> {
    return this.userService.getProfile().pipe(
      switchMap(profile => {
        const routineId = profile.currentRoutineId;
        if (!routineId) throw new Error('NO_ROUTINE');

        return forkJoin({
          profile: Promise.resolve(profile),
          session: this.findSession(routineId, day)
        });
      })
    );
  }
}
