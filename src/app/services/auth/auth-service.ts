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

  // Token key en localStorage
  private readonly TOKEN_KEY = 'access_token';

  // Estado del servidor (caché en memoria para evitar pings constantes)
  private isServerUp = false;

  // Login del usuario - envía email/password a la API y guarda el token en localStorage
  login(email: string, password: string): Observable<LoginResponse> {
    const url = `${this.apiUrl}${environment.auth.login}`;
    return this.http.post<LoginResponse>(url, { email, password }).pipe(
      tap((response) => {
        if (response.data?.access_token) {
          localStorage.setItem(this.TOKEN_KEY, response.data.access_token);
          this.isServerUp = true; // Si el login funciona, el servidor está arriba
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

  // Comprueba si el usuario tiene un token válido (no expirado)
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired(token);
  }

  // Comprueba si el token JWT ha expirado decodificando el payload
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp está en segundos, Date.now() en milisegundos
      const expirationDate = payload.exp * 1000;
      return Date.now() >= expirationDate;
    } catch {
      // Si el token es malformado, lo consideramos expirado
      return true;
    }
  }

  // Ping al servidor para comprobar si está vivo (cold start de Render)
  pingServer(): Observable<boolean> {
    if (this.isServerUp) return of(true);

    // Construimos la URL del health endpoint (sin el prefijo /my-training/v1)
    const baseUrl = this.apiUrl.replace('/my-training/v1', '');
    return this.http.get<{ status: string }>(`${baseUrl}/my-training/v1/health`).pipe(
      timeout(25000), // Timeout generoso para el cold start de Render
      tap(() => this.isServerUp = true),
      map(() => true),
      catchError(() => of(false))
    );
  }

  // Permite forzar el estado del servidor (ej. tras un login exitoso)
  setServerUp(value: boolean): void {
    this.isServerUp = value;
  }

  // Cierra sesión eliminando el token
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    // No reseteamos isServerUp porque el servidor sigue vivo aunque cerremos sesión
  }
}
