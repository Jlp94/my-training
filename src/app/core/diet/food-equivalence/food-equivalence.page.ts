import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel, IonList, IonSelect, IonSelectOption, IonInput, IonNote, IonSpinner, IonBadge, IonIcon } from '@ionic/angular/standalone';
import { HeaderComponent } from 'src/app/components/header/header.component';
import { LayoutComponent } from 'src/app/components/layout/layout.component';
import { FoodService } from 'src/app/services/diet/food-service';
import { Food, NutritionalType } from 'src/app/common/diet-interface';
import { addIcons } from 'ionicons';
import { swapHorizontalOutline, arrowUpOutline, arrowDownOutline } from 'ionicons/icons';

interface FoodEquivalence {
  name: string;
  grams: number;
  kcalPer100: number;
}

@Component({
  selector: 'app-food-equivalence',
  templateUrl: './food-equivalence.page.html',
  styleUrls: ['./food-equivalence.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonItem, IonLabel,
    IonList, IonSelect, IonSelectOption, IonInput, IonNote, IonSpinner, IonBadge, IonIcon
  ]
})
export class FoodEquivalencePage implements OnInit {
  private readonly foodService: FoodService = inject(FoodService);

  allFoods: Food[] = [];
  loading = true;

  // Tipos nutricionales disponibles (del enum)
  categories = Object.values(NutritionalType);

  // Estado de selección
  selectedCategory: string = '';
  filteredFoods: Food[] = [];
  selectedFood: Food | null = null;
  baseQuantity: number = 100;

  // Resultados de equivalencias
  equivalences: FoodEquivalence[] = [];

  constructor() {
    addIcons({ swapHorizontalOutline, arrowUpOutline, arrowDownOutline });
  }

  ngOnInit() {
    this.foodService.findAll().subscribe({
      next: (foods) => {
        this.allFoods = foods;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  // Al cambiar tipo nutricional → filtrar alimentos
  onCategoryChange() {
    this.filteredFoods = this.allFoods
      .filter(food => food.nutritionalType === this.selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
    this.selectedFood = null;
    this.equivalences = [];
  }

  // Al seleccionar alimento → calcular equivalencias
  selectBaseFood(food: Food) {
    this.selectedFood = food;
    this.calculateEquivalences();
  }

  // Recalcular cuando cambia la cantidad
  onQuantityChange() {
    if (this.selectedFood) {
      this.calculateEquivalences();
    }
  }

  // Cálculo: kcal del alimento base × cantidad → gramos equivalentes de cada alimento
  calculateEquivalences() {
    if (!this.selectedFood || this.baseQuantity <= 0) {
      this.equivalences = [];
      return;
    }

    // Kcal totales del alimento base con la cantidad indicada
    const baseKcalTotal = (this.selectedFood.kcal / 100) * this.baseQuantity;

    // Calcular gramos equivalentes para cada alimento de la misma categoría
    this.equivalences = this.filteredFoods
      .filter(food => food._id !== this.selectedFood!._id && food.kcal > 0)
      .map(food => ({
        name: food.name,
        grams: Math.round((baseKcalTotal / food.kcal) * 100 * 10) / 10,
        kcalPer100: food.kcal
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
