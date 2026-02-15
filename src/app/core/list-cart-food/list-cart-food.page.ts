import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonToolbar, IonSegment, IonSegmentButton } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { addIcons } from 'ionicons';
import { checkboxOutline, squareOutline, cartOutline } from 'ionicons/icons';
import { Meal, ShoppingItem } from 'src/app/common/dietInterface';


@Component({
  selector: 'app-list-cart-food',
  templateUrl: './list-cart-food.page.html',
  styleUrls: ['./list-cart-food.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonList, IonItem, IonLabel, IonCheckbox, IonButton, IonFooter, IonIcon, IonToolbar,
    IonSegment, IonSegmentButton
  ]
})
export class ListCartFoodPage implements OnInit {

  selectedPeriod: string = 'semanal';
  multiplier: number = 7;
  private readonly STORAGE_KEY = 'shopping_list_checked_items';

  shoppingList: ShoppingItem[] = [];

  // TODO: Esto vendrá del servicio cuando conectemos la API
  // Por ahora hacemos un mock con la estructura Meal
  private meals: ShoppingItem[] = [
    {
      name: 'YOGUR + PROTEINAS',
      selected: false,
      quantity: 200,
    },
    {
      name: 'MANZANA',
      selected: false,
      quantity: 200,
    },
    {
      name: 'NUECES',
      selected: false,
      quantity: 25,
    },
    {
      name: 'VERDURAS AL GUSTO',
      selected: false,
      quantity: 100,
    },
    {
      name: 'PLATANO',
      selected: false,
      quantity: 100,
    },
    {
      name: 'HUEVOS',
      selected: false,
      quantity: 50,
    },
    {
      name: 'ARROZ',
      selected: false,
      quantity: 30,
    },
    {
      name: 'FILETE DE PECHUGA DE POLLO',
      selected: false,
      quantity: 150,
    },
    {
      name: 'SALMON',
      selected: false,
      quantity: 100,
    },
    {
      name: 'AGUACATE/GUACAMOLE',
      selected: false,
      quantity: 100,
    },
    {
      name: 'PATATA',
      selected: false,
      quantity: 150,
    },
    {
      name: 'Cena',
      selected: false,
      quantity: 100,
    },
    {
      name: 'VERDURAS AL GUSTO',
      selected: false,
      quantity: 100,
    }
  ];

  constructor() {
    addIcons({ checkboxOutline, squareOutline, cartOutline });
  }

  ngOnInit() {
    this.buildShoppingList();
  }

  /**
   * Construye la lista de la compra a partir de las comidas (Meal[]).
   * Agrupa por nombre de alimento y suma las cantidades.
   * TODO: Mover a un servicio cuando se conecte la API.
   */
  buildShoppingList() {
    const list = new Map<string, number>();

    this.meals
      .forEach(mealFood => {
        const name = mealFood.name;
        const quantity = mealFood.quantity;
        list.set(name, (list.get(name) || 0) + quantity);
      });

    this.shoppingList = Array.from(list.entries())
      .map(([name, quantity]) => ({
        name,
        quantity,
        selected: this.isItemChecked(name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Verifica si un ítem estaba marcado previamente en localStorage
   */
  private isItemChecked(name: string): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return false;
    const checkedNames: string[] = JSON.parse(saved);
    return checkedNames.includes(name);
  }

  /**
   * Guarda el estado actual de los checks en localStorage
   */
  saveChecks() {
    const checkedNames = this.shoppingList
      .filter(item => item.selected)
      .map(item => item.name);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checkedNames));
  }

  /**
   * Alterna la selección de un ítem y guarda
   */
  toggleItem(item: ShoppingItem) {
    item.selected = !item.selected;
    this.saveChecks();
  }

  segmentChanged(event: any) {
    this.selectedPeriod = event.detail.value;
    switch (this.selectedPeriod) {
      case 'semanal': this.multiplier = 7; break;
      case '2semanas': this.multiplier = 14; break;
      case 'mensual': this.multiplier = 28; break;
    }
  }

  toggleSelectAll(select: boolean) {
    this.shoppingList.forEach(item => item.selected = select);
    this.saveChecks();
  }
}
