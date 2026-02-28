import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../common/response-interface';
import { Cardio } from '../common/cardio-interface';

@Injectable({
  providedIn: 'root',
})
export class CardioService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Listar todas las configuraciones de cardio
  findAll(): Observable<Cardio[]> {
    const url = `${this.apiUrl}${environment.cardio.base}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener una configuración de cardio por ID
  findOne(cardioId: string): Observable<Cardio> {
    const url = `${this.apiUrl}${environment.cardio.byId.replace(':id', cardioId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }
}
