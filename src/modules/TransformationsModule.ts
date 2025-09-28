import { Observable } from 'rxjs';
import { dragonBallApi } from '../api';
import { Transformation } from '../types';
import { StateManager } from '../managers/StateManager';

export class TransformationsModule {
  // Estado del visor de transformaciones
  private currentTransformations: Transformation[] = [];
  private currentTransformationIndex = 0;
  private isTransformationPlaying = false;
  private transformationInterval: number | null = null;

  constructor(private stateManager: StateManager) {}

  // Renderizar lista de transformaciones
  renderTransformations(transformations: Transformation[]): string {
    if (!Array.isArray(transformations) || transformations.length === 0) {
      return '<div class="col-span-full text-center text-white py-8">No se encontraron transformaciones</div>';
    }

    return transformations.map(transformation => `
      <div class="transformation-card card-shine card-with-overflow" onclick="app.navigateToDetail('transformation', ${transformation.id})">
        <div class="image-container aspect-square image-overflow-container bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-t-2xl">
          <img 
            src="${transformation.image}" 
            alt="${transformation.name}"
            class="w-full h-full object-scale-down image-overflow"
            onerror="this.src='https://via.placeholder.com/300x300/1f2937/8b5cf6?text=${encodeURIComponent(transformation.name)}'"
          >
        </div>
        <div class="p-4 overflow-content">
          <h3 class="text-xl font-bold text-white mb-2 font-orbitron">${transformation.name}</h3>
          <div class="mb-3">
            <div class="flex justify-between text-sm text-gray-300 mb-1">
              <span>Poder</span>
              <span>${transformation.ki}</span>
            </div>
            <div class="power-level-bar">
              <div class="power-level-fill" style="width: ${this.calculatePowerPercentage(transformation.ki)}%"></div>
            </div>
          </div>
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
            <i class="fas fa-bolt mr-1"></i>
            Transformación
          </span>
        </div>
      </div>
    `).join('');
  }

  // Renderizar página de detalle de transformación
  renderTransformationDetailPage(transformation: Transformation): string {
    return `
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white font-orbitron mb-4">${transformation.name}</h1>
          <div class="flex justify-center mb-6">
            <span class="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <i class="fas fa-bolt mr-3 text-xl"></i>
              Transformación
            </span>
          </div>
        </div>

        <div class="grid lg:grid-cols-2 gap-8 mb-8">
          <div class="image-container aspect-square bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-3xl overflow-hidden">
            <img 
              src="${transformation.image}" 
              alt="${transformation.name}"
              class="w-full h-full object-scale-down"
              onerror="this.src='https://via.placeholder.com/600x600/1f2937/8b5cf6?text=${encodeURIComponent(transformation.name)}'"
            >
          </div>
          
          <div class="space-y-6">
            <div class="bg-black/30 backdrop-blur-md border border-purple-500/30 rounded-2xl p-6">
              <h3 class="text-2xl font-semibold text-purple-400 mb-4 flex items-center">
                <i class="fas fa-bolt mr-3"></i>
                Nivel de Poder
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Ki de Transformación</span>
                    <span class="text-purple-300 font-bold">${transformation.ki}</span>
                  </div>
                  <div class="power-level-bar h-4">
                    <div class="power-level-fill h-full" style="width: ${this.calculatePowerPercentage(transformation.ki)}%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Cargar datos de transformaciones
  loadTransformations(page: number): Observable<any> {
    return dragonBallApi.getTransformations(page);
  }

  // Obtener transformación por ID
  getTransformationById(id: number): Observable<Transformation | null> {
    return dragonBallApi.getTransformationById(id);
  }

  // Filtrar transformaciones por nombre (para búsqueda local)
  filterTransformationsByName(transformations: Transformation[], searchTerm: string): Transformation[] {
    if (!searchTerm.trim()) return transformations;
    
    const term = searchTerm.toLowerCase();
    return transformations.filter(transformation => 
      transformation.name.toLowerCase().includes(term)
    );
  }

  // Métodos del visor de transformaciones
  showTransformations(characterName: string, characterId: number): void {
    console.log(`Loading transformations for ${characterName}`);
    
    // Primero obtener el personaje original
    dragonBallApi.getCharacterById(characterId).subscribe({
      next: (character) => {
        if (character) {
          // Luego obtener las transformaciones
          dragonBallApi.getCharacterTransformations(characterName).subscribe({
            next: (transformations) => {
              // Crear un array que incluya primero el personaje original
              this.currentTransformations = [
                {
                  id: character.id,
                  name: `${character.name} (Original)`,
                  image: character.image,
                  ki: character.ki
                } as Transformation,
                ...transformations
              ];
              this.currentTransformationIndex = 0;
              
              this.openTransformationModal(characterName);
              this.displayCurrentTransformation();
            },
            error: (error) => {
              console.error('Error loading transformations:', error);
              // Si no hay transformaciones, mostrar solo el personaje original
              this.currentTransformations = [
                {
                  id: character.id,
                  name: `${character.name} (Original)`,
                  image: character.image,
                  ki: character.ki
                } as Transformation
              ];
              this.currentTransformationIndex = 0;
              
              this.openTransformationModal(characterName);
              this.displayCurrentTransformation();
            }
          });
        } else {
          const event = new CustomEvent('showError', { 
            detail: `No se encontró el personaje ${characterName}` 
          });
          window.dispatchEvent(event);
        }
      },
      error: (error) => {
        console.error('Error loading character:', error);
        const event = new CustomEvent('showError', { 
          detail: 'Error al cargar el personaje' 
        });
        window.dispatchEvent(event);
      }
    });
  }

  private openTransformationModal(characterName: string): void {
    const modal = document.getElementById('transformation-modal');
    const title = document.getElementById('transformation-title');
    
    if (modal && title) {
      title.innerHTML = `<i class="fas fa-bolt text-orange-400 mr-3"></i>Transformaciones de ${characterName}`;
      modal.classList.remove('hidden');
      modal.classList.add('modal-enter');
    }
  }

  public closeTransformationModal(): void {
    const modal = document.getElementById('transformation-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('modal-enter');
    }
    
    // Limpiar cualquier animación en curso
    this.stopTransformationSequence();
  }

  private displayCurrentTransformation(): void {
    console.log('displayCurrentTransformation called, index:', this.currentTransformationIndex, 'total:', this.currentTransformations.length);
    if (this.currentTransformations.length === 0) {
      console.log('No transformations available');
      return;
    }

    const transformation = this.currentTransformations[this.currentTransformationIndex];
    console.log('Current transformation:', transformation?.name);
    if (!transformation) return;

    const image = document.getElementById('transformation-image') as HTMLImageElement;
    const name = document.getElementById('current-transformation-name');
    const power = document.getElementById('current-transformation-power');
    const counter = document.getElementById('transformation-counter');
    const powerFill = document.getElementById('transformation-power-fill');

    if (image && name && power && counter && powerFill) {
      // Actualizar información
      image.src = transformation.image;
      image.alt = transformation.name;
      name.textContent = transformation.name;
      power.textContent = `Poder: ${transformation.ki}`;
      counter.textContent = `${this.currentTransformationIndex + 1} / ${this.currentTransformations.length}`;
      
      // Actualizar barra de poder
      const powerPercentage = this.calculatePowerPercentage(transformation.ki);
      powerFill.style.width = `${powerPercentage}%`;

      // Actualizar botones
      this.updateTransformationButtons();
    }
  }

  private updateTransformationButtons(): void {
    const prevBtn = document.getElementById('prev-transformation') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-transformation') as HTMLButtonElement;
    const playBtn = document.getElementById('play-transformation') as HTMLButtonElement;

    console.log('Updating transformation buttons:', {
      currentIndex: this.currentTransformationIndex,
      totalTransformations: this.currentTransformations.length,
      prevBtnFound: !!prevBtn,
      nextBtnFound: !!nextBtn,
      playBtnFound: !!playBtn
    });

    if (prevBtn && nextBtn && playBtn) {
      const shouldDisablePrev = this.currentTransformationIndex === 0;
      const shouldDisableNext = this.currentTransformationIndex === this.currentTransformations.length - 1;
      
      console.log('Button states:', {
        shouldDisablePrev,
        shouldDisableNext,
        isPlaying: this.isTransformationPlaying
      });
      
      prevBtn.disabled = shouldDisablePrev;
      nextBtn.disabled = shouldDisableNext;
      
      if (this.isTransformationPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pausar';
      } else {
        playBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Transformar';
      }
    } else {
      console.log('Some buttons not found!');
    }
  }

  public previousTransformation(): void {
    console.log('Previous transformation clicked, current index:', this.currentTransformationIndex);
    if (this.currentTransformationIndex > 0) {
      this.currentTransformationIndex--;
      console.log('New index:', this.currentTransformationIndex);
      // Actualizar directamente sin animación para debuggear
      this.displayCurrentTransformation();
    } else {
      console.log('Already at first transformation');
    }
  }

  public nextTransformation(): void {
    console.log('Next transformation clicked, current index:', this.currentTransformationIndex, 'total:', this.currentTransformations.length);
    if (this.currentTransformationIndex < this.currentTransformations.length - 1) {
      this.currentTransformationIndex++;
      console.log('New index:', this.currentTransformationIndex);
      // Actualizar directamente sin animación para debuggear
      this.displayCurrentTransformation();
    } else {
      console.log('Already at last transformation');
    }
  }

  public playTransformationSequence(): void {
    if (this.isTransformationPlaying) {
      this.stopTransformationSequence();
    } else {
      this.startTransformationSequence();
    }
  }

  private startTransformationSequence(): void {
    this.isTransformationPlaying = true;
    this.updateTransformationButtons();

    // Reiniciar desde el principio si estamos al final
    if (this.currentTransformationIndex === this.currentTransformations.length - 1) {
      this.currentTransformationIndex = 0;
    }

    this.transformationInterval = window.setInterval(() => {
      this.nextTransformation();
      
      // Si llegamos al final, parar la secuencia
      if (this.currentTransformationIndex === this.currentTransformations.length - 1) {
        this.stopTransformationSequence();
      }
    }, 2000); // Cambiar cada 2 segundos
  }

  private stopTransformationSequence(): void {
    this.isTransformationPlaying = false;
    if (this.transformationInterval) {
      clearInterval(this.transformationInterval);
      this.transformationInterval = null;
    }
    this.updateTransformationButtons();
  }

  private animateTransformation(): void {
    const image = document.getElementById('transformation-image');
    const powerAura = document.getElementById('power-aura');
    const display = document.getElementById('transformation-display');

    if (image && powerAura && display) {
      // Efecto de flash
      const flash = document.createElement('div');
      flash.className = 'absolute inset-0 bg-white transformation-flash';
      display.appendChild(flash);

      // Activar aura de poder
      powerAura.style.opacity = '1';
      powerAura.classList.add('energy-burst');
      display.classList.add('aura-active');

      // Animar la imagen
      image.classList.add('transformation-enter');

      // Limpiar efectos después de la animación
      setTimeout(() => {
        flash.remove();
        powerAura.style.opacity = '0.7';
        powerAura.classList.remove('energy-burst');
        image.classList.remove('transformation-enter');
        
        // Mantener el aura por un momento más
        setTimeout(() => {
          display.classList.remove('aura-active');
          powerAura.style.opacity = '0';
        }, 1000);
      }, 800);

      // Actualizar la información después del flash
      setTimeout(() => {
        console.log('Updating transformation display after animation');
        this.displayCurrentTransformation();
      }, 300);
    } else {
      console.log('Animation elements not found, updating display directly');
      this.displayCurrentTransformation();
    }
  }

  // Método de utilidad mejorado para calcular poder
  private calculatePowerPercentage(ki: string): number {
    if (!ki || ki.toLowerCase().includes('unknown') || ki === '0') return 0;
    
    const kiValue = ki.toLowerCase().replace(/[,\.]/g, '');
    
    // Definir multiplicadores en orden ascendente de poder
    const multipliers = [
      { name: 'thousand', value: 1e3, percentage: 20 },
      { name: 'million', value: 1e6, percentage: 35 },
      { name: 'billion', value: 1e9, percentage: 50 },
      { name: 'trillion', value: 1e12, percentage: 65 },
      { name: 'quadrillion', value: 1e15, percentage: 75 },
      { name: 'quintillion', value: 1e18, percentage: 80 },
      { name: 'sextillion', value: 1e21, percentage: 85 },
      { name: 'septillion', value: 1e24, percentage: 90 },
      { name: 'octillion', value: 1e27, percentage: 95 },
      { name: 'nonillion', value: 1e30, percentage: 98 },
      { name: 'decillion', value: 1e33, percentage: 100 }
    ];
    
    // Buscar multiplicador en el texto
    for (let i = multipliers.length - 1; i >= 0; i--) {
      const multiplier = multipliers[i];
      if (multiplier && kiValue.includes(multiplier.name)) {
        // Extraer el número antes del multiplicador
        const numberMatch = ki.match(new RegExp(`(\\d+(?:[,\\.\\d]+)?)\\s*${multiplier.name}`, 'i'));
        if (numberMatch?.[1]) {
          const baseNumber = parseFloat(numberMatch[1].replace(/,/g, ''));
          // Ajustar porcentaje basado en el número base
          let adjustedPercentage = multiplier.percentage;
          if (baseNumber >= 100) adjustedPercentage = Math.min(100, adjustedPercentage + 10);
          else if (baseNumber >= 10) adjustedPercentage = Math.min(100, adjustedPercentage + 5);
          
          return adjustedPercentage;
        }
        return multiplier.percentage;
      }
    }
    
    // Si no hay multiplicador, intentar parsear el número directamente
    const numbers = ki.match(/[\d,]+/g);
    if (numbers && numbers.length > 0) {
      const numValue = parseInt(numbers[0].replace(/,/g, ''));
      
      // Escala logarítmica para números sin multiplicador
      if (numValue >= 1e9) return 50;
      if (numValue >= 1e8) return 45;
      if (numValue >= 1e7) return 40;
      if (numValue >= 1e6) return 35;
      if (numValue >= 1e5) return 30;
      if (numValue >= 1e4) return 25;
      if (numValue >= 1e3) return 20;
      if (numValue >= 100) return 15;
      if (numValue >= 10) return 10;
      return Math.max(5, (numValue / 10) * 5);
    }
    
    return 15; // Valor por defecto para casos no reconocidos
  }
}
