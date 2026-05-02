import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonButton, IonIcon, IonCardContent, IonLabel, IonImg, IonAvatar, IonCheckbox, IonSpinner, IonText } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'src/app/services/ui/toast-service';
import { AuthService } from 'src/app/services/auth/auth-service';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonImg, IonContent, IonItem, IonInput, IonCheckbox,
    IonButton, IonCardContent, IonLabel, CommonModule, FormsModule, LayoutComponent, IonIcon, IonSpinner]
})
export class LoginPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);

  protected readonly isLoggingIn = signal(false);

  private readonly REMEMBER_KEY = 'remember_email';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline });
  }

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    const savedEmail = localStorage.getItem(this.REMEMBER_KEY);
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }

  }

  onLogin() {
    const correo = this.email();
    const clave = this.password();

    if (!correo || !clave) {
      this.toastService.error('Introduce email y contraseña');
      return;
    }

    this.isLoggingIn.set(true);

    this.authService.login(correo, clave).subscribe({
      next: (res) => {
        if (this.rememberMe()) {
          localStorage.setItem(this.REMEMBER_KEY, correo);
        } else {
          localStorage.removeItem(this.REMEMBER_KEY);
        }
        
        this.isLoggingIn.set(false);
        this.toastService.success('¡Bienvenido de nuevo!');
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.isLoggingIn.set(false);
        
        const mensaje = err.error?.message || 'Error de conexión o credenciales inválidas';
        this.toastService.error(mensaje);
      }
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
