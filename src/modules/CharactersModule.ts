import { Observable, of } from 'rxjs';
import { dragonBallApi } from '../api';
import { Character } from '../types';
import { StateManager } from '../managers/StateManager';

export class CharactersModule {
  constructor(private stateManager: StateManager) {}

  // Renderizar lista de personajes
  renderCharacters(characters: Character[]): string {
    console.log('renderCharacters called with:', characters, 'length:', characters.length);
    
    if (!Array.isArray(characters) || characters.length === 0) {
      console.log('renderCharacters: empty array, showing no results message');
      return '<div class="col-span-full text-center text-white py-8">No se encontraron personajes</div>';
    }

    console.log('renderCharacters: rendering', characters.length, 'characters');

    return characters.map(character => `
      <div class="character-card card-shine card-with-overflow" onclick="app.navigateToDetail('character', ${character.id})">
        <div class="image-container aspect-square image-overflow-container bg-gradient-to-br from-orange-500/10 to-yellow-500/10 rounded-t-2xl">
          <img 
            src="${character.image}" 
            alt="${character.name}"
            class="w-full h-full object-scale-down image-overflow"
            onerror="this.src='https://via.placeholder.com/300x300/1f2937/f59e0b?text=${encodeURIComponent(character.name)}'"
          >
        </div>
        <div class="p-4 overflow-content">
          <h3 class="text-xl font-bold text-white mb-2 font-orbitron">${character.name}</h3>
          <div class="flex flex-wrap gap-2 mb-3">
            <span class="race-badge">${character.race}</span>
            <span class="gender-badge gender-${character.gender.toLowerCase()}">${character.gender}</span>
          </div>
          <div class="mb-3">
            <div class="flex justify-between text-sm text-gray-300 mb-1">
              <span>Poder</span>
              <span>${character.ki}</span>
            </div>
            <div class="power-level-bar">
              <div class="power-level-fill" style="width: ${this.calculatePowerPercentage(character.ki)}%"></div>
            </div>
          </div>
          <span class="affiliation-badge ${this.getAffiliationClass(character.affiliation)}">${character.affiliation}</span>
        </div>
      </div>
    `).join('');
  }

  // Renderizar página de detalle de personaje
  renderCharacterDetailPage(character: Character): string {
    return `
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white font-orbitron mb-4">${character.name}</h1>
          <div class="flex flex-wrap justify-center gap-3 mb-6">
            <span class="race-badge text-lg px-4 py-2">${character.race}</span>
            <span class="gender-badge gender-${character.gender.toLowerCase()} text-lg px-4 py-2">${character.gender}</span>
            <span class="affiliation-badge ${this.getAffiliationClass(character.affiliation)} text-lg px-4 py-2">${character.affiliation}</span>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="image-container aspect-square bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-orange-500/30 rounded-3xl overflow-hidden">
            <img 
              src="${character.image}" 
              alt="${character.name}"
              class="w-full h-full object-scale-down"
              onerror="this.src='https://via.placeholder.com/600x600/1f2937/f59e0b?text=${encodeURIComponent(character.name)}'"
            >
          </div>
          
          <div class="space-y-6">
            <div class="bg-black/30 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6">
              <h3 class="text-2xl font-semibold text-orange-400 mb-4 flex items-center">
                <i class="fas fa-info-circle mr-3"></i>
                Información Básica
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-gray-300 font-medium">Raza:</span>
                  <span class="text-white font-semibold">${character.race}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-gray-300 font-medium">Género:</span>
                  <span class="text-white font-semibold">${character.gender}</span>
                </div>
                <div class="flex justify-between items-center py-2 border-b border-white/10">
                  <span class="text-gray-300 font-medium">Afiliación:</span>
                  <span class="text-white font-semibold">${character.affiliation}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-black/30 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6">
              <h3 class="text-2xl font-semibold text-orange-400 mb-4 flex items-center">
                <i class="fas fa-fist-raised mr-3"></i>
                Nivel de Poder
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Ki Base</span>
                    <span class="text-orange-300 font-bold">${character.ki}</span>
                  </div>
                  <div class="power-level-bar h-4 mb-4">
                    <div class="power-level-fill h-full" style="width: ${this.calculatePowerPercentage(character.ki)}%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Ki Máximo</span>
                    <span class="text-yellow-300 font-bold">${character.maxKi}</span>
                  </div>
                  <div class="power-level-bar h-4">
                    <div class="power-level-fill h-full" style="width: ${this.calculatePowerPercentage(character.maxKi)}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="bg-black/30 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6">
          <h3 class="text-2xl font-semibold text-orange-400 mb-4 flex items-center">
            <i class="fas fa-book mr-3"></i>
            Historia
          </h3>
          <p class="text-gray-300 leading-relaxed text-lg">${character.description}</p>
        </div>
        
        <!-- Transformation Button -->
        <div class="text-center mt-8">
          <button onclick="app.showTransformations('${character.name}', ${character.id})" class="transformation-btn">
            <i class="fas fa-bolt mr-2"></i>
            Ver Transformaciones
            <i class="fas fa-magic ml-2"></i>
          </button>
        </div>
      </div>
    `;
  }

  // Cargar datos de personajes
  loadCharacters(page: number): Observable<any> {
    return dragonBallApi.getCharacters(page);
  }

  // Buscar personajes
  searchCharacters(name: string): Observable<Character[]> {
    return dragonBallApi.searchCharacters(name);
  }

  // Obtener personaje por ID
  getCharacterById(id: number): Observable<Character | null> {
    return dragonBallApi.getCharacterById(id);
  }

  // Métodos de utilidad
  private calculatePowerPercentage(ki: string): number {
    // Función para calcular un porcentaje aproximado basado en el nivel de Ki
    // Esto es una aproximación visual para la barra de poder
    const kiValue = ki.toLowerCase();
    
    if (kiValue.includes('unknown') || kiValue === '0') return 0;
    if (kiValue.includes('trillion') || kiValue.includes('septillion')) return 100;
    if (kiValue.includes('billion')) return 85;
    if (kiValue.includes('million')) return 70;
    if (kiValue.includes('thousand')) return 50;
    
    // Intentar extraer números para una estimación más precisa
    const numbers = ki.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const numValue = parseInt(numbers[0].replace(/,/g, ''));
      if (numValue > 1000000000) return 100;
      if (numValue > 100000000) return 90;
      if (numValue > 10000000) return 80;
      if (numValue > 1000000) return 70;
      if (numValue > 100000) return 60;
      if (numValue > 10000) return 50;
      if (numValue > 1000) return 40;
      return Math.min(30, (numValue / 1000) * 30);
    }
    
    return 30; // Valor por defecto
  }

  private getAffiliationClass(affiliation: string): string {
    const lowerAffiliation = affiliation.toLowerCase();
    if (lowerAffiliation.includes('z fighter') || lowerAffiliation.includes('hero')) {
      return 'affiliation-z-fighter';
    } else if (lowerAffiliation.includes('villain') || lowerAffiliation.includes('army')) {
      return 'affiliation-villain';
    } else if (lowerAffiliation.includes('other')) {
      return 'affiliation-other';
    }
    return 'affiliation-neutral';
  }
}
