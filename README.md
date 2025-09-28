# 🐉 Dragon Ball Universe - Explorador de Personajes

Una aplicación web moderna y elegante desarrollada en TypeScript que permite explorar el universo de Dragon Ball utilizando la [Dragon Ball API](https://web.dragonball-api.com/documentation).

## ✨ Características

- **Interfaz Moderna**: Diseño elegante con Tailwind CSS y efectos visuales avanzados
- **Arquitectura Reactiva**: Implementada con RxJS para manejo eficiente de datos
- **TypeScript**: Tipado fuerte para mejor mantenibilidad y desarrollo
- **Responsive**: Optimizada para dispositivos móviles y desktop
- **Funcionalidades Completas**:
  - Exploración de personajes, planetas y transformaciones
  - Búsqueda en tiempo real con debounce
  - Paginación inteligente
  - Modales detallados para cada elemento
  - Barras de poder visuales
  - Sistema de badges para clasificaciones
  - Manejo de errores robusto

## 🚀 Tecnologías Utilizadas

- **TypeScript** - Lenguaje principal
- **RxJS** - Programación reactiva
- **Vite** - Bundler y servidor de desarrollo
- **Tailwind CSS** - Framework de estilos
- **Font Awesome** - Iconografía
- **Google Fonts** - Tipografías (Orbitron + Inter)

## 📦 Instalación y Uso

1. **Instalar dependencias**:
   ```bash
   npm install
   ```

2. **Ejecutar en modo desarrollo**:
   ```bash
   npm run dev
   ```

3. **Construir para producción**:
   ```bash
   npm run build
   ```

4. **Vista previa de producción**:
   ```bash
   npm run preview
   ```

## 🏗️ Arquitectura

### Estructura de Archivos

```
src/
├── types.ts          # Definiciones de tipos TypeScript
├── api.ts            # Servicio para consumir la Dragon Ball API
├── app.ts            # Clase principal de la aplicación
├── index.ts          # Punto de entrada
├── index.html        # Estructura HTML
└── index.css         # Estilos con Tailwind CSS
```

### Componentes Principales

- **DragonBallApp**: Clase principal que maneja el estado y la lógica
- **API Service**: Servicio reactivo para consumir la API
- **State Management**: Manejo de estado con BehaviorSubject
- **UI Components**: Renderizado dinámico de componentes

## 🎨 Diseño y UX

- **Tema Oscuro**: Paleta de colores inspirada en Dragon Ball
- **Gradientes**: Efectos visuales con gradientes naranja/amarillo
- **Animaciones**: Transiciones suaves y efectos hover
- **Responsive**: Diseño adaptativo para todos los dispositivos
- **Accesibilidad**: Navegación por teclado y lectores de pantalla

## 🔧 Funcionalidades Técnicas

### Programación Reactiva con RxJS

- **Streams de datos** para manejo eficiente de la API
- **Debounce** en búsquedas para optimizar requests
- **CombineLatest** para cargar múltiples endpoints
- **Error handling** robusto con operadores catch

### Gestión de Estado

- **BehaviorSubject** para estado centralizado
- **Inmutabilidad** en actualizaciones de estado
- **Reactividad** automática en cambios de UI

### Optimizaciones

- **Lazy loading** de imágenes con fallbacks
- **Paginación** eficiente
- **Caché** de datos en memoria
- **Manejo de errores** graceful

## 🌐 API Integration

La aplicación consume la Dragon Ball API para obtener:

- **Personajes**: Información completa con stats de poder
- **Planetas**: Estados y descripciones
- **Transformaciones**: Niveles de poder y características

### Endpoints Utilizados

- `GET /characters` - Lista de personajes
- `GET /characters/:id` - Detalles de personaje
- `GET /planets` - Lista de planetas  
- `GET /transformations` - Lista de transformaciones

## 🎯 Características Destacadas

### Visualización de Poder
- Barras de progreso animadas para niveles de Ki
- Cálculo automático de porcentajes
- Comparación visual entre personajes

### Sistema de Badges
- **Razas**: Saiyan, Namekian, Android, etc.
- **Géneros**: Male, Female, Unknown
- **Afiliaciones**: Z Fighter, Villain, Neutral
- **Estados**: Destroyed/Intact para planetas

### Búsqueda Inteligente
- Búsqueda en tiempo real con debounce de 300ms
- Filtrado por nombre de personajes
- Resultados instantáneos sin recargar página

## 🚀 Despliegue

La aplicación está configurada para despliegue automático:

```bash
npm run deploy
```

Esto construye la aplicación y la despliega usando GitHub Pages.

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- [Dragon Ball API](https://web.dragonball-api.com/) por proporcionar los datos
- Akira Toriyama por crear el universo de Dragon Ball
- La comunidad de desarrolladores por las herramientas utilizadas

---

**Desarrollado con ❤️ y TypeScript**
