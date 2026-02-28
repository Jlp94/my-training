import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map } from 'rxjs';
import { MessageApiResponse } from '../common/response-interface';
import { Alimento } from '../common/diet-interface';

@Injectable({
  providedIn: 'root',
})
export class FoodService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Listar alimentos (filtro opcional por nombre)
  findAll(name?: string): Observable<Alimento[]> {
    let url = `${this.apiUrl}${environment.foods.base}`;
    if (name) url += `?name=${name}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener un alimento por ID
  findOne(foodId: string): Observable<Alimento> {
    const url = `${this.apiUrl}${environment.foods.byId.replace(':id', foodId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }
}
