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

  // Estado del servidor (cold start de Render)
  protected readonly serverReady = signal(false);
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

    // Cargar email recordado
    const savedEmail = localStorage.getItem(this.REMEMBER_KEY);
    if (savedEmail) {
      this.email.set(savedEmail);
      this.rememberMe.set(true);
    }

    // Ping silencioso al servidor
    this.pingServer();
  }

  // Hace ping al servidor silenciosamente
  private pingServer() {
    this.authService.pingServer().subscribe({
      next: (isAlive) => {
        this.serverReady.set(isAlive);
        if (!isAlive) {
          // Reintentar silenciosamente cada 5 segundos
          setTimeout(() => this.pingServer(), 5000);
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

    // Programamos un aviso diferido de 2.5s: Solo si la petición tarda (Cold Start)
    // Mostramos el aviso solo si en ese momento seguimos intentando loguear.
    const coldStartTimer = setTimeout(() => {
      if (this.isLoggingIn() && !this.serverReady()) {
        this.toastService.warning('Conectando... El servidor se está despertando (Cold Start).', 5000);
      }
    }, 2500);

    this.authService.login(correo, clave).subscribe({
      next: (res) => {
        clearTimeout(coldStartTimer);
        
        // Guardar o borrar email según el checkbox
        if (this.rememberMe()) {
          localStorage.setItem(this.REMEMBER_KEY, correo);
        } else {
          localStorage.removeItem(this.REMEMBER_KEY);
        }
        
        this.isLoggingIn.set(false);
        this.authService.setServerUp(true); // Informamos al servicio de que el servidor está OK
        this.serverReady.set(true); 
        this.toastService.success('¡Bienvenido de nuevo!');
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        clearTimeout(coldStartTimer);
        this.isLoggingIn.set(false);
        
        // El error solo salta si hay una respuesta de error real o timeout
        const mensaje = err.error?.message || 'Error de conexión o credenciales inválidas';
        this.toastService.error(mensaje);
      }
    });
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
