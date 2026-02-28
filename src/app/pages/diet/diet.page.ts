import { addIcons } from 'ionicons';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { restaurant, cart, sync, batteryCharging } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-diet',
  templateUrl: './diet.page.html',
  styleUrls: ['./diet.page.scss'],
  standalone: true,
  imports: [IonIcon, IonCardContent, IonCard, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent, RouterLink]
})
export class DietPage implements OnInit {

  options = [
    { title: "Dieta", img: "restaurant", url: "/tabs/diet/my-diet" },
    { title: "Lista de compra", img: "cart", url: "/tabs/diet/shopping-list" },
    { title: "Convalidaciones", img: "sync", url: "/tabs/diet/food-equivalence" },
    { title: "Suplementación", img: "battery-charging", url: "/tabs/diet/supplementation" },
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
