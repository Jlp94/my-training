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


  userName = signal('USER');

  constructor() {
    addIcons({ restaurant, cog, logOutOutline, barbell, analyticsOutline, chevronBackOutline, notificationsOutline });
  }

  ngOnInit() {
  }

  logout() {
    console.log('Cerrar sesión');
    this.router.navigate(['/login']);
  }

}
