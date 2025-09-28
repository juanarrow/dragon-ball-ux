import { DragonBallApp } from './app';

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  console.log('🐉 Iniciando Dragon Ball Universe App...');
  
  // Crear la instancia de la aplicación
  const app = new DragonBallApp();
  
  // Hacer la instancia disponible globalmente para los event handlers del HTML
  (window as any).app = app;
  
  console.log('✨ Dragon Ball Universe App iniciada correctamente!');
});

// Manejar errores globales
window.addEventListener('error', (event) => {
  console.error('Error global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rechazada no manejada:', event.reason);
  event.preventDefault();
});