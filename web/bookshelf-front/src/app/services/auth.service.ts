import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

interface LogoutResponse {
  message: string;
}

interface User {
  id: number;
  username: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/api';
  private tokenKey = 'personal_bookshelf_auth_token';
  private refreshTokenKey = 'personal_bookshelf_refresh_token';
  private userKey = 'personal_bookshelf_user_data';

  // BehaviorSubject para manejar el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) {
    // Verificar token al inicializar el servicio
    this.checkTokenValidity();
  }

  /**
   * Realizar login
   */
  login(credentials: { email: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap((response: LoginResponse) => {
          this.setToken(response.access_token);
          this.setRefreshToken(response.refresh_token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }

  /**
   * Realizar registro
   */
  register(userData: { username: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData);
  }

  /**
   * Realizar logout
   */
  logout(): Observable<LogoutResponse> {
    return this.http.post<LogoutResponse>(`${this.baseUrl}/logout`, {})
      .pipe(
        tap(response => {
          this.removeToken();
          console.log(`message: ${response.message}`);
          this.isAuthenticatedSubject.next(false);
        })
      );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.hasToken();
  }

  /**
   * Obtener el token JWT
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch (error) {
      console.warn('Error accessing localStorage for token:', error);
      return null;
    }
  }

  /**
   * Verificar si existe token
   */
  private hasToken(): boolean {
    try {
      const token = localStorage.getItem(this.tokenKey);
      return !!token && token !== 'undefined' && token !== 'null';
    } catch (error) {
      console.warn('Error checking token in localStorage:', error);
      return false;
    }
  }

  /**
   * Guardar token
   */
  private setToken(token: string): void {
    try {
      localStorage.setItem(this.tokenKey, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  private setRefreshToken(refreshToken: string): void {
    try {
      localStorage.setItem(this.refreshTokenKey, refreshToken);
    } catch (error) {
      console.error('Error saving refresh token to localStorage:', error);
    }
  }

  /**
   * Eliminar token
   */
  private removeToken(): void {
    try {
      localStorage.removeItem(this.tokenKey);
    } catch (error) {
      console.warn('Error removing token from localStorage:', error);
    }
  }

  /**
   * Verificar validez del token (opcional - depende de tu API)
   */
  private checkTokenValidity(): void {
    if (this.hasToken()) {
      // Aquí podrías hacer una llamada a tu API para verificar si el token sigue siendo válido
      // Por ejemplo: this.http.get('/api/verify-token').subscribe(...)
      // Si el token no es válido, hacer logout automático
    }
  }
}
