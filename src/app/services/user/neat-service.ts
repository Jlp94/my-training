import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, map, tap } from 'rxjs';
import { MessageApiResponse } from '../../common/response-interface';
import { User, UserNeat } from '../../common/userInterface';
import { getMondayDate } from '../../common/date-utils';

@Injectable({
  providedIn: 'root',
})
export class NeatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private _neatLogs = signal<UserNeat[]>([]);
  public neatLogs = this._neatLogs.asReadonly();

  public currentWeekStart = signal<Date>(this.getMonday(new Date()));

  public weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const dStart = String(start.getDate()).padStart(2, '0');
    const dEnd = String(end.getDate()).padStart(2, '0');
    
    return `${dStart} ${this.getMonthShort(start)} — ${dEnd} ${this.getMonthShort(end)}`;
  });

  public weekStepsData = computed(() => {
    const weekData: number[] = [];
    const logs = this._neatLogs();
    const start = this.currentWeekStart();
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const log = logs.find(l => l.date === dateStr);
      weekData.push(log?.steps || 0);
    }
    return weekData;
  });

  public weeklyStepsTotal = computed(() => {
    return this.weekStepsData().reduce((sum, s) => sum + s, 0);
  });

  public weightMonthLabel = computed(() => {
    const logs = this._neatLogs()
      .filter(log => log.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);

    if (logs.length === 0) return '';
    
    const firstDate = new Date(logs[0].date);
    const lastDate = new Date(logs[logs.length - 1].date);
    
    const firstMonth = this.getMonthShort(firstDate);
    const lastMonth = this.getMonthShort(lastDate);
    
    if (firstMonth === lastMonth) return firstMonth;
    return `${firstMonth} — ${lastMonth}`;
  });

  setInitialLogs(logs: UserNeat[]) {
    this._neatLogs.set(logs);
  }

  prevWeek() {
    this.currentWeekStart.update(d => new Date(d.getTime() - 7 * 86400000));
  }

  nextWeek() {
    this.currentWeekStart.update(d => new Date(d.getTime() + 7 * 86400000));
  }

  addNeatLog(userId: string, log: { date: string; weight?: number; steps?: number }): Observable<User> {
    const url = `${this.apiUrl}${environment.users.neatLogs.replace(':id', userId)}`;
    return this.http.post<MessageApiResponse>(url, log).pipe(
      map(res => res.data),
      tap(user => this._neatLogs.set(user.profile.neatLogs || []))
    );
  }

  updateNeatLog(userId: string, date: string, log: { weight?: number; steps?: number }): Observable<User> {
    const url = `${this.apiUrl}${environment.users.neatLogByDate.replace(':id', userId).replace(':date', date)}`;
    return this.http.patch<MessageApiResponse>(url, log).pipe(
      map(res => res.data),
      tap(user => this._neatLogs.set(user.profile.neatLogs || []))
    );
  }

  public getWeightChartData(): { labels: string[]; data: number[] } {
    const withWeight = this._neatLogs()
      .filter(log => log.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-15);

    return {
      labels: withWeight.map(log => {
        const parts = log.date.split('-');
        return parts[2];
      }),
      data: withWeight.map(log => log.weight!)
    };
  }

  private getMonthShort(date: Date): string {
    const month = date.toLocaleString('es-ES', { month: 'short' }).replace('.', '');
    return month.charAt(0).toUpperCase() + month.slice(1);
  }

  private getMonday(d: Date): Date {
    return getMondayDate(d);
  }
}
