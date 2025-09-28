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
  };

  constructor() {
    this.initializeElements();
  }

  private initializeElements(): void {
    this.elements.homeView = document.getElementById('home-view');
    this.elements.detailView = document.getElementById('detail-view');
    this.elements.contentGrid = document.getElementById('content-grid');
    this.elements.loadingSpinner = document.getElementById('loading-spinner');
    this.elements.errorMessage = document.getElementById('error-message');
    this.elements.searchInput = document.getElementById('search-input') as HTMLInputElement;
    this.elements.mobileMenu = document.getElementById('mobile-menu');
    this.elements.mobileMenuBtn = document.getElementById('mobile-menu-btn') as HTMLButtonElement;
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
    const errorText = document.getElementById('error-text');
    if (errorText && this.elements.errorMessage) {
      errorText.textContent = message;
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
    const desktopTabs = ['characters-tab', 'planets-tab', 'transformations-tab'];
    desktopTabs.forEach(tabId => {
      const tab = document.getElementById(tabId);
      if (tab) {
        if (tabId.includes(activeTab)) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      }
    });

    // Mobile tabs
    const mobileTabs = ['characters-tab-mobile', 'planets-tab-mobile', 'transformations-tab-mobile'];
    mobileTabs.forEach(tabId => {
      const tab = document.getElementById(tabId);
      if (tab) {
        if (tabId.includes(activeTab)) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      }
    });
  }

  // Métodos para menú móvil
  toggleMobileMenu(): void {
    const icon = this.elements.mobileMenuBtn?.querySelector('i');
    
    if (this.elements.mobileMenu?.classList.contains('hidden')) {
      this.elements.mobileMenu.classList.remove('hidden');
      icon?.classList.remove('fa-bars');
      icon?.classList.add('fa-times');
    } else {
      this.elements.mobileMenu?.classList.add('hidden');
      icon?.classList.remove('fa-times');
      icon?.classList.add('fa-bars');
    }
  }

  closeMobileMenu(): void {
    const icon = this.elements.mobileMenuBtn?.querySelector('i');
    
    this.elements.mobileMenu?.classList.add('hidden');
    icon?.classList.remove('fa-times');
    icon?.classList.add('fa-bars');
  }

  // Métodos para paginación
  updatePagination(currentPage: number, totalPages: number): void {
    console.log('updatePagination called with:', { currentPage, totalPages });
    
    const prevBtn = document.getElementById('prev-page') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-page') as HTMLButtonElement;
    const pageInfo = document.getElementById('page-info');

    console.log('Pagination buttons found:', { prevBtn: !!prevBtn, nextBtn: !!nextBtn, pageInfo: !!pageInfo });

    if (prevBtn) {
      prevBtn.disabled = currentPage === 1;
      console.log('Previous button disabled:', prevBtn.disabled);
    }
    if (nextBtn) {
      nextBtn.disabled = currentPage === totalPages;
      console.log('Next button disabled:', nextBtn.disabled);
    }
    if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  }

  // Métodos para estadísticas
  updateStats(totalCharacters: number, totalPlanets: number, totalTransformations: number): void {
    const charactersCount = document.getElementById('total-characters');
    const planetsCount = document.getElementById('total-planets');
    const transformationsCount = document.getElementById('total-transformations');

    if (charactersCount) charactersCount.textContent = totalCharacters.toString();
    if (planetsCount) planetsCount.textContent = totalPlanets.toString();
    if (transformationsCount) transformationsCount.textContent = totalTransformations.toString();
  }

  // Método para renderizar contenido en el grid
  renderContent(html: string): void {
    if (this.elements.contentGrid) {
      this.elements.contentGrid.innerHTML = html;
    }
  }

  // Método para renderizar contenido de detalle
  renderDetailContent(html: string): void {
    const detailContent = document.getElementById('detail-content');
    if (detailContent) {
      detailContent.innerHTML = html;
    }
  }
}
