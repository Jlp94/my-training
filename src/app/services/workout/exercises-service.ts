import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../../common/response-interface';
import { Ejercicio } from '../../common/exercises-interface';

@Injectable({
  providedIn: 'root',
})
export class ExercisesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Listar todos los ejercicios (con filtros opcionales)
  findAll(name?: string, category?: string): Observable<Ejercicio[]> {
    let url = `${this.apiUrl}${environment.exercises.base}`;
    const params: string[] = [];
    if (name) params.push(`name=${name}`);
    if (category) params.push(`category=${category}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener un ejercicio por ID
  findOne(exerciseId: string): Observable<Ejercicio> {
    const url = `${this.apiUrl}${environment.exercises.byId.replace(':id', exerciseId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }
}
