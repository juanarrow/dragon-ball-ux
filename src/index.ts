import { fromEvent } from 'rxjs';
import { DragonBallApp } from './app';

// Inicializar la aplicación cuando el DOM esté listo
fromEvent(document, 'DOMContentLoaded').subscribe(() => {
  console.log('🐉 Iniciando Dragon Ball Universe App...');
  
  // Crear la instancia de la aplicación
  const app = new DragonBallApp();
  
  // Hacer la instancia disponible globalmente para los event handlers del HTML
  (window as any).app = app;
  
  console.log('✨ Dragon Ball Universe App iniciada correctamente!');
});

// Manejar errores globales
fromEvent(window, 'error').subscribe((event: any) => {
  console.error('Error global capturado:', event.error);
});

fromEvent(window, 'unhandledrejection').subscribe((event: any) => {
  console.error('Promise rechazada no manejada:', event.reason);
  event.preventDefault();
});