import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map, switchMap, forkJoin } from 'rxjs';
import { MessageApiResponse } from '../common/response-interface';
import { Dieta, Alimento } from '../common/diet-interface';
import { UserService } from './user-service';
import { FoodService } from './food-service';
import { UserProfile } from '../common/userInterface';

@Injectable({
  providedIn: 'root',
})
export class DietService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly userService: UserService = inject(UserService);
  private readonly foodService: FoodService = inject(FoodService);

  // Listar dietas (filtro opcional por userId)
  findAll(userId?: string): Observable<Dieta[]> {
    let url = `${this.apiUrl}${environment.diets.base}`;
    if (userId) url += `?userId=${userId}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtener una dieta por ID
  findOne(dietId: string): Observable<Dieta> {
    const url = `${this.apiUrl}${environment.diets.byId.replace(':id', dietId)}`;
    return this.http.get<MessageApiResponse>(url).pipe(map(res => res.data));
  }

  // Obtiene la dieta actual del usuario enriquecida con los alimentos
  // Devuelve: perfil completo, dieta con meals/foods, y lista de alimentos
  getMyDiet(): Observable<{ profile: UserProfile; diet: Dieta; foods: Alimento[] }> {
    return this.userService.getProfile().pipe(
      switchMap(profile => {
        const dietId = profile.currentDietId;
        if (!dietId) throw new Error('NO_DIET');

        return forkJoin({
          profile: Promise.resolve(profile),
          diet: this.findOne(dietId),
          foods: this.foodService.findAll()
        });
      })
    );
  }
}
