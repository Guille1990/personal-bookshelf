import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Si hay token y no es una ruta de login/register, agregar el header
  if (token && !req.url.includes('/login') && !req.url.includes('/register')) {
    console.log('Adding token to request:', req.url); // Debug log
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(authReq);
  }

  console.log('Request without token:', req.url); // Debug log
  return next(req);
};