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
  imports: [IonSpinner, IonText, IonAvatar, IonImg, IonContent, IonItem, IonInput, IonCheckbox,
    IonButton, IonCardContent, IonLabel, CommonModule, FormsModule, LayoutComponent, IonIcon]
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

  // Estado del servidor (cold start de Render)
  protected readonly serverReady = signal(false);
  protected readonly checkingServer = signal(true);
  protected readonly serverMessage = signal('Conectando con el servidor...');
  protected readonly isLoggingIn = signal(false);

  private readonly REMEMBER_KEY = 'remember_email';

  constructor() {
    addIcons({ mailOutline, lockClosedOutline });
  }

  ngOnInit() {
    // Si ya hay token válido, redirige a home
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/tabs/home']);
      return;
    }

    // Si viene del guard con servidor caído
    const serverDown = this.route.snapshot.queryParamMap.get('serverDown');
    if (serverDown === 'true') {
      this.serverMessage.set('El servidor se está despertando...');
    }

    // Cargar email recordado
    const savedEmail = localStorage.getItem(this.REMEMBER_KEY);
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }

    // Ping silencioso al servidor
    this.pingServer();
  }

  // Hace ping al servidor para verificar si está preparado
  private pingServer() {
    this.checkingServer.set(true);
    this.authService.pingServer().subscribe({
      next: (isAlive) => {
        this.serverReady.set(isAlive);
        this.checkingServer.set(false);
        if (!isAlive) {
          this.serverMessage.set('No se pudo conectar. Reintentando...');
          // Reintentar automáticamente cada 3 segundos
          setTimeout(() => this.pingServer(), 3000);
        }
      }
    });
  }

  // Envía las credenciales al backend y guarda el token
  onLogin() {
    const correo = this.email();
    const clave = this.password();

    if (!correo || !clave) {
      this.toastService.error('Introduce email y contraseña');
      return;
    }

    this.isLoggingIn.set(true);
    this.authService.login(correo, clave).subscribe({
      next: () => {
        // Guardar o borrar email según el checkbox
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
        const mensaje = err.error?.message || 'Credenciales inválidas';
        this.toastService.error(mensaje);
      }
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
