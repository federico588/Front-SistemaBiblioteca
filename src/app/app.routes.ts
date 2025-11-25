import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuarios',
    loadComponent: () => import('./features/usuario/usuario-list/usuario-list.component').then(m => m.UsuarioListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'autores',
    loadComponent: () => import('./features/autor/autor-list/autor-list.component').then(m => m.AutorListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'editoriales',
    loadComponent: () => import('./features/editorial/editorial-list/editorial-list.component').then(m => m.EditorialListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'categorias',
    loadComponent: () => import('./features/categoria/categoria-list/categoria-list.component').then(m => m.CategoriaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'libros',
    loadComponent: () => import('./features/libro/libro-list/libro-list.component').then(m => m.LibroListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'revistas',
    loadComponent: () => import('./features/revista/revista-list/revista-list.component').then(m => m.RevistaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'periodicos',
    loadComponent: () => import('./features/periodico/periodico-list/periodico-list.component').then(m => m.PeriodicoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'items',
    loadComponent: () => import('./features/item/item-list/item-list.component').then(m => m.ItemListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'prestamos',
    loadComponent: () => import('./features/prestamo/prestamo-list/prestamo-list.component').then(m => m.PrestamoListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'multas',
    loadComponent: () => import('./features/multa/multa-list/multa-list.component').then(m => m.MultaListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.authRoutes)
  },
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];




