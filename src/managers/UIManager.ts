export class UIManager {
  // Elementos del DOM
  private elements = {
    homeView: null as HTMLElement | null,
    detailView: null as HTMLElement | null,
    contentGrid: null as HTMLElement | null,
    loadingSpinner: null as HTMLElement | null,
    errorMessage: null as HTMLElement | null,
    searchInput: null as HTMLInputElement | null,
    mobileMenu: null as HTMLElement | null,
    mobileMenuBtn: null as HTMLButtonElement | null,
    // Tabs desktop
    charactersTab: null as HTMLButtonElement | null,
    planetsTab: null as HTMLButtonElement | null,
    transformationsTab: null as HTMLButtonElement | null,
    // Tabs móvil
    charactersTabMobile: null as HTMLButtonElement | null,
    planetsTabMobile: null as HTMLButtonElement | null,
    transformationsTabMobile: null as HTMLButtonElement | null,
    // Paginación
    prevBtn: null as HTMLButtonElement | null,
    nextBtn: null as HTMLButtonElement | null,
    // Botones de error y navegación
    closeErrorBtn: null as HTMLButtonElement | null,
    backBtn: null as HTMLButtonElement | null,
    // Modal transformaciones
    closeTransformationModalBtn: null as HTMLButtonElement | null,
    prevTransformationBtn: null as HTMLButtonElement | null,
    nextTransformationBtn: null as HTMLButtonElement | null,
    playTransformationBtn: null as HTMLButtonElement | null,
    // Elementos adicionales
    errorText: null as HTMLElement | null,
    pageInfo: null as HTMLElement | null,
    totalCharacters: null as HTMLElement | null,
    totalPlanets: null as HTMLElement | null,
    totalTransformations: null as HTMLElement | null,
    detailContent: null as HTMLElement | null,
  };

  private isToggling = false;
  private mobileMenuOpen = false;

  constructor() {
    this.initializeElements();
  }

  private initializeElements(): void {
    // Elementos básicos
    this.elements.homeView = document.getElementById('home-view');
    this.elements.detailView = document.getElementById('detail-view');
    this.elements.contentGrid = document.getElementById('content-grid');
    this.elements.loadingSpinner = document.getElementById('loading');
    this.elements.errorMessage = document.getElementById('error-message');
    this.elements.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.elements.mobileMenu = document.getElementById('mobile-menu');
    this.elements.mobileMenuBtn = document.getElementById('mobile-menu-btn') as HTMLButtonElement;
    
    // Tabs desktop
    this.elements.charactersTab = document.getElementById('characters-tab') as HTMLButtonElement;
    this.elements.planetsTab = document.getElementById('planets-tab') as HTMLButtonElement;
    this.elements.transformationsTab = document.getElementById('transformations-tab') as HTMLButtonElement;
    
    // Tabs móvil
    this.elements.charactersTabMobile = document.getElementById('characters-tab-mobile') as HTMLButtonElement;
    this.elements.planetsTabMobile = document.getElementById('planets-tab-mobile') as HTMLButtonElement;
    this.elements.transformationsTabMobile = document.getElementById('transformations-tab-mobile') as HTMLButtonElement;
    
    // Paginación
    this.elements.prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    this.elements.nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    
    // Botones de error y navegación
    this.elements.closeErrorBtn = document.getElementById('close-error') as HTMLButtonElement;
    this.elements.backBtn = document.getElementById('back-btn') as HTMLButtonElement;
    
    // Modal transformaciones
    this.elements.closeTransformationModalBtn = document.getElementById('close-transformation-modal') as HTMLButtonElement;
    this.elements.prevTransformationBtn = document.getElementById('prev-transformation') as HTMLButtonElement;
    this.elements.nextTransformationBtn = document.getElementById('next-transformation') as HTMLButtonElement;
    this.elements.playTransformationBtn = document.getElementById('play-transformation') as HTMLButtonElement;
    
    // Elementos adicionales
    this.elements.errorText = document.getElementById('error-text');
    this.elements.pageInfo = document.getElementById('page-info');
    this.elements.totalCharacters = document.getElementById('total-characters');
    this.elements.totalPlanets = document.getElementById('total-planets');
    this.elements.totalTransformations = document.getElementById('total-transformations');
    this.elements.detailContent = document.getElementById('detail-content');
    
    console.log('UIManager elements initialized:');
    console.log('- Mobile menu:', !!this.elements.mobileMenu);
    console.log('- Mobile menu button:', !!this.elements.mobileMenuBtn);
  }

  // Getters para elementos
  get homeView(): HTMLElement | null { return this.elements.homeView; }
  get detailView(): HTMLElement | null { return this.elements.detailView; }
  get contentGrid(): HTMLElement | null { return this.elements.contentGrid; }
  get loadingSpinner(): HTMLElement | null { return this.elements.loadingSpinner; }
  get errorMessage(): HTMLElement | null { return this.elements.errorMessage; }
  get searchInput(): HTMLInputElement | null { return this.elements.searchInput; }
  get mobileMenu(): HTMLElement | null { return this.elements.mobileMenu; }
  get mobileMenuBtn(): HTMLButtonElement | null { return this.elements.mobileMenuBtn; }
  
  // Getters para tabs desktop
  get charactersTab(): HTMLButtonElement | null { return this.elements.charactersTab; }
  get planetsTab(): HTMLButtonElement | null { return this.elements.planetsTab; }
  get transformationsTab(): HTMLButtonElement | null { return this.elements.transformationsTab; }
  
  // Getters para tabs móvil
  get charactersTabMobile(): HTMLButtonElement | null { return this.elements.charactersTabMobile; }
  get planetsTabMobile(): HTMLButtonElement | null { return this.elements.planetsTabMobile; }
  get transformationsTabMobile(): HTMLButtonElement | null { return this.elements.transformationsTabMobile; }
  
  // Getters para paginación
  get prevBtn(): HTMLButtonElement | null { return this.elements.prevBtn; }
  get nextBtn(): HTMLButtonElement | null { return this.elements.nextBtn; }
  
  // Getters para botones de error y navegación
  get closeErrorBtn(): HTMLButtonElement | null { return this.elements.closeErrorBtn; }
  get backBtn(): HTMLButtonElement | null { return this.elements.backBtn; }
  
  // Getters para modal transformaciones
  get closeTransformationModalBtn(): HTMLButtonElement | null { return this.elements.closeTransformationModalBtn; }
  get prevTransformationBtn(): HTMLButtonElement | null { return this.elements.prevTransformationBtn; }
  get nextTransformationBtn(): HTMLButtonElement | null { return this.elements.nextTransformationBtn; }
  get playTransformationBtn(): HTMLButtonElement | null { return this.elements.playTransformationBtn; }
  
  // Getters para elementos adicionales
  get errorText(): HTMLElement | null { return this.elements.errorText; }
  get pageInfo(): HTMLElement | null { return this.elements.pageInfo; }
  get totalCharacters(): HTMLElement | null { return this.elements.totalCharacters; }
  get totalPlanets(): HTMLElement | null { return this.elements.totalPlanets; }
  get totalTransformations(): HTMLElement | null { return this.elements.totalTransformations; }
  get detailContent(): HTMLElement | null { return this.elements.detailContent; }

  // Métodos para mostrar/ocultar elementos
  showLoading(show: boolean): void {
    if (this.elements.loadingSpinner) {
      if (show) {
        this.elements.loadingSpinner.classList.remove('hidden');
      } else {
        this.elements.loadingSpinner.classList.add('hidden');
      }
    }
  }

  showError(message: string): void {
    if (this.elements.errorText && this.elements.errorMessage) {
      this.elements.errorText.textContent = message;
      this.elements.errorMessage.classList.remove('hidden');
      
      // Auto-hide después de 5 segundos
      setTimeout(() => {
        this.hideError();
      }, 5000);
    }
  }

  hideError(): void {
    if (this.elements.errorMessage) {
      this.elements.errorMessage.classList.add('hidden');
    }
  }

  // Métodos para navegación
  showHomeView(): void {
    this.elements.homeView?.classList.remove('hidden');
    this.elements.detailView?.classList.add('hidden');
  }

  showDetailView(): void {
    this.elements.homeView?.classList.add('hidden');
    this.elements.detailView?.classList.remove('hidden');
  }

  // Métodos para tabs
  updateActiveTab(activeTab: string): void {
    // Desktop tabs
    const desktopTabs = [
      { element: this.elements.charactersTab, name: 'characters' },
      { element: this.elements.planetsTab, name: 'planets' },
      { element: this.elements.transformationsTab, name: 'transformations' }
    ];
    
    desktopTabs.forEach(({ element, name }) => {
      if (element) {
        if (name === activeTab) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      }
    });

    // Mobile tabs
    const mobileTabs = [
      { element: this.elements.charactersTabMobile, name: 'characters' },
      { element: this.elements.planetsTabMobile, name: 'planets' },
      { element: this.elements.transformationsTabMobile, name: 'transformations' }
    ];
    
    mobileTabs.forEach(({ element, name }) => {
      if (element) {
        if (name === activeTab) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      }
    });
  }

  // Métodos para menú móvil
  toggleMobileMenu(): void {
    if (this.isToggling) {
      console.log('Toggle already in progress, ignoring');
      return;
    }

    this.isToggling = true;
    console.log('Toggle mobile menu called, current state:', this.mobileMenuOpen);
    
    const menu = this.elements.mobileMenu;
    const icon = this.elements.mobileMenuBtn?.querySelector('i');
    
    if (!this.mobileMenuOpen) {
      console.log('Opening mobile menu');
      this.mobileMenuOpen = true;
      menu?.classList.remove('mobile-menu-hidden');
      menu?.classList.add('mobile-menu-visible');
      icon?.classList.remove('fa-bars');
      icon?.classList.add('fa-times');
    } else {
      console.log('Closing mobile menu');
      this.mobileMenuOpen = false;
      menu?.classList.remove('mobile-menu-visible');
      menu?.classList.add('mobile-menu-hidden');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    }

    setTimeout(() => {
      this.isToggling = false;
    }, 100);
  }

  closeMobileMenu(): void {
    const icon = this.elements.mobileMenuBtn?.querySelector('i');
    
    this.mobileMenuOpen = false;
    this.elements.mobileMenu?.classList.remove('mobile-menu-visible');
    this.elements.mobileMenu?.classList.add('mobile-menu-hidden');
    icon?.classList.remove('fa-times');
    icon?.classList.add('fa-bars');
  }

  // Métodos para paginación
  updatePagination(currentPage: number, totalPages: number): void {
    console.log('updatePagination called with:', { currentPage, totalPages });
    
    console.log('Pagination buttons found:', { 
      prevBtn: !!this.elements.prevBtn, 
      nextBtn: !!this.elements.nextBtn, 
      pageInfo: !!this.elements.pageInfo 
    });

    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = currentPage === 1;
      console.log('Previous button disabled:', this.elements.prevBtn.disabled);
    }
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = currentPage === totalPages;
      console.log('Next button disabled:', this.elements.nextBtn.disabled);
    }
    if (this.elements.pageInfo) {
      this.elements.pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
    }
  }

  // Métodos para estadísticas
  updateStats(totalCharacters: number, totalPlanets: number, totalTransformations: number): void {
    if (this.elements.totalCharacters) {
      this.elements.totalCharacters.textContent = totalCharacters.toString();
    }
    if (this.elements.totalPlanets) {
      this.elements.totalPlanets.textContent = totalPlanets.toString();
    }
    if (this.elements.totalTransformations) {
      this.elements.totalTransformations.textContent = totalTransformations.toString();
    }
  }

  // Método para renderizar contenido en el grid
  renderContent(html: string): void {
    if (this.elements.contentGrid) {
      this.elements.contentGrid.innerHTML = html;
    }
  }

  // Método para renderizar contenido de detalle
  renderDetailContent(html: string): void {
    if (this.elements.detailContent) {
      this.elements.detailContent.innerHTML = html;
    }
  }
}
