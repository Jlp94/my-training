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
  chevronBackOutline, notificationsOutline
} from 'ionicons/icons';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonAvatar, IonGrid, IonRow, IonCol,
    IonCard, IonCardContent, IonIcon, CommonModule, FormsModule,
    HeaderComponent
  ]
})
export class UserPage implements OnInit {
  private readonly router: Router = inject(Router);


  userName = signal('MADELYN');

  constructor() {
    addIcons({
      barbell,
      restaurant,
      analyticsOutline,
      logOutOutline,
      chevronBackOutline,
      notificationsOutline
    });
  }

  ngOnInit() {
  }

  logout() {
    console.log('Cerrar sesión');
    this.router.navigate(['/login']);
  }

}
