import { addIcons } from 'ionicons';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonItem, IonInput, IonButton, IonIcon, IonCard, IonCardContent, IonLabel, IonThumbnail } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast-service';
import { barbell } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonItem, IonInput,
    IonButton, IonCard, IonCardContent, IonLabel, CommonModule, FormsModule,
    IonThumbnail, IonIcon, LayoutComponent]
})
export class LoginPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);
  private readonly router: Router = inject(Router);

  email = signal('');
  password = signal('');
  showPassword = signal(false);

  constructor() {
    addIcons({ barbell });
  }

  ngOnInit() { }

  async onLogin() {
    if (this.email() === 'test@test.com' && this.password() === '123456') {
      this.toastService.success('¡Bienvenido de nuevo!');
      this.router.navigate(['/tabs/home']);
    } else {
      this.toastService.error('Credenciales inválidas. Prueba con test@test.com / 123456');
    }
  }

  togglePassword() {
    this.showPassword.set(!this.showPassword());
  }
}
