import { Observable } from 'rxjs';
import { dragonBallApi } from '../api';
import { Planet } from '../types';
import { StateManager } from '../managers/StateManager';

export class PlanetsModule {
  constructor(private stateManager: StateManager) {}

  // Renderizar lista de planetas
  renderPlanets(planets: Planet[]): string {
    if (!Array.isArray(planets) || planets.length === 0) {
      return '<div class="col-span-full text-center text-white py-8">No se encontraron planetas</div>';
    }

    return planets.map(planet => `
      <div class="planet-card card-shine" onclick="app.navigateToDetail('planet', ${planet.id})">
        <div class="image-container aspect-square">
          <img 
            src="${planet.image}" 
            alt="${planet.name}"
            class="w-full h-full object-cover"
            onerror="this.src='https://via.placeholder.com/300x300/1f2937/3b82f6?text=${encodeURIComponent(planet.name)}'"
          >
        </div>
        <div class="p-4">
          <h3 class="text-xl font-bold text-white mb-2 font-orbitron">${planet.name}</h3>
          <div class="mb-3">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-300">Estado</span>
              <span class="px-2 py-1 rounded-full text-xs font-medium ${planet.isDestroyed ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}">
                ${planet.isDestroyed ? 'Destruido' : 'Intacto'}
              </span>
            </div>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <i class="fas fa-globe mr-1"></i>
            Planeta
          </span>
        </div>
      </div>
    `).join('');
  }

  // Renderizar página de detalle de planeta
  renderPlanetDetailPage(planet: Planet): string {
    return `
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white font-orbitron mb-4">${planet.name}</h1>
          <div class="flex justify-center mb-6">
            <span class="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${planet.isDestroyed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}">
              <i class="fas fa-${planet.isDestroyed ? 'skull-crossbones' : 'check-circle'} mr-3 text-xl"></i>
              ${planet.isDestroyed ? 'DESTRUIDO' : 'INTACTO'}
            </span>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="image-container aspect-square bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-3xl overflow-hidden">
            <img 
              src="${planet.image}" 
              alt="${planet.name}"
              class="w-full h-full object-cover"
              onerror="this.src='https://via.placeholder.com/600x600/1f2937/3b82f6?text=${encodeURIComponent(planet.name)}'"
            >
          </div>
          
          <div class="space-y-6">
            <div class="bg-black/30 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6">
              <h3 class="text-2xl font-semibold text-blue-400 mb-4 flex items-center">
                <i class="fas fa-globe mr-3"></i>
                Información del Planeta
              </h3>
              <div class="space-y-4">
                <div class="text-center p-4 rounded-xl ${planet.isDestroyed ? 'bg-red-500/10 border border-red-500/30' : 'bg-green-500/10 border border-green-500/30'}">
                  <div class="text-3xl font-bold ${planet.isDestroyed ? 'text-red-400' : 'text-green-400'} mb-2">
                    ${planet.isDestroyed ? 'DESTRUIDO' : 'INTACTO'}
                  </div>
                  <p class="text-gray-300 mt-4">
                    ${planet.isDestroyed ? 
                      'Este planeta ha sido destruido y ya no existe en el universo.' : 
                      'Este planeta permanece intacto y habitable.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-black/30 backdrop-blur-md border border-blue-500/30 rounded-2xl p-6">
          <h3 class="text-2xl font-semibold text-blue-400 mb-4 flex items-center">
            <i class="fas fa-book mr-3"></i>
            Descripción
          </h3>
          <p class="text-gray-300 leading-relaxed text-lg">${planet.description}</p>
        </div>
      </div>
    `;
  }

  // Cargar datos de planetas
  loadPlanets(page: number): Observable<any> {
    return dragonBallApi.getPlanets(page);
  }

  // Obtener planeta por ID
  getPlanetById(id: number): Observable<Planet | null> {
    return dragonBallApi.getPlanetById(id);
  }

  // Filtrar planetas por nombre (para búsqueda local)
  filterPlanetsByName(planets: Planet[], searchTerm: string): Planet[] {
    if (!searchTerm.trim()) return planets;
    
    const term = searchTerm.toLowerCase();
    return planets.filter(planet => 
      planet.name.toLowerCase().includes(term) ||
      planet.description.toLowerCase().includes(term)
    );
  }
}
