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

  categories = Object.values(NutritionalType);

  selectedCategory: string = '';
  filteredFoods: Food[] = [];
  selectedFood: Food | null = null;
  baseQuantity: number = 100;

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

  onCategoryChange() {
    this.filteredFoods = this.allFoods
      .filter(food => food.nutritionalType === this.selectedCategory)
      .sort((a, b) => a.name.localeCompare(b.name));
    this.selectedFood = null;
    this.equivalences = [];
  }

  selectBaseFood(food: Food) {
    this.selectedFood = food;
    this.calculateEquivalences();
  }

  onQuantityChange() {
    if (this.selectedFood) {
      this.calculateEquivalences();
    }
  }

  calculateEquivalences() {
    if (!this.selectedFood || this.baseQuantity <= 0) {
      this.equivalences = [];
      return;
    }

    const baseKcalTotal = (this.selectedFood.kcal / 100) * this.baseQuantity;

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
