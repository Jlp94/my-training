import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap, catchError, of, map, timeout } from 'rxjs';
import { LoginResponse } from '../../common/auth-interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly TOKEN_KEY = 'access_token';
  private isServerUp = false;

  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}${environment.auth.login}`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap((response) => {
        if (response.data?.access_token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.access_token);
          this.isServerUp = true;
        }
      })
    );
  }

  getProfile(): Observable<any> {
    const url = `${this.apiUrl}${environment.auth.profile}`;
    return this.http.get(url);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = payload.exp * 1000;
      return Date.now() >= expirationDate;
    } catch {
      return true;
    }
  }

  pingServer(): Observable<boolean> {
    if (this.isServerUp) return of(true);

    const baseUrl = this.apiUrl.replace('/my-training/v1', '');
    return this.http.get<{ status: string }>(`${baseUrl}/my-training/v1/health`).pipe(
      timeout(25000),
      tap(() => this.isServerUp = true),
      map(() => true),
      catchError(() => of(false))
    );
  }

  setServerUp(value: boolean): void {
    this.isServerUp = value;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
