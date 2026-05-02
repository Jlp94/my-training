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

  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}${environment.auth.login}`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap((response) => {
        if (response.data?.access_token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.access_token);
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


  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
