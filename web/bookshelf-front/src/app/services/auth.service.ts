import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
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
  private userKey = 'personal_bookshelf_user_data';

  // BehaviorSubject para manejar el estado de autenticación
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public currentUser$ = this.currentUserSubject.asObservable();

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
          this.setToken(response.token);
          this.setUser(response.user);
          this.isAuthenticatedSubject.next(true);
          this.currentUserSubject.next(response.user);
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
  logout(): void {
    this.removeToken();
    this.removeUser();
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
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
   * Obtener usuario actual
   */
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem(this.userKey);
      if (userStr && userStr !== 'undefined' && userStr !== 'null') {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.warn('Error parsing user from localStorage:', error);
      // Limpiar datos corruptos
      this.removeUser();
    }
    return null;
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

  /**
   * Guardar usuario
   */
  private setUser(user: User): void {
    try {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
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
   * Eliminar usuario
   */
  private removeUser(): void {
    try {
      localStorage.removeItem(this.userKey);
    } catch (error) {
      console.warn('Error removing user from localStorage:', error);
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
