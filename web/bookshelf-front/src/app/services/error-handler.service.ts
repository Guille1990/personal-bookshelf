import { ErrorHandler, Injectable } from '@angular/core';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: any): void {
    // Filtrar errores conocidos de extensiones del navegador
    if (error?.message?.includes('insertBefore') || 
        error?.message?.includes('bootstrap-autofill') ||
        error?.message?.includes('extension')) {
      // Ignorar estos errores en desarrollo
      if (!environment.production) {
        console.warn('Browser extension error (ignored):', error.message);
      }
      return;
    }

    // Manejar errores reales de la aplicación
    console.error('Application error:', error);
    
    // Aquí podrías enviar errores a un servicio de logging como Sentry
    // this.loggingService.logError(error);
  }
}

// Nota: También necesitarías crear un archivo environment.ts
export const environment = {
  production: false
};