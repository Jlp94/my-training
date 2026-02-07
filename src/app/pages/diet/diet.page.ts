import { addIcons } from 'ionicons';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { restaurant, cart, sync, batteryCharging } from 'ionicons/icons';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.page.html',
  styleUrls: ['./diet.page.scss'],
  standalone: true,
  imports: [IonIcon, IonCardContent, IonCard, IonContent, CommonModule, FormsModule, HeaderComponent]
})
export class DietPage implements OnInit {

  options = [
    { title: "Dieta", img: "restaurant" },
    { title: "Lista de compra", img: "cart" },
    { title: "Convalidaciones", img: "sync" },
    { title: "Suplementación", img: "battery-charging" },
  ];

  constructor() {
    addIcons({
      restaurant,
      cart,
      sync,
      batteryCharging,
    })
  }

  ngOnInit() {
  }

}
