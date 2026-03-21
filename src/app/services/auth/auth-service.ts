import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, tap } from 'rxjs';
import { LoginResponse } from '../../common/auth-interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  // Token key en localStorage
  private readonly TOKEN_KEY = 'access_token';

  // Login del usuario - envía email/password a la API y guarda el token en localStorage
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

  // Obtiene el perfil del usuario autenticado
  getProfile(): Observable<any> {
    const url = `${this.apiUrl}${environment.auth.profile}`;
    return this.http.get(url);
  }

  // Devuelve el token almacenado
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  // Comprueba si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Cierra sesión eliminando el token
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}
