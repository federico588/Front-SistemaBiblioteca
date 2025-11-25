import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

declare interface RouteInfo {
  path: string;
  title: string;
  icon: string;
  class: string;
  roles?: string[];
}

export const ROUTES: RouteInfo[] = [
  { path: '/dashboard', title: 'Dashboard', icon: 'design_app', class: '' },
  { path: '/usuarios', title: 'Usuarios', icon: 'users_single-02', class: '', roles: ['admin'] },
  { path: '/autores', title: 'Autores', icon: 'users_single-02', class: '' },
  { path: '/editoriales', title: 'Editoriales', icon: 'business_bank', class: '' },
  { path: '/categorias', title: 'Categorías', icon: 'ui-1_calendar-60', class: '' },
  { path: '/libros', title: 'Libros', icon: 'files_paper', class: '' },
  { path: '/revistas', title: 'Revistas', icon: 'files_paper', class: '' },
  { path: '/periodicos', title: 'Periódicos', icon: 'files_paper', class: '' },
  { path: '/items', title: 'Items', icon: 'files_paper', class: '' },
  { path: '/prestamos', title: 'Préstamos', icon: 'business_money-coins', class: '' },
  { path: '/multas', title: 'Multas', icon: 'business_money-coins', class: '', roles: ['admin'] }
];

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  isSidebarOpen = true;
  isUserMenuOpen = false;

  constructor(
    public authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => this.canAccessMenuItem(menuItem));
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 991 && this.isSidebarOpen) {
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-info-dropdown')) {
      this.isUserMenuOpen = false;
    }
    // Solo cerrar sidebar en móvil si se hace click fuera
    if (this.isMobile() && !target.closest('.left-sidebar') && this.isSidebarOpen) {
      this.closeSidebar();
    }
  }

  onMenuItemClick() {
    // Solo cerrar sidebar en móviles cuando se hace click en un item del menú
    if (this.isMobile()) {
      this.closeSidebar();
    }
  }

  isMobile(): boolean {
    return window.innerWidth <= 991;
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (this.isSidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  toggleUserMenu() {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  closeSidebar() {
    this.isSidebarOpen = false;
    document.body.classList.remove('sidebar-open');
  }

  canAccessMenuItem(menuItem: RouteInfo): boolean {
    const userRole = this.authService.getUserRole();
    
    if (!userRole) return false;

    if (userRole === 'admin') return true;

    if (!menuItem.roles || menuItem.roles.length === 0) {
      if (userRole === 'consumidor') {
        const allowedRoutes = ['/dashboard', '/prestamos', '/multas', '/items'];
        return allowedRoutes.includes(menuItem.path);
      }
      return true;
    }

    return menuItem.roles.includes(userRole);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
    this.closeSidebar();
  }
}

