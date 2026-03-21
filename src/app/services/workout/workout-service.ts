import { Injectable, inject } from '@angular/core';
import { RoutinesService } from './routines-service';
import { UserService } from '../user/user-service';
import { forkJoin, map, switchMap, catchError, of, firstValueFrom, Observable } from 'rxjs';
import { WorkoutLog } from '../../common/userInterface';
import { SesionRutina } from '../../common/routine-interface';

@Injectable({
  providedIn: 'root'
})
export class WorkoutService {
  private readonly routinesService = inject(RoutinesService);
  private readonly userService = inject(UserService);

  /**
   * Obtiene la información necesaria para el día: la sesión de la rutina y el log previo (si existe).
   */
  getWorkoutData(dayNum: number, dateStr: string): Observable<{ userId: string; session: SesionRutina; routineId: string; existingLog?: WorkoutLog }> {
    return this.userService.getUser().pipe(
      switchMap(user => {
        return forkJoin({
          routineData: this.routinesService.getMyRoutineSession(dayNum),
          existingLog: this.userService.getWorkoutLogByDate(user._id, dateStr).pipe(
            catchError(() => of(undefined))
          )
        }).pipe(
          map(res => ({
            userId: user._id,
            session: res.routineData.session,
            routineId: res.routineData.profile.currentRoutineId || '',
            existingLog: res.existingLog
          }))
        );
      })
    );
  }

  /**
   * Guarda o actualiza un log de entrenamiento en la API.
   */
  async saveWorkout(userId: string, dateStr: string, log: WorkoutLog) {
    let exists = true;
    try {
      // Comprobar si ya hay una entrada para ese día
      await firstValueFrom(this.userService.getWorkoutLogByDate(userId, dateStr));
    } catch {
      exists = false;
    }

    const request$ = exists 
      ? this.userService.updateWorkoutLog(userId, dateStr, log)
      : this.userService.addWorkoutLog(userId, log);

    return firstValueFrom(request$);
  }

  /**
   * Actualiza solo las notas de un log existente.
   */
  async saveOnlyNotes(userId: string, dateStr: string, notes: string) {
    return firstValueFrom(
      this.userService.updateWorkoutLog(userId, dateStr, { notes } as any)
    );
  }
}
