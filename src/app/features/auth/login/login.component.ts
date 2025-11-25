import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginRequest } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginData: LoginRequest = {
    email: '',
    password: ''
  };
  
  loading = false;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.loading) return;

    this.loading = true;
    
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.data) {
          this.authService.setUserData(response.data);
          this.notificationService.showSuccess('Inicio de sesión exitoso');
          this.router.navigate(['/dashboard']);
        } else {
          this.notificationService.showError('Error: No se recibieron datos del servidor');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error en login:', error);
        // Extraer mensaje de error correctamente
        let errorMessage = 'Error al iniciar sesión. Verifica tus credenciales.';
        
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.error?.detail) {
          errorMessage = error.error.detail;
        } else if (error?.error?.message) {
          errorMessage = error.error.message;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        this.notificationService.showError(errorMessage);
        this.loading = false;
      }
    });
  }
}




