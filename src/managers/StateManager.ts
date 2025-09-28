import { BehaviorSubject } from 'rxjs';
import { Character, Planet, Transformation } from '../types';

// Estado de la aplicación
export interface AppState {
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

export class StateManager {
  private stateSubject$ = new BehaviorSubject<AppState>({
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

  // Cache para evitar peticiones repetidas
  private cacheMap = new Map<string, any>();
  private dataLoadedFlags = {
    characters: false,
    planets: false,
    transformations: false,
    stats: false
  };

  // Getters
  get state$() {
    return this.stateSubject$.asObservable();
  }

  get currentState(): AppState {
    return this.stateSubject$.value;
  }

  get cache() {
    return this.cacheMap;
  }

  get dataLoaded() {
    return this.dataLoadedFlags;
  }

  // Métodos para actualizar el estado
  updateState(partialState: Partial<AppState>): void {
    const currentState = this.stateSubject$.value;
    this.stateSubject$.next({ ...currentState, ...partialState });
  }

  // Métodos específicos para el cache
  getCacheKey(tab: string, page: number, searchTerm: string = ''): string {
    return `${tab}-${page}-${searchTerm}`;
  }

  getCachedData(key: string): any {
    return this.cacheMap.get(key);
  }

  setCachedData(key: string, data: any): void {
    this.cacheMap.set(key, data);
  }

  hasCachedData(key: string): boolean {
    return this.cacheMap.has(key);
  }

  // Métodos para dataLoaded
  setDataLoaded(key: keyof typeof this.dataLoadedFlags, value: boolean): void {
    this.dataLoadedFlags[key] = value;
  }

  isDataLoaded(key: keyof typeof this.dataLoadedFlags): boolean {
    return this.dataLoadedFlags[key];
  }
}
