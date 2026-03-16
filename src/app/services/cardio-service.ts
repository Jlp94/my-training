import { Injectable, inject, signal } from '@angular/core';
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
  private readonly STORAGE_KEY = 'cardio_weekly_kcal';

  // State
  private _weeklyCardioKcal = signal(0);
  public weeklyCardioKcal = this._weeklyCardioKcal.asReadonly();

  constructor() {
    this.loadWeeklyKcal();
  }

  addKcal(kcal: number) {
    this._weeklyCardioKcal.update(current => current + kcal);
    this.saveWeeklyKcal();
  }

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

  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil((diff / 86400000 + start.getDay()) / 7);
  }

  private loadWeeklyKcal() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data.week === this.getWeekNumber()) {
          this._weeklyCardioKcal.set(data.kcal || 0);
        } else {
          localStorage.removeItem(this.STORAGE_KEY);
          this._weeklyCardioKcal.set(0);
        }
      } catch (e) {
        localStorage.removeItem(this.STORAGE_KEY);
        this._weeklyCardioKcal.set(0);
      }
    }
  }

  private saveWeeklyKcal() {
    const data = { 
      week: this.getWeekNumber(), 
      kcal: this._weeklyCardioKcal() 
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}
