import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { NotificationsComponent } from './shared/components/notifications/notifications.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, NotificationsComponent],
  template: `
    <div class="wrapper">
      <app-sidebar></app-sidebar>
      <div class="main-panel">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>
      <app-notifications></app-notifications>
    </div>
  `,
  styles: [`
    .wrapper {
      display: flex;
      flex-direction: row;
      min-height: 100vh;
    }

    .main-panel {
      flex: 1;
      margin-left: 280px;
      background: #f8f9fa;
      min-height: 100vh;
      transition: margin-left 0.3s ease;
    }

    .content {
      padding: 0;
    }

    @media (max-width: 991px) {
      .main-panel {
        margin-left: 0;
      }
    }
  `]
})
export class AppComponent {
  title = 'Sistema de Gestión de Biblioteca';
}




