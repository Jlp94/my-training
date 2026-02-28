import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonAvatar, IonGrid, IonRow, IonCol,
  IonCard, IonCardContent, IonIcon
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import {
  barbell, restaurant, analyticsOutline, logOutOutline,
  chevronBackOutline, notificationsOutline, cog
} from 'ionicons/icons';
import { Router, RouterLink } from '@angular/router';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonAvatar, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonIcon, CommonModule, FormsModule,
    HeaderComponent,
    LayoutComponent,
    RouterLink
  ]
})
export class UserPage implements OnInit {
  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  


  userName = signal('USER');

  constructor() {
    addIcons({ restaurant, cog, logOutOutline, barbell, analyticsOutline, chevronBackOutline, notificationsOutline });
  }

  ngOnInit() {
  }

  logout() {
   this.authService.logout();
   this.router.navigate(['/login']);
  }

}
