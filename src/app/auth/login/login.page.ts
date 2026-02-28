import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonButton, IonIcon, IonCardContent, IonLabel, IonImg, IonAvatar, IonCheckbox } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast-service';
import { AuthService } from 'src/app/services/auth-service';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonImg, IonContent, IonItem, IonInput, IonCheckbox,
    IonButton, IonCardContent, IonLabel, CommonModule, FormsModule, LayoutComponent, IonIcon]
})
export class LoginPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);

  private readonly REMEMBER_KEY = 'remember_email';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline });
  }

  // Si ya hay token, redirige a home. Si hay email guardado, lo carga
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

  // Envía las credenciales al backend y guarda el token
  async onLogin() {
    const correo = this.email();
    const clave = this.password();

    if (!correo || !clave) {
      this.toastService.error('Introduce email y contraseña');
      return;
    }

    this.authService.login(correo, clave).subscribe({
      next: () => {
        // Guardar o borrar email según el checkbox
        if (this.rememberMe()) {
          localStorage.setItem(this.REMEMBER_KEY, correo);
        } else {
          localStorage.removeItem(this.REMEMBER_KEY);
        }
        this.toastService.success('¡Bienvenido de nuevo!');
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        console.log(err);
        const mensaje = err.error?.message || 'Credenciales inválidas';
        this.toastService.error(mensaje);
      }
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
