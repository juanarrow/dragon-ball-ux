import { BehaviorSubject, combineLatest, debounceTime, distinctUntilChanged, fromEvent, map, switchMap, tap, catchError, of, Observable, filter, shareReplay } from 'rxjs';
import { dragonBallApi } from './api';
import { Character, Planet, Transformation } from './types';

// Estado de la aplicación
interface AppState {
  currentTab: 'characters' | 'planets' | 'transformations';
  currentPage: number;
  searchTerm: string;
  isLoading: boolean;
  characters: Character[];
  planets: Planet[];
  transformations: Transformation[];
  totalCharacters: number;
  totalPlanets: number;
  totalTransformations: number;
  totalPages: number;
  currentView: 'home' | 'detail';
  currentDetailId: number | null;
  currentDetailType: 'character' | 'planet' | 'transformation' | null;
}

export class DragonBallApp {
  private state$ = new BehaviorSubject<AppState>({
    currentTab: 'characters',
    currentPage: 1,
    searchTerm: '',
    isLoading: false,
    characters: [],
    planets: [],
    transformations: [],
    totalCharacters: 0,
    totalPlanets: 0,
    totalTransformations: 0,
    totalPages: 1,
    currentView: 'home',
    currentDetailId: null,
    currentDetailType: null
  });

  private readonly ITEMS_PER_PAGE = 12;
  
  // Cache para evitar peticiones repetidas
  private cache = new Map<string, any>();
  private dataLoaded = {
    characters: false,
    planets: false,
    transformations: false,
    stats: false
  };

  // Transformation viewer state
  private currentTransformations: Transformation[] = [];
  private currentTransformationIndex = 0;
  private isTransformationPlaying = false;
  private transformationInterval: number | null = null;

  constructor() {
    this.initializeApp();
    this.setupEventListeners();
    this.setupDataStreams();
  }

  private initializeApp(): void {
    this.loadInitialData();
  }

  private setupEventListeners(): void {
    // Navegación por pestañas - Desktop
    const charactersTab = document.getElementById('characters-tab') as HTMLButtonElement;
    const planetsTab = document.getElementById('planets-tab') as HTMLButtonElement;
    const transformationsTab = document.getElementById('transformations-tab') as HTMLButtonElement;

    charactersTab?.addEventListener('click', () => this.switchTab('characters'));
    planetsTab?.addEventListener('click', () => this.switchTab('planets'));
    transformationsTab?.addEventListener('click', () => this.switchTab('transformations'));

    // Navegación por pestañas - Mobile
    const charactersTabMobile = document.getElementById('characters-tab-mobile') as HTMLButtonElement;
    const planetsTabMobile = document.getElementById('planets-tab-mobile') as HTMLButtonElement;
    const transformationsTabMobile = document.getElementById('transformations-tab-mobile') as HTMLButtonElement;

    charactersTabMobile?.addEventListener('click', () => {
      this.switchTab('characters');
      this.closeMobileMenu();
    });
    planetsTabMobile?.addEventListener('click', () => {
      this.switchTab('planets');
      this.closeMobileMenu();
    });
    transformationsTabMobile?.addEventListener('click', () => {
      this.switchTab('transformations');
      this.closeMobileMenu();
    });

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn') as HTMLButtonElement;
    mobileMenuBtn?.addEventListener('click', () => this.toggleMobileMenu());

    // Búsqueda
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('search-btn') as HTMLButtonElement;

    if (searchInput) {
      fromEvent(searchInput, 'input')
        .pipe(
          map((event) => (event.target as HTMLInputElement).value),
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe((searchTerm) => {
          this.updateState({ searchTerm, currentPage: 1 });
        });
    }

    searchBtn?.addEventListener('click', () => {
      const searchTerm = searchInput?.value || '';
      this.updateState({ searchTerm, currentPage: 1 });
    });

    // Paginación
    const prevPageBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextPageBtn = document.getElementById('next-page') as HTMLButtonElement;

    prevPageBtn?.addEventListener('click', () => {
      const currentState = this.state$.value;
      if (currentState.currentPage > 1) {
        this.updateState({ currentPage: currentState.currentPage - 1 });
      }
    });

    nextPageBtn?.addEventListener('click', () => {
      const currentState = this.state$.value;
      if (currentState.currentPage < currentState.totalPages) {
        this.updateState({ currentPage: currentState.currentPage + 1 });
      }
    });

    // Modal
    const closeModalBtn = document.getElementById('close-modal') as HTMLButtonElement;
    const modal = document.getElementById('detail-modal') as HTMLDivElement;

    closeModalBtn?.addEventListener('click', () => this.closeModal());
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.closeModal();
      }
    });

    // Error message
    const closeErrorBtn = document.getElementById('close-error') as HTMLButtonElement;
    closeErrorBtn?.addEventListener('click', () => this.hideError());

    // Back button
    const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    backBtn?.addEventListener('click', () => this.goBack());

    // Transformation modal
    const closeTransformationModalBtn = document.getElementById('close-transformation-modal') as HTMLButtonElement;
    const prevTransformationBtn = document.getElementById('prev-transformation') as HTMLButtonElement;
    const nextTransformationBtn = document.getElementById('next-transformation') as HTMLButtonElement;
    const playTransformationBtn = document.getElementById('play-transformation') as HTMLButtonElement;

    closeTransformationModalBtn?.addEventListener('click', () => this.closeTransformationModal());
    prevTransformationBtn?.addEventListener('click', () => this.previousTransformation());
    nextTransformationBtn?.addEventListener('click', () => this.nextTransformation());
    playTransformationBtn?.addEventListener('click', () => this.playTransformationSequence());
  }

  private setupDataStreams(): void {
    // Stream optimizado que solo actualiza la UI
    this.state$
      .pipe(
        tap(state => this.updateUI(state))
      )
      .subscribe(state => {
        // Solo cargar datos cuando realmente sea necesario
        if (state.currentView === 'home') {
          // Usar un pequeño delay para evitar condiciones de carrera
          setTimeout(() => {
            this.loadDataIfNeeded(state);
          }, 0);
        }
      });
  }

  private loadDataIfNeeded(state: AppState): void {
    const cacheKey = `${state.currentTab}-${state.currentPage}-${state.searchTerm}`;
    
    // Si ya tenemos los datos en caché, renderizarlos
    if (this.cache.has(cacheKey)) {
      const cachedData = this.cache.get(cacheKey);
      this.renderCachedData(state.currentTab, cachedData);
      return;
    }

    // Solo cargar si no está ya cargado o si es una búsqueda
    if (state.searchTerm) {
      this.performSearch(state.searchTerm, state.currentTab, cacheKey);
    } else {
      this.loadTabData(state.currentTab, state.currentPage, cacheKey);
    }
  }

  private loadInitialData(): void {
    // Solo cargar estadísticas si no se han cargado antes
    if (this.dataLoaded.stats) {
      this.loadTabData('characters', 1, 'characters-1-');
      return;
    }

    this.showLoading(true);
    
    // Cargar estadísticas iniciales una sola vez
    combineLatest([
      dragonBallApi.getCharacters(1, 1),
      dragonBallApi.getPlanets(1, 1),
      dragonBallApi.getTransformations(1, 1)
    ]).subscribe({
      next: ([charactersResponse, planetsResponse, transformationsResponse]) => {
        console.log('Cargando estadísticas iniciales...');
        
        const totalCharacters = charactersResponse?.meta?.totalItems || 0;
        const totalPlanets = planetsResponse?.meta?.totalItems || 0;
        const totalTransformations = transformationsResponse?.meta?.totalItems || 0;
        
        this.updateState({
          totalCharacters,
          totalPlanets,
          totalTransformations
        });
        
        this.dataLoaded.stats = true;
        
        // Cargar primera página de personajes
        this.loadTabData('characters', 1, 'characters-1-');
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.showError('Error al cargar los datos iniciales');
        this.showLoading(false);
      }
    });
  }

  private renderCachedData(tab: string, data: any): void {
    switch (tab) {
      case 'characters':
        this.renderCharacters(data);
        break;
      case 'planets':
        this.renderPlanets(data);
        break;
      case 'transformations':
        this.renderTransformations(data);
        break;
    }
  }

  private performSearch(searchTerm: string, tab: string, cacheKey: string): void {
    this.showLoading(true);
    
    switch (tab) {
      case 'characters':
        dragonBallApi.searchCharacters(searchTerm).subscribe({
          next: (characters) => {
            // Validar que la respuesta sea un array válido
            const validCharacters = Array.isArray(characters) ? characters : [];
            
            this.cache.set(cacheKey, validCharacters);
            this.updateState({ characters: validCharacters, totalPages: 1 });
            this.renderCharacters(validCharacters);
            this.showLoading(false);
          },
          error: (error) => {
            console.error('Error searching characters:', error);
            this.showError('Error en la búsqueda');
            this.updateState({ characters: [] });
            this.renderCharacters([]);
            this.showLoading(false);
          }
        });
        break;
      
      case 'planets':
        dragonBallApi.getPlanets(1, 100).subscribe({
          next: (response) => {
            // Validar que la respuesta tenga la estructura esperada
            const items = response && response.items && Array.isArray(response.items) ? response.items : [];
            const filteredPlanets = items.filter(planet => 
              planet.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            this.cache.set(cacheKey, filteredPlanets);
            this.updateState({ planets: filteredPlanets, totalPages: 1 });
            this.renderPlanets(filteredPlanets);
            this.showLoading(false);
          },
          error: (error) => {
            console.error('Error searching planets:', error);
            this.showError('Error en la búsqueda');
            this.updateState({ planets: [] });
            this.renderPlanets([]);
            this.showLoading(false);
          }
        });
        break;
      
      case 'transformations':
        dragonBallApi.getTransformations(1, 100).subscribe({
          next: (response) => {
            // Validar que la respuesta tenga la estructura esperada
            const items = response && response.items && Array.isArray(response.items) ? response.items : [];
            const filteredTransformations = items.filter(transformation => 
              transformation.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            
            this.cache.set(cacheKey, filteredTransformations);
            this.updateState({ transformations: filteredTransformations, totalPages: 1 });
            this.renderTransformations(filteredTransformations);
            this.showLoading(false);
          },
          error: (error) => {
            console.error('Error searching transformations:', error);
            this.showError('Error en la búsqueda');
            this.updateState({ transformations: [] });
            this.renderTransformations([]);
            this.showLoading(false);
          }
        });
        break;
    }
  }

  private loadTabData(tab: string, page: number, cacheKey: string): void {
    // Verificar si ya tenemos los datos cargados para esta pestaña
    if (this.dataLoaded[tab as keyof typeof this.dataLoaded] && page === 1 && !cacheKey.includes('search')) {
      return; // No recargar si ya tenemos los datos
    }

    this.showLoading(true);
    
    const dataStream = this.loadPageData(tab, page);
    if (dataStream) {
      dataStream.subscribe({
        next: (response: any) => {
          if (response && response.items) {
            this.cache.set(cacheKey, response.items);
            this.dataLoaded[tab as keyof typeof this.dataLoaded] = true;
          }
          this.showLoading(false);
        },
        error: (error: any) => {
          console.error(`Error loading ${tab} data:`, error);
          this.showError(`Error al cargar los datos de ${tab}`);
          this.showLoading(false);
        }
      });
    }
  }

  private loadPageData(tab: string, page: number): Observable<any> | null {
    this.showLoading(true);
    
    switch (tab) {
      case 'characters':
        return dragonBallApi.getCharacters(page, this.ITEMS_PER_PAGE)
          .pipe(
            tap(response => {
              this.updateState({
                characters: response.items,
                totalPages: response.meta.totalPages,
                isLoading: false
              });
              this.renderCharacters(response.items);
              this.showLoading(false);
            })
          );
      
      case 'planets':
        return dragonBallApi.getPlanets(page, this.ITEMS_PER_PAGE)
          .pipe(
            tap(response => {
              this.updateState({
                planets: response.items,
                totalPages: response.meta.totalPages,
                isLoading: false
              });
              this.renderPlanets(response.items);
              this.showLoading(false);
            })
          );
      
      case 'transformations':
        return dragonBallApi.getTransformations(page, this.ITEMS_PER_PAGE)
          .pipe(
            tap(response => {
              this.updateState({
                transformations: response.items,
                totalPages: response.meta.totalPages,
                isLoading: false
              });
              this.renderTransformations(response.items);
              this.showLoading(false);
            })
          );
      
      default:
        this.showLoading(false);
        return of(null);
    }
  }


  private updateState(newState: Partial<AppState>): void {
    const currentState = this.state$.value;
    this.state$.next({ ...currentState, ...newState });
  }

  // Método para limpiar caché si es necesario
  private clearCache(): void {
    this.cache.clear();
    this.dataLoaded = {
      characters: false,
      planets: false,
      transformations: false,
      stats: false
    };
  }

  private updateUI(state: AppState): void {
    // Manejar vistas
    const homeView = document.getElementById('home-view');
    const detailView = document.getElementById('detail-view');
    
    if (state.currentView === 'home') {
      homeView?.classList.remove('hidden');
      detailView?.classList.add('hidden');
      
      // Actualizar pestañas activas - Desktop
      document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`${state.currentTab}-tab`)?.classList.add('active');
      
      // Actualizar pestañas activas - Mobile
      document.querySelectorAll('.nav-btn-mobile').forEach(btn => btn.classList.remove('active'));
      document.getElementById(`${state.currentTab}-tab-mobile`)?.classList.add('active');

      // Actualizar estadísticas
      const totalCharactersEl = document.getElementById('total-characters');
      const totalPlanetsEl = document.getElementById('total-planets');
      const totalTransformationsEl = document.getElementById('total-transformations');

      if (totalCharactersEl) totalCharactersEl.textContent = state.totalCharacters.toString();
      if (totalPlanetsEl) totalPlanetsEl.textContent = state.totalPlanets.toString();
      if (totalTransformationsEl) totalTransformationsEl.textContent = state.totalTransformations.toString();

      // Actualizar paginación
      this.updatePagination(state.currentPage, state.totalPages);
    } else if (state.currentView === 'detail') {
      homeView?.classList.add('hidden');
      detailView?.classList.remove('hidden');
      
      // Cerrar menú móvil si está abierto
      this.closeMobileMenu();
      
      // Cargar detalles si es necesario
      if (state.currentDetailId && state.currentDetailType) {
        this.loadDetailPage(state.currentDetailType, state.currentDetailId);
      }
    }
  }

  private toggleMobileMenu(): void {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const icon = mobileMenuBtn?.querySelector('i');
    
    if (mobileMenu?.classList.contains('hidden')) {
      mobileMenu.classList.remove('hidden');
      icon?.classList.remove('fa-bars');
      icon?.classList.add('fa-times');
    } else {
      mobileMenu?.classList.add('hidden');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    }
  }

  private closeMobileMenu(): void {
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const icon = mobileMenuBtn?.querySelector('i');
    
    mobileMenu?.classList.add('hidden');
    icon?.classList.remove('fa-times');
    icon?.classList.add('fa-bars');
  }

  private updatePagination(currentPage: number, totalPages: number): void {
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    const pageInfo = document.getElementById('page-info');

    if (prevBtn) {
      prevBtn.disabled = currentPage <= 1;
    }

    if (nextBtn) {
      nextBtn.disabled = currentPage >= totalPages;
    }

    if (pageInfo) {
      pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
  }

  private switchTab(tab: 'characters' | 'planets' | 'transformations'): void {
    const currentState = this.state$.value;
    
    // Si estamos en la vista de detalles, siempre cambiar a home
    // Si estamos en home y es la misma pestaña, no hacer nada
    if (currentState.currentView === 'home' && currentState.currentTab === tab) {
      return; // No hacer nada si ya estamos en esa pestaña en la vista home
    }

    this.updateState({ 
      currentTab: tab, 
      currentPage: 1, 
      searchTerm: '',
      currentView: 'home', // Siempre volver a la vista home
      currentDetailId: null, // Limpiar detalles
      currentDetailType: null // Limpiar tipo de detalle
    });
    
    // Limpiar búsqueda
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    if (searchInput) searchInput.value = '';

    // Los datos se cargarán automáticamente a través del stream optimizado
    // Solo si no están ya cargados o en caché
  }

  // Métodos públicos para renderizado y modales
  public renderCharacters(characters: Character[]): void {
    console.log('renderCharacters called with:', characters, 'length:', characters?.length);
    
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) {
      console.warn('contentGrid element not found');
      return;
    }

    // Validar que characters sea un array válido
    if (!Array.isArray(characters)) {
      console.warn('renderCharacters: characters is not an array:', characters);
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron personajes</div>';
      return;
    }

    if (characters.length === 0) {
      console.log('renderCharacters: empty array, showing no results message');
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron personajes</div>';
      return;
    }

    console.log('renderCharacters: rendering', characters.length, 'characters');

    contentGrid.innerHTML = characters.map(character => `
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

  public renderPlanets(planets: Planet[]): void {
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) return;

    // Validar que planets sea un array válido
    if (!Array.isArray(planets)) {
      console.warn('renderPlanets: planets is not an array:', planets);
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron planetas</div>';
      return;
    }

    if (planets.length === 0) {
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron planetas</div>';
      return;
    }

    contentGrid.innerHTML = planets.map(planet => `
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
          <div class="flex items-center mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${planet.isDestroyed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}">
              <i class="fas fa-${planet.isDestroyed ? 'skull' : 'check'} mr-1"></i>
              ${planet.isDestroyed ? 'Destruido' : 'Intacto'}
            </span>
          </div>
          <p class="text-gray-300 text-sm line-clamp-3">${planet.description}</p>
        </div>
      </div>
    `).join('');
  }

  public renderTransformations(transformations: Transformation[]): void {
    const contentGrid = document.getElementById('content-grid');
    if (!contentGrid) return;

    // Validar que transformations sea un array válido
    if (!Array.isArray(transformations)) {
      console.warn('renderTransformations: transformations is not an array:', transformations);
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron transformaciones</div>';
      return;
    }

    if (transformations.length === 0) {
      contentGrid.innerHTML = '<div class="col-span-full text-center text-white py-8">No se encontraron transformaciones</div>';
      return;
    }

    contentGrid.innerHTML = transformations.map(transformation => `
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

  // Métodos de utilidad

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

  // Métodos para navegación y páginas de detalles
  public navigateToDetail(type: 'character' | 'planet' | 'transformation', id: number): void {
    this.updateState({
      currentView: 'detail',
      currentDetailType: type,
      currentDetailId: id
    });
  }

  public goBack(): void {
    this.updateState({
      currentView: 'home',
      currentDetailType: null,
      currentDetailId: null
    });
  }

  private loadDetailPage(type: 'character' | 'planet' | 'transformation', id: number): void {
    const detailContent = document.getElementById('detail-content');
    if (!detailContent) return;

    this.showLoading(true);

    switch (type) {
      case 'character':
        dragonBallApi.getCharacterById(id).subscribe({
          next: (character) => {
            if (character) {
              detailContent.innerHTML = this.renderCharacterDetailPage(character);
            }
            this.showLoading(false);
          },
          error: (error) => {
            console.error('Error loading character detail:', error);
            this.showError('Error al cargar los detalles del personaje');
            this.showLoading(false);
          }
        });
        break;

      case 'planet':
        // Buscar el planeta en el estado actual
        const planet = this.state$.value.planets.find(p => p.id === id);
        if (planet) {
          detailContent.innerHTML = this.renderPlanetDetailPage(planet);
          this.showLoading(false);
        } else {
          // Si no está en el estado, cargar desde la API
          dragonBallApi.getPlanets(1, 100).subscribe({
            next: (response) => {
              const foundPlanet = response.items.find(p => p.id === id);
              if (foundPlanet) {
                detailContent.innerHTML = this.renderPlanetDetailPage(foundPlanet);
              }
              this.showLoading(false);
            },
            error: (error) => {
              console.error('Error loading planet detail:', error);
              this.showError('Error al cargar los detalles del planeta');
              this.showLoading(false);
            }
          });
        }
        break;

      case 'transformation':
        // Buscar la transformación en el estado actual
        const transformation = this.state$.value.transformations.find(t => t.id === id);
        if (transformation) {
          detailContent.innerHTML = this.renderTransformationDetailPage(transformation);
          this.showLoading(false);
        } else {
          // Si no está en el estado, cargar desde la API
          dragonBallApi.getTransformations(1, 100).subscribe({
            next: (response) => {
              const foundTransformation = response.items.find(t => t.id === id);
              if (foundTransformation) {
                detailContent.innerHTML = this.renderTransformationDetailPage(foundTransformation);
              }
              this.showLoading(false);
            },
            error: (error) => {
              console.error('Error loading transformation detail:', error);
              this.showError('Error al cargar los detalles de la transformación');
              this.showLoading(false);
            }
          });
        }
        break;
    }
  }

  private renderCharacterDetailPage(character: Character): string {
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
                <div class="flex justify-between items-center py-2">
                  <span class="text-gray-300 font-medium">Afiliación:</span>
                  <span class="text-white font-semibold">${character.affiliation}</span>
                </div>
              </div>
            </div>
            
            <div class="bg-black/30 backdrop-blur-md border border-orange-500/30 rounded-2xl p-6">
              <h3 class="text-2xl font-semibold text-orange-400 mb-4 flex items-center">
                <i class="fas fa-bolt mr-3"></i>
                Nivel de Poder
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-300 font-medium">Ki Base:</span>
                    <span class="text-white font-bold text-xl">${character.ki}</span>
                  </div>
                  <div class="power-level-bar h-4">
                    <div class="power-level-fill h-full" style="width: ${this.calculatePowerPercentage(character.ki)}%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-300 font-medium">Ki Máximo:</span>
                    <span class="text-white font-bold text-xl">${character.maxKi}</span>
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

  private renderPlanetDetailPage(planet: Planet): string {
    return `
      <div class="p-8">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold text-white font-orbitron mb-4">${planet.name}</h1>
          <div class="flex justify-center mb-6">
            <span class="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium ${planet.isDestroyed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}">
              <i class="fas fa-${planet.isDestroyed ? 'skull' : 'check'} mr-3 text-xl"></i>
              ${planet.isDestroyed ? 'Planeta Destruido' : 'Planeta Intacto'}
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
                Estado del Planeta
              </h3>
              <div class="text-center">
                <div class="inline-flex items-center px-8 py-4 rounded-2xl text-xl font-bold ${planet.isDestroyed ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}">
                  <i class="fas fa-${planet.isDestroyed ? 'skull' : 'check'} mr-4 text-2xl"></i>
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

  private renderTransformationDetailPage(transformation: Transformation): string {
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
                Poder de Transformación
              </h3>
              <div class="space-y-4">
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <span class="text-gray-300 font-medium">Nivel de Ki:</span>
                    <span class="text-white font-bold text-xl">${transformation.ki}</span>
                  </div>
                  <div class="power-level-bar h-6">
                    <div class="power-level-fill h-full" style="width: ${this.calculatePowerPercentage(transformation.ki)}%"></div>
                  </div>
                </div>
                <div class="text-center mt-6">
                  <div class="inline-flex items-center px-6 py-3 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <i class="fas fa-fire mr-3"></i>
                    <span class="font-bold">Poder: ${transformation.ki}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private openModal(title: string, content: string): void {
    const modal = document.getElementById('detail-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');

    if (modal && modalTitle && modalContent) {
      modalTitle.textContent = title;
      modalContent.innerHTML = content;
      modal.classList.remove('hidden');
      modal.classList.add('modal-enter');
    }
  }

  private closeModal(): void {
    const modal = document.getElementById('detail-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('modal-enter');
    }
  }

  private showLoading(show: boolean): void {
    const loading = document.getElementById('loading');
    if (loading) {
      if (show) {
        loading.classList.remove('hidden');
      } else {
        loading.classList.add('hidden');
      }
    }
  }

  private showError(message: string): void {
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorMessage && errorText) {
      errorText.textContent = message;
      errorMessage.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideError();
      }, 5000);
    }
  }

  private hideError(): void {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.classList.add('hidden');
    }
  }

  // Transformation Viewer Methods
  public showTransformations(characterName: string, characterId: number): void {
    console.log(`Loading transformations for ${characterName}`);
    this.showLoading(true);

    dragonBallApi.getCharacterTransformations(characterName).subscribe({
      next: (transformations) => {
        this.currentTransformations = transformations;
        this.currentTransformationIndex = 0;
        
        if (transformations.length > 0) {
          this.openTransformationModal(characterName);
          this.displayCurrentTransformation();
        } else {
          this.showError(`No se encontraron transformaciones para ${characterName}`);
        }
        this.showLoading(false);
      },
      error: (error) => {
        console.error('Error loading transformations:', error);
        this.showError('Error al cargar las transformaciones');
        this.showLoading(false);
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

  private closeTransformationModal(): void {
    const modal = document.getElementById('transformation-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('modal-enter');
    }
    
    // Limpiar cualquier animación en curso
    this.stopTransformationSequence();
  }

  private displayCurrentTransformation(): void {
    if (this.currentTransformations.length === 0) return;

    const transformation = this.currentTransformations[this.currentTransformationIndex];
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

    if (prevBtn && nextBtn && playBtn) {
      prevBtn.disabled = this.currentTransformationIndex === 0;
      nextBtn.disabled = this.currentTransformationIndex === this.currentTransformations.length - 1;
      
      if (this.isTransformationPlaying) {
        playBtn.innerHTML = '<i class="fas fa-pause mr-2"></i>Pausar';
      } else {
        playBtn.innerHTML = '<i class="fas fa-play mr-2"></i>Transformar';
      }
    }
  }

  private previousTransformation(): void {
    if (this.currentTransformationIndex > 0) {
      this.currentTransformationIndex--;
      this.animateTransformation();
    }
  }

  private nextTransformation(): void {
    if (this.currentTransformationIndex < this.currentTransformations.length - 1) {
      this.currentTransformationIndex++;
      this.animateTransformation();
    }
  }

  private playTransformationSequence(): void {
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
        this.displayCurrentTransformation();
      }, 300);
    }
  }

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
}
