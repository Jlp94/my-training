import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonAvatar, IonGrid, IonRow, IonCol,
  IonCard, IonCardContent, IonIcon, IonText
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import {
  barbell, restaurant, analyticsOutline, logOutOutline,
  chevronBackOutline, notificationsOutline, cog
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { AuthService } from 'src/app/services/auth/auth-service';
import { UserService } from 'src/app/services/user/user-service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonAvatar, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonIcon, IonText, CommonModule, FormsModule,
    HeaderComponent,
    LayoutComponent,
    RouterLink
  ]
})
export class UserPage implements OnInit {
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  private readonly userService = inject(UserService);

  // Datos del perfil
  userName = signal('Cargando...');
  userInitials = signal('...');
  avatarUrl = signal<string | null>(null);
  notifications = signal(true);

  constructor() {
    addIcons({ restaurant, cog, logOutOutline, barbell, analyticsOutline, chevronBackOutline, notificationsOutline });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  loadUserData() {
    this.userService.getUser().subscribe({
      next: (user) => {
        const name = user.profile?.name || '';
        const lastName = user.profile?.lastName || '';
        this.userName.set(`${name} ${lastName}`.trim() || 'Usuario');
        const initials = (name.charAt(0) + lastName.charAt(0)).toUpperCase();
        this.userInitials.set(initials || 'U');
        if (user.profile?.avatarUrl) {
          this.avatarUrl.set(user.profile.avatarUrl);
        }
        this.notifications.set(user.profile?.notifications ?? true);
      }
    });
  }

  logout() {
   this.authService.logout();
   this.router.navigate(['/login']);
  }

}
