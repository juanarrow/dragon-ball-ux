import { combineLatest, debounceTime, distinctUntilChanged, fromEvent, map, switchMap, tap, catchError, of, Observable, filter, shareReplay } from 'rxjs';
import { dragonBallApi } from './api';
import { Character, Planet, Transformation } from './types';

// Importar módulos
import { StateManager, AppState } from './managers/StateManager';
import { UIManager } from './managers/UIManager';
import { CharactersModule } from './modules/CharactersModule';
import { PlanetsModule } from './modules/PlanetsModule';
import { TransformationsModule } from './modules/TransformationsModule';

export class DragonBallApp {
  private readonly ITEMS_PER_PAGE = 12;
  
  // Managers y módulos
  private stateManager: StateManager;
  private uiManager: UIManager;
  private charactersModule: CharactersModule;
  private planetsModule: PlanetsModule;
  private transformationsModule: TransformationsModule;
  
  // Control de carga de detalles para evitar recursión
  private isLoadingDetail = false;

  constructor() {
    // Inicializar managers y módulos
    this.stateManager = new StateManager();
    this.uiManager = new UIManager();
    this.charactersModule = new CharactersModule(this.stateManager);
    this.planetsModule = new PlanetsModule(this.stateManager);
    this.transformationsModule = new TransformationsModule(this.stateManager);

    this.initializeApp();
    this.setupEventListeners();
    this.setupDataStreams();
    this.loadInitialData();
  }

  private initializeApp(): void {
    // La inicialización ahora se maneja en los managers
    console.log('Dragon Ball App initialized with modular architecture');
  }

  private setupEventListeners(): void {
    // Tabs de navegación - Desktop
    const charactersTab = document.getElementById('characters-tab') as HTMLButtonElement;
    const planetsTab = document.getElementById('planets-tab') as HTMLButtonElement;
    const transformationsTab = document.getElementById('transformations-tab') as HTMLButtonElement;

    if (charactersTab) {
      fromEvent(charactersTab, 'click').subscribe(() => this.switchTab('characters'));
    }
    if (planetsTab) {
      fromEvent(planetsTab, 'click').subscribe(() => this.switchTab('planets'));
    }
    if (transformationsTab) {
      fromEvent(transformationsTab, 'click').subscribe(() => this.switchTab('transformations'));
    }

    // Tabs de navegación - Mobile
    const charactersTabMobile = document.getElementById('characters-tab-mobile') as HTMLButtonElement;
    const planetsTabMobile = document.getElementById('planets-tab-mobile') as HTMLButtonElement;
    const transformationsTabMobile = document.getElementById('transformations-tab-mobile') as HTMLButtonElement;

    if (charactersTabMobile) {
      fromEvent(charactersTabMobile, 'click').subscribe(() => {
        this.switchTab('characters');
        this.uiManager.closeMobileMenu();
      });
    }
    if (planetsTabMobile) {
      fromEvent(planetsTabMobile, 'click').subscribe(() => {
        this.switchTab('planets');
        this.uiManager.closeMobileMenu();
      });
    }
    if (transformationsTabMobile) {
      fromEvent(transformationsTabMobile, 'click').subscribe(() => {
        this.switchTab('transformations');
        this.uiManager.closeMobileMenu();
      });
    }

    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn') as HTMLButtonElement;
    if (mobileMenuBtn) {
      fromEvent(mobileMenuBtn, 'click').subscribe((e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        this.uiManager.toggleMobileMenu();
      });
    }

    // Paginación
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;

    console.log('Pagination event listeners setup:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn });

    if (prevBtn) {
      fromEvent(prevBtn, 'click').subscribe(() => {
        console.log('Previous page clicked');
        this.changePage(-1);
      });
    }
    if (nextBtn) {
      fromEvent(nextBtn, 'click').subscribe(() => {
        console.log('Next page clicked');
        this.changePage(1);
      });
    }

    // Error message
    const closeErrorBtn = document.getElementById('close-error') as HTMLButtonElement;
    if (closeErrorBtn) {
      fromEvent(closeErrorBtn, 'click').subscribe(() => this.uiManager.hideError());
    }

    // Back button
    const backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    if (backBtn) {
      fromEvent(backBtn, 'click').subscribe(() => this.goBack());
    }

    // Transformation modal
    const closeTransformationModalBtn = document.getElementById('close-transformation-modal') as HTMLButtonElement;
    const prevTransformationBtn = document.getElementById('prev-transformation') as HTMLButtonElement;
    const nextTransformationBtn = document.getElementById('next-transformation') as HTMLButtonElement;
    const playTransformationBtn = document.getElementById('play-transformation') as HTMLButtonElement;

    console.log('Setting up transformation modal event listeners:', {
      closeBtn: !!closeTransformationModalBtn,
      prevBtn: !!prevTransformationBtn,
      nextBtn: !!nextTransformationBtn,
      playBtn: !!playTransformationBtn
    });

    if (closeTransformationModalBtn) {
      fromEvent(closeTransformationModalBtn, 'click').subscribe(() => {
        console.log('Close button clicked');
        this.transformationsModule.closeTransformationModal();
      });
    }
    
    if (prevTransformationBtn) {
      fromEvent(prevTransformationBtn, 'click').subscribe(() => {
        console.log('Previous button clicked');
        this.transformationsModule.previousTransformation();
      });
    }
    
    if (nextTransformationBtn) {
      fromEvent(nextTransformationBtn, 'click').subscribe(() => {
        console.log('Next button clicked');
        this.transformationsModule.nextTransformation();
      });
    }
    
    if (playTransformationBtn) {
      fromEvent(playTransformationBtn, 'click').subscribe(() => {
        console.log('Play button clicked');
        this.transformationsModule.playTransformationSequence();
      });
    }

    // Event listener para errores desde módulos
    fromEvent(window, 'showError').subscribe((event: any) => {
      this.uiManager.showError(event.detail);
    });
  }

  private setupDataStreams(): void {
    // Stream optimizado que solo actualiza la UI
    this.stateManager.state$
      .pipe(
        tap(state => this.updateUI(state))
      )
      .subscribe();

    // Stream para búsqueda con debounce
    if (this.uiManager.searchInput) {
      fromEvent(this.uiManager.searchInput, 'input')
        .pipe(
          map((event: any) => event.target.value),
          debounceTime(300),
          distinctUntilChanged()
        )
        .subscribe(searchTerm => {
          this.stateManager.updateState({ searchTerm, currentPage: 1 });
          
          // Solo cargar datos si estamos en la vista home
          if (this.stateManager.currentState.currentView === 'home') {
            setTimeout(() => this.loadDataIfNeeded(), 0);
          }
        });
    }
  }

  private updateUI(state: AppState): void {
    // Actualizar vista actual
    if (state.currentView === 'home') {
      this.uiManager.showHomeView();
    } else {
      this.uiManager.showDetailView();
      // Solo cargar detalles si tenemos ID y tipo, y no estamos ya cargando detalles
      if (state.currentDetailId && state.currentDetailType && !this.isLoadingDetail) {
        this.loadDetailPage();
      }
    }

    // Actualizar tabs activos
    this.uiManager.updateActiveTab(state.currentTab);

    // Actualizar loading
    this.uiManager.showLoading(state.isLoading);

    // Actualizar paginación
    console.log('About to update pagination with state:', { 
      currentPage: state.currentPage, 
      totalPages: state.totalPages,
      currentTab: state.currentTab,
      totalCharacters: state.totalCharacters,
      totalPlanets: state.totalPlanets,
      totalTransformations: state.totalTransformations
    });
    this.uiManager.updatePagination(state.currentPage, state.totalPages);

    // Actualizar estadísticas
    this.uiManager.updateStats(state.totalCharacters, state.totalPlanets, state.totalTransformations);
  }

  private loadDataIfNeeded(): void {
    const state = this.stateManager.currentState;
    const { currentTab, currentPage, searchTerm } = state;
    
    if (searchTerm.trim()) {
      this.performSearch(searchTerm, currentTab);
    } else {
      this.loadTabData(currentTab, currentPage);
    }
  }

  private loadTabData(tab: string, page: number): void {
    console.log(`Loading tab data: ${tab}, page: ${page}`);
    const cacheKey = this.stateManager.getCacheKey(tab, page);
    
    // Verificar cache primero
    if (this.stateManager.hasCachedData(cacheKey)) {
      console.log(`Using cached data for ${tab} page ${page}`);
      this.renderCachedData(tab, cacheKey);
      return;
    }

    // Verificar si ya hemos cargado esta data y está en cache
    const dataLoadedKey = tab as keyof typeof this.stateManager.dataLoaded;
    if (page === 1 && this.stateManager.isDataLoaded(dataLoadedKey) && this.stateManager.hasCachedData(cacheKey)) {
      console.log(`Using previously loaded data for ${tab}`);
      this.renderCachedData(tab, cacheKey);
      return;
    }

    this.stateManager.updateState({ isLoading: true });

    const loadPageData = (tab: string, page: number): Observable<any> | null => {
      switch (tab) {
        case 'characters':
          return this.charactersModule.loadCharacters(page, this.ITEMS_PER_PAGE);
        case 'planets':
          return this.planetsModule.loadPlanets(page, this.ITEMS_PER_PAGE);
        case 'transformations':
          return this.transformationsModule.loadTransformations(page, this.ITEMS_PER_PAGE);
        default:
          return null;
      }
    };

    const dataStream = loadPageData(tab, page);
    if (!dataStream) {
      this.stateManager.updateState({ isLoading: false });
      return;
    }

    dataStream.subscribe({
      next: (response) => {
        console.log(`API response for ${tab} page ${page}:`, response);
        const items = response.items || [];
        const meta = response.meta || {};
        
        console.log(`Items received: ${items.length}, Total items: ${meta.totalItems}`);
        
        // Actualizar estado
        const stateUpdate: Partial<AppState> = {
          isLoading: false,
          totalPages: Math.ceil((meta.totalItems || 0) / this.ITEMS_PER_PAGE)
        };

        console.log(`Calculated total pages: ${stateUpdate.totalPages}`);

        switch (tab) {
          case 'characters':
            stateUpdate.characters = items;
            stateUpdate.totalCharacters = meta.totalItems || 0;
            break;
          case 'planets':
            stateUpdate.planets = items;
            stateUpdate.totalPlanets = meta.totalItems || 0;
            break;
          case 'transformations':
            stateUpdate.transformations = items;
            stateUpdate.totalTransformations = meta.totalItems || 0;
            break;
        }

        this.stateManager.updateState(stateUpdate);

        // Guardar en cache
        this.stateManager.setCachedData(cacheKey, items);
        this.stateManager.setDataLoaded(dataLoadedKey, true);

        // Renderizar
        this.renderCurrentTab(tab, items);
      },
      error: (error: any) => {
        console.error(`Error loading ${tab}:`, error);
        this.uiManager.showError(`Error al cargar ${tab}`);
        this.stateManager.updateState({ isLoading: false });
      }
    });
  }

  private renderCachedData(tab: string, cacheKey: string): void {
    const data = this.stateManager.getCachedData(cacheKey) || [];
    
    // Asegurar que el estado esté actualizado correctamente
    const currentState = this.stateManager.currentState;
    let totalPages = 1;
    
    switch (tab) {
      case 'characters':
        totalPages = Math.ceil(currentState.totalCharacters / this.ITEMS_PER_PAGE);
        break;
      case 'planets':
        totalPages = Math.ceil(currentState.totalPlanets / this.ITEMS_PER_PAGE);
        break;
      case 'transformations':
        totalPages = Math.ceil(currentState.totalTransformations / this.ITEMS_PER_PAGE);
        break;
    }
    
    this.stateManager.updateState({ 
      isLoading: false,
      totalPages: totalPages
    });
    
    this.renderCurrentTab(tab, data);
  }

  private renderCurrentTab(tab: string, data: any[]): void {
    let html = '';
    
    switch (tab) {
      case 'characters':
        html = this.charactersModule.renderCharacters(data);
        break;
      case 'planets':
        html = this.planetsModule.renderPlanets(data);
        break;
      case 'transformations':
        html = this.transformationsModule.renderTransformations(data);
        break;
    }

    this.uiManager.renderContent(html);
  }

  private performSearch(searchTerm: string, tab: string): void {
    this.stateManager.updateState({ isLoading: true });

    switch (tab) {
      case 'characters':
        this.charactersModule.searchCharacters(searchTerm).subscribe({
          next: (characters) => {
            // Calcular totalPages correctamente para búsqueda
            const searchTotalPages = Math.ceil(characters.length / this.ITEMS_PER_PAGE);
            console.log('Search results - characters:', characters.length, 'totalPages:', searchTotalPages);
            
            this.stateManager.updateState({ 
              characters, 
              isLoading: false,
              totalPages: searchTotalPages 
            });
            this.uiManager.renderContent(this.charactersModule.renderCharacters(characters));
          },
          error: (error: any) => {
            console.error('Error searching characters:', error);
            this.uiManager.showError('Error al buscar personajes');
            this.stateManager.updateState({ 
              characters: [], 
              isLoading: false 
            });
            this.uiManager.renderContent(this.charactersModule.renderCharacters([]));
          }
        });
        break;

      case 'planets':
        // Para planetas, filtramos localmente
        const allPlanets = this.stateManager.currentState.planets;
        if (allPlanets.length > 0) {
          const filteredPlanets = this.planetsModule.filterPlanetsByName(allPlanets, searchTerm);
          const planetsTotalPages = Math.ceil(filteredPlanets.length / this.ITEMS_PER_PAGE);
          console.log('Filtered planets:', filteredPlanets.length, 'totalPages:', planetsTotalPages);
          
          this.stateManager.updateState({ 
            planets: filteredPlanets, 
            isLoading: false,
            totalPages: planetsTotalPages 
          });
          this.uiManager.renderContent(this.planetsModule.renderPlanets(filteredPlanets));
        } else {
          // Si no tenemos datos, cargar primero
          this.planetsModule.loadPlanets(1, this.ITEMS_PER_PAGE).subscribe({
            next: (response) => {
              const allPlanets = response.items || [];
              const filteredPlanets = this.planetsModule.filterPlanetsByName(allPlanets, searchTerm);
              const planetsTotalPages2 = Math.ceil(filteredPlanets.length / this.ITEMS_PER_PAGE);
              console.log('Filtered planets (after load):', filteredPlanets.length, 'totalPages:', planetsTotalPages2);
              
              this.stateManager.updateState({ 
                planets: filteredPlanets, 
                isLoading: false,
                totalPages: planetsTotalPages2 
              });
              this.uiManager.renderContent(this.planetsModule.renderPlanets(filteredPlanets));
            },
            error: (error: any) => {
              console.error('Error searching planets:', error);
              this.uiManager.showError('Error al buscar planetas');
              this.stateManager.updateState({ 
                planets: [], 
                isLoading: false 
              });
              this.uiManager.renderContent(this.planetsModule.renderPlanets([]));
            }
          });
        }
        break;

      case 'transformations':
        // Para transformaciones, filtramos localmente
        const allTransformations = this.stateManager.currentState.transformations;
        if (allTransformations.length > 0) {
          const filteredTransformations = this.transformationsModule.filterTransformationsByName(allTransformations, searchTerm);
          const transformationsTotalPages = Math.ceil(filteredTransformations.length / this.ITEMS_PER_PAGE);
          console.log('Filtered transformations:', filteredTransformations.length, 'totalPages:', transformationsTotalPages);
          
          this.stateManager.updateState({ 
            transformations: filteredTransformations, 
            isLoading: false,
            totalPages: transformationsTotalPages 
          });
          this.uiManager.renderContent(this.transformationsModule.renderTransformations(filteredTransformations));
        } else {
          // Si no tenemos datos, cargar primero
          this.transformationsModule.loadTransformations(1, this.ITEMS_PER_PAGE).subscribe({
            next: (response) => {
              const allTransformations = response.items || [];
              const filteredTransformations = this.transformationsModule.filterTransformationsByName(allTransformations, searchTerm);
              const transformationsTotalPages2 = Math.ceil(filteredTransformations.length / this.ITEMS_PER_PAGE);
              console.log('Filtered transformations (after load):', filteredTransformations.length, 'totalPages:', transformationsTotalPages2);
              
              this.stateManager.updateState({ 
                transformations: filteredTransformations, 
                isLoading: false,
                totalPages: transformationsTotalPages2 
              });
              this.uiManager.renderContent(this.transformationsModule.renderTransformations(filteredTransformations));
            },
            error: (error: any) => {
              console.error('Error searching transformations:', error);
              this.uiManager.showError('Error al buscar transformaciones');
              this.stateManager.updateState({ 
                transformations: [], 
                isLoading: false 
              });
              this.uiManager.renderContent(this.transformationsModule.renderTransformations([]));
            }
          });
        }
        break;
    }
  }

  private loadInitialData(): void {
    // Cargar solo los personajes inicialmente (tab por defecto)
    this.loadTabData('characters', 1);
    
    // Cargar estadísticas de otros tipos sin renderizar
    if (!this.stateManager.isDataLoaded('stats')) {
      this.loadStatsOnly();
      this.stateManager.setDataLoaded('stats', true);
    }
  }

  private loadStatsOnly(): void {
    // Cargar solo para obtener totales, sin renderizar
    this.planetsModule.loadPlanets(1, this.ITEMS_PER_PAGE).subscribe({
      next: (response) => {
        const meta = response.meta || {};
        this.stateManager.updateState({
          totalPlanets: meta.totalItems || 0
        });
      },
      error: (error) => console.error('Error loading planets stats:', error)
    });

    this.transformationsModule.loadTransformations(1, this.ITEMS_PER_PAGE).subscribe({
      next: (response) => {
        const meta = response.meta || {};
        this.stateManager.updateState({
          totalTransformations: meta.totalItems || 0
        });
      },
      error: (error) => console.error('Error loading transformations stats:', error)
    });
  }

  // Métodos públicos para navegación
  public switchTab(tab: 'characters' | 'planets' | 'transformations'): void {
    const currentState = this.stateManager.currentState;
    
    // Solo actualizar si realmente cambia el tab o si estamos en vista de detalle
    if (currentState.currentTab !== tab || currentState.currentView !== 'home') {
      this.stateManager.updateState({
        currentTab: tab,
        currentPage: 1,
        searchTerm: '',
        currentView: 'home',
        currentDetailId: null,
        currentDetailType: null
      });
      
      // Limpiar búsqueda
      if (this.uiManager.searchInput) {
        this.uiManager.searchInput.value = '';
      }
      
      this.loadDataIfNeeded();
    }
  }

  public changePage(direction: number): void {
    const currentState = this.stateManager.currentState;
    const newPage = currentState.currentPage + direction;
    
    console.log('changePage called:', {
      direction,
      currentPage: currentState.currentPage,
      newPage,
      totalPages: currentState.totalPages,
      canChange: newPage >= 1 && newPage <= currentState.totalPages
    });
    
    if (newPage >= 1 && newPage <= currentState.totalPages) {
      console.log('Changing to page:', newPage);
      this.stateManager.updateState({ currentPage: newPage });
      this.loadDataIfNeeded();
    } else {
      console.log('Cannot change page - out of bounds');
    }
  }

  public navigateToDetail(type: 'character' | 'planet' | 'transformation', id: number): void {
    this.isLoadingDetail = false; // Resetear el control de carga
    this.stateManager.updateState({
      currentView: 'detail',
      currentDetailType: type,
      currentDetailId: id
    });
  }

  public goBack(): void {
    this.stateManager.updateState({
      currentView: 'home',
      currentDetailId: null,
      currentDetailType: null
    });
  }

  private loadDetailPage(): void {
    const state = this.stateManager.currentState;
    const { currentDetailType, currentDetailId } = state;
    
    if (!currentDetailType || !currentDetailId || this.isLoadingDetail) return;

    this.isLoadingDetail = true;
    this.stateManager.updateState({ isLoading: true });

    // Primero intentar encontrar en el estado actual
    let foundItem = null;
    switch (currentDetailType) {
      case 'character':
        foundItem = state.characters.find(item => item.id === currentDetailId);
        break;
      case 'planet':
        foundItem = state.planets.find(item => item.id === currentDetailId);
        break;
      case 'transformation':
        foundItem = state.transformations.find(item => item.id === currentDetailId);
        break;
    }

    if (foundItem) {
      this.renderDetailContent(currentDetailType, foundItem);
      this.stateManager.updateState({ isLoading: false });
      this.isLoadingDetail = false;
      return;
    }

    // Si no se encuentra, cargar desde la API
    let apiCall: Observable<any> | null = null;
    switch (currentDetailType) {
      case 'character':
        apiCall = this.charactersModule.getCharacterById(currentDetailId);
        break;
      case 'planet':
        apiCall = this.planetsModule.getPlanetById(currentDetailId);
        break;
      case 'transformation':
        apiCall = this.transformationsModule.getTransformationById(currentDetailId);
        break;
    }

    if (apiCall) {
      apiCall.subscribe({
        next: (item) => {
          if (item) {
            this.renderDetailContent(currentDetailType, item);
          } else {
            this.uiManager.showError('No se encontró el elemento solicitado');
          }
          this.stateManager.updateState({ isLoading: false });
          this.isLoadingDetail = false;
        },
        error: (error) => {
          console.error(`Error loading ${currentDetailType} detail:`, error);
          this.uiManager.showError(`Error al cargar los detalles de ${currentDetailType}`);
          this.stateManager.updateState({ isLoading: false });
          this.isLoadingDetail = false;
        }
      });
    } else {
      this.isLoadingDetail = false;
    }
  }

  private renderDetailContent(type: string, item: any): void {
    let html = '';
    
    switch (type) {
      case 'character':
        html = this.charactersModule.renderCharacterDetailPage(item);
        break;
      case 'planet':
        html = this.planetsModule.renderPlanetDetailPage(item);
        break;
      case 'transformation':
        html = this.transformationsModule.renderTransformationDetailPage(item);
        break;
    }

    this.uiManager.renderDetailContent(html);
  }

  // Método público para el visor de transformaciones
  public showTransformations(characterName: string, characterId: number): void {
    this.uiManager.showLoading(true);
    this.transformationsModule.showTransformations(characterName, characterId);
    this.uiManager.showLoading(false);
  }
}

// Crear instancia global para acceso desde HTML
declare global {
  interface Window {
    app: DragonBallApp;
  }
}

export const app = new DragonBallApp();
window.app = app;
