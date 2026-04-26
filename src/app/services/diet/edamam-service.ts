import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { EdamamFood } from '../../common/diet-interface';

@Injectable({
  providedIn: 'root',
})
export class EdamamService {
  private readonly http = inject(HttpClient);

  private readonly APP_ID = 'fdf36f3c';
  private readonly APP_KEY = '66f140da739ea128b00820958f6eb27e';
  private readonly BASE_URL = 'https://api.edamam.com/api/food-database/v2/parser';

  searchFood(query: string): Observable<EdamamFood[]> {
    const url = `${this.BASE_URL}?app_id=${this.APP_ID}&app_key=${this.APP_KEY}&ingr=${encodeURIComponent(query)}&nutrition-type=cooking`;

    return this.http.get<any>(url).pipe(
      map(response =>
        (response.hints || []).slice(0, 10).map((hint: any) => ({
          name: hint.food.label,
          kcal: Math.round(hint.food.nutrients.ENERC_KCAL || 0),
          protein: Math.round(hint.food.nutrients.PROCNT || 0),
          carbs: Math.round(hint.food.nutrients.CHOCDF || 0),
          fat: Math.round(hint.food.nutrients.FAT || 0),
        }))
      )
    );
  }
}
