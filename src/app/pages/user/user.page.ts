import { Component, inject, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
export class UserPage {
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  private readonly userService = inject(UserService);

  private readonly userResource = rxResource({
    stream: () => this.userService.getUser()
  });

  protected readonly userName = computed(() => {
    const user = this.userResource.value();
    if (!user) return 'Cargando...';
    const name = user.profile?.name || '';
    const lastName = user.profile?.lastName || '';
    return `${name} ${lastName}`.trim() || 'Usuario';
  });

  protected readonly userInitials = computed(() => {
    const user = this.userResource.value();
    if (!user) return '...';
    const name = user.profile?.name || '';
    const lastName = user.profile?.lastName || '';
    const initials = (name.charAt(0) + lastName.charAt(0)).toUpperCase();
    return initials || 'U';
  });

  protected readonly avatarUrl = computed(() => this.userResource.value()?.profile?.avatarUrl ?? null);
  protected readonly notifications = computed(() => this.userResource.value()?.profile?.notifications ?? true);

  constructor() {
    addIcons({ restaurant, cog, logOutOutline, barbell, analyticsOutline, chevronBackOutline, notificationsOutline });
  }

  ionViewWillEnter() {
    this.userResource.reload();
  }

  logout() {
   this.authService.logout();
   this.router.navigate(['/login']);
  }
}
