import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonCheckbox, IonButton, IonFooter, IonIcon, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline } from 'ionicons/icons';

interface Ingredient {
  name: string;
  baseWeight: number; // in grams
  selected: boolean;
}

@Component({
  selector: 'app-list-cart-food',
  templateUrl: './list-cart-food.page.html',
  styleUrls: ['./list-cart-food.page.scss'],
  standalone: true,
  imports: [IonToolbar, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonSegment, IonSegmentButton, IonLabel, IonList, IonItem, IonCheckbox, IonButton, IonFooter, IonIcon
  ]
})
export class ListCartFoodPage implements OnInit {

  selectedPeriod: string = 'semanal';
  multiplier: number = 7;

  shoppingList: Ingredient[] = [
    { name: 'AGUACATE/GUACAMOLE', baseWeight: 100, selected: false },
    { name: 'ARROZ', baseWeight: 15, selected: false },
    { name: 'CARNE PICADA DE VACUNO', baseWeight: 50, selected: false },
    { name: 'FILETE DE PECHUGA DE POLLO', baseWeight: 175, selected: false },
    { name: 'HUEVOS', baseWeight: 50, selected: false },
    { name: 'LOMO EMBUCHADO', baseWeight: 22.5, selected: false },
    { name: 'MANZANA', baseWeight: 200, selected: false },
    { name: 'NUECES', baseWeight: 22.5, selected: false },
    { name: 'PASTA', baseWeight: 15, selected: false },
    { name: 'PATATA', baseWeight: 75, selected: false },
    { name: 'PLATANO', baseWeight: 100, selected: false },
    { name: 'SALMON', baseWeight: 50, selected: false },
    { name: 'VERDURAS AL GUSTO', baseWeight: 225, selected: false },
    { name: 'YOGUR + PROTEINAS', baseWeight: 100, selected: false },
  ];

  constructor() {
    addIcons({ checkboxOutline, squareOutline });
  }

  ngOnInit() {
  }

  segmentChanged(event: any) {
    this.selectedPeriod = event.detail.value;
    console.log(this.selectedPeriod);

    switch (this.selectedPeriod) {
      case 'semanal':
        this.multiplier = 7;
        break;
      case '2semanas':
        this.multiplier = 14;
        break;
      case 'mensual':
        this.multiplier = 28;
        break;
    }
  }

  updatePeriod(period: string) {
    this.selectedPeriod = period;
    switch (period) {
      case 'semanal': this.multiplier = 7; break;
      case '2semanas': this.multiplier = 14; break;
      case 'mensual': this.multiplier = 28; break;
    }
  }

  toggleSelectAll(select: boolean) {
    this.shoppingList.forEach(item => item.selected = select);
  }

}
