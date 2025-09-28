import { Observable, from, catchError, map, of } from 'rxjs';
import { Character, Planet, Transformation, ApiResponse, ApiError } from './types';

const API_BASE_URL = 'https://dragonball-api.com/api';

class DragonBallApiService {
  private async fetchData<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Obtener todos los personajes
  getCharacters(page: number = 1, limit: number = 10): Observable<ApiResponse<Character>> {
    return from(this.fetchData<ApiResponse<Character>>(`/characters?page=${page}&limit=${limit}`))
      .pipe(
        catchError((error) => {
          console.error('Error getting characters:', error);
          return of({
            items: [],
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: limit,
              totalPages: 0,
              currentPage: page
            },
            links: {
              first: '',
              previous: '',
              next: '',
              last: ''
            }
          } as ApiResponse<Character>);
        })
      );
  }

  // Obtener un personaje por ID
  getCharacterById(id: number): Observable<Character | null> {
    return from(this.fetchData<Character>(`/characters/${id}`))
      .pipe(
        catchError((error) => {
          console.error(`Error getting character ${id}:`, error);
          return of(null);
        })
      );
  }

  // Obtener todos los planetas
  getPlanets(page: number = 1, limit: number = 10): Observable<ApiResponse<Planet>> {
    return from(this.fetchData<ApiResponse<Planet>>(`/planets?page=${page}&limit=${limit}`))
      .pipe(
        catchError((error) => {
          console.error('Error getting planets:', error);
          return of({
            items: [],
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: limit,
              totalPages: 0,
              currentPage: page
            },
            links: {
              first: '',
              previous: '',
              next: '',
              last: ''
            }
          } as ApiResponse<Planet>);
        })
      );
  }

  // Obtener transformaciones
  getTransformations(page: number = 1, limit: number = 10): Observable<ApiResponse<Transformation>> {
    return from(this.fetchData<Transformation[]>(`/transformations`))
      .pipe(
        map((transformations: Transformation[]) => {
          // La API de transformaciones devuelve un array directo, no paginado
          const startIndex = (page - 1) * limit;
          const endIndex = startIndex + limit;
          const paginatedItems = transformations.slice(startIndex, endIndex);
          
          return {
            items: paginatedItems,
            meta: {
              totalItems: transformations.length,
              itemCount: paginatedItems.length,
              itemsPerPage: limit,
              totalPages: Math.ceil(transformations.length / limit),
              currentPage: page
            },
            links: {
              first: '',
              previous: '',
              next: '',
              last: ''
            }
          } as ApiResponse<Transformation>;
        }),
        catchError((error) => {
          console.error('Error getting transformations:', error);
          return of({
            items: [],
            meta: {
              totalItems: 0,
              itemCount: 0,
              itemsPerPage: limit,
              totalPages: 0,
              currentPage: page
            },
            links: {
              first: '',
              previous: '',
              next: '',
              last: ''
            }
          } as ApiResponse<Transformation>);
        })
      );
  }

  // Buscar personajes por nombre
  searchCharacters(name: string): Observable<Character[]> {
    return from(this.fetchData<Character[]>(`/characters?name=${encodeURIComponent(name)}`))
      .pipe(
        map(response => {
          console.log('Raw search response:', response);
          
          // La API de búsqueda devuelve directamente un array, no un objeto ApiResponse
          if (Array.isArray(response)) {
            console.log('Search returned array with', response.length, 'items');
            return response;
          }
          
          // Si por alguna razón devuelve un objeto con items
          if (response && (response as any).items && Array.isArray((response as any).items)) {
            console.log('Search returned object with items array');
            return (response as any).items;
          }
          
          console.warn('Search response has unexpected structure:', response);
          return [];
        }),
        catchError((error) => {
          console.error('Error searching characters:', error);
          return of([]);
        })
      );
  }

  // Obtener transformaciones de un personaje específico
  getCharacterTransformations(characterName: string): Observable<Transformation[]> {
    return from(this.fetchData<Transformation[]>(`/transformations`))
      .pipe(
        map((transformations: Transformation[]) => {
          // Filtrar transformaciones que contengan el nombre del personaje
          const characterTransformations = transformations.filter(transformation => 
            transformation.name.toLowerCase().includes(characterName.toLowerCase())
          );
          
          console.log(`Found ${characterTransformations.length} transformations for ${characterName}:`, characterTransformations);
          return characterTransformations;
        }),
        catchError((error) => {
          console.error(`Error getting transformations for ${characterName}:`, error);
          return of([]);
        })
      );
  }

  // Obtener planeta por ID
  getPlanetById(id: number): Observable<Planet | null> {
    return from(this.fetchData<Planet>(`/planets/${id}`))
      .pipe(
        catchError((error) => {
          console.error(`Error getting planet ${id}:`, error);
          return of(null);
        })
      );
  }

  // Obtener transformación por ID
  getTransformationById(id: number): Observable<Transformation | null> {
    return from(this.fetchData<Transformation>(`/transformations/${id}`))
      .pipe(
        catchError((error) => {
          console.error(`Error getting transformation ${id}:`, error);
          return of(null);
        })
      );
  }
}

export const dragonBallApi = new DragonBallApiService();
