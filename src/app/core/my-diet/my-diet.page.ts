import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote, IonFooter, IonText, IonFab, IonFabButton, IonProgressBar, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame, checkmarkCircle, closeCircle, close, saveOutline, alertCircle, closeOutline } from 'ionicons/icons';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastService } from 'src/app/services/toast-service';
import { DietService } from 'src/app/services/diet-service';
import { EdamamService } from 'src/app/services/edamam-service';
import { Alimento, MealFoodView, MealView, EdamamFood } from 'src/app/common/diet-interface';
import { UserMacros } from 'src/app/common/userInterface';

Chart.register(DoughnutController, PieController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-my-diet',
  templateUrl: './my-diet.page.html',
  styleUrls: ['./my-diet.page.scss'],
  standalone: true,
  imports: [IonText, IonFooter, IonNote, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonList, IonCheckbox, IonFab, IonFabButton, IonProgressBar, IonSpinner]
})
export class MyDietPage implements OnInit {
  @ViewChild('macrosChart') macrosChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);
  private readonly dietService: DietService = inject(DietService);
  private readonly edamamService: EdamamService = inject(EdamamService);

  macrosChart: any;

  // Macros objetivo del usuario (viene del perfil)
  macros: UserMacros = { targetKcal: 0, protein: 0, carbs: 0, fat: 0 };
  caloriesTarget: number = 0;

  caloriesConsumed = 0;

  // Progreso semanal de calorías
  weeklyCaloriesTarget = 0;
  weeklyCaloriesConsumed = 0;

  get weeklyProgress(): number {
    return this.weeklyCaloriesTarget > 0 ? Math.min(this.weeklyCaloriesConsumed / this.weeklyCaloriesTarget, 1) : 0;
  }

  get weeklyExceeded(): boolean {
    return this.weeklyCaloriesConsumed > this.weeklyCaloriesTarget;
  }

  get weeklyExcessCalories(): number {
    return this.weeklyCaloriesConsumed - this.weeklyCaloriesTarget;
  }

  // Comidas enriquecidas con datos reales
  meals: MealView[] = [];

  // Datos de Extras
  extras: any[] = [];

  // Datos del Modal de Extras
  isModalOpen = false;
  extraName: string = '';
  extraAmount: number | null = null;
  extraKcal: number | null = null;
  extraProtein: number | null = null;
  extraCarbs: number | null = null;
  extraFat: number | null = null;

  // Búsqueda Edamam
  searchResults: EdamamFood[] = [];
  searching = false;

  constructor() {
    addIcons({ flame, alertCircle, closeOutline, checkmarkCircle, close, search, saveOutline, timeOutline, add, barbell });
  }

  ngOnInit() {
    this.loadDiet();
  }

  ngAfterViewInit() {
    this.createMacrosChart();
    setTimeout(() => this.updateChartData(), 100);
  }

  loadDiet() {
    this.dietService.getMyDiet().subscribe({
      next: ({ profile, diet, foods }) => {
        // Macros objetivo del perfil
        this.macros = profile.macros || { targetKcal: 0, protein: 0, carbs: 0, fat: 0 };
        this.caloriesTarget = this.macros.targetKcal;
        this.weeklyCaloriesTarget = this.caloriesTarget * 7;

        // Mapa foodId → alimento completo
        const foodMap = new Map<string, Alimento>(foods.map(food => [food._id, food]));

        // Enriquecer cada comida
        this.meals = diet.meals.map(meal => {
          const enrichedFoods: MealFoodView[] = meal.foods.map(mf => {
            const food = foodMap.get(mf.foodId);
            const factor = mf.quantity / 100;

            return {
              name: food?.name || 'Alimento desconocido',
              quantity: mf.quantity,
              kcal: Math.round((food?.kcal || 0) * factor),
              baseMacros: {
                carbs: food?.carbs || 0,
                protein: food?.protein || 0,
                fat: food?.fat || 0
              }
            };
          });

          const totalKcal = enrichedFoods.reduce((sum, f) => sum + f.kcal, 0);
          const totalMacros = enrichedFoods.reduce((acc, f) => {
            const factor = f.quantity / 100;
            return {
              carbs: acc.carbs + Math.round(f.baseMacros.carbs * factor),
              protein: acc.protein + Math.round(f.baseMacros.protein * factor),
              fat: acc.fat + Math.round(f.baseMacros.fat * factor)
            };
          }, { carbs: 0, protein: 0, fat: 0 });

          return { name: meal.name, completed: false, totalKcal, totalMacros, foods: enrichedFoods };
        });

        this.calculateTotalCalories();
      },
      error: (err) => {
        if (err.message === 'NO_DIET') {
          console.log('El usuario no tiene dieta asignada');
        } else {
          console.error('Error cargando dieta:', err);
        }
      }
    });
  }

  calculateTotalCalories() {
    const wasGoalReached = this.caloriesConsumed >= this.caloriesTarget;

    const mealsCalories = this.meals.reduce((total, meal) => {
      return meal.completed ? total + meal.totalKcal : total;
    }, 0);

    const extrasCalories = this.extras.reduce((total, extra) => {
      return total + (extra.kcal || 0);
    }, 0);

    this.caloriesConsumed = mealsCalories + extrasCalories;

    this.updateChartData();

    const isGoalReached = this.caloriesConsumed >= this.caloriesTarget;

    if (!wasGoalReached && isGoalReached && this.caloriesTarget > 0) {
      this.toastService.success('¡Has alcanzado las Kcal del día!');
    }
  }

  getConsumedMacros() {
    let p = 0, c = 0, f = 0;

    this.meals.forEach(m => {
      if (m.completed && m.totalMacros) {
        p += m.totalMacros.protein;
        c += m.totalMacros.carbs;
        f += m.totalMacros.fat;
      }
    });

    this.extras.forEach(e => {
      p += (e.protein || 0);
      c += (e.carbs || 0);
      f += (e.fat || 0);
    });

    return { protein: p, carbs: c, fat: f };
  }

  updateChartData() {
    if (!this.macrosChart) return;

    const consumed = this.getConsumedMacros();

    // Usar macros objetivo del perfil como referencia 100%
    const pPct = this.macros.protein > 0 ? Math.min(100, (consumed.protein / this.macros.protein) * 100) : 0;
    const cPct = this.macros.carbs > 0 ? Math.min(100, (consumed.carbs / this.macros.carbs) * 100) : 0;
    const fPct = this.macros.fat > 0 ? Math.min(100, (consumed.fat / this.macros.fat) * 100) : 0;

    // Dataset 0: Carbs (Yellow)
    this.macrosChart.data.datasets[0].data = [cPct, 100 - cPct];
    // Dataset 1: Protein (Red)
    this.macrosChart.data.datasets[1].data = [pPct, 100 - pPct];
    // Dataset 2: Fats (Blue)
    this.macrosChart.data.datasets[2].data = [fPct, 100 - fPct];

    this.macrosChart.update();
  }

  createMacrosChart() {
    if (this.macrosChartCanvas) {
      this.macrosChart = new Chart(this.macrosChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
          datasets: [
            // Middle Ring - Carbs
            {
              data: [0, 100],
              backgroundColor: ['#ffc409', '#f4f5f8'],
              borderWidth: 2,
              circumference: 360,
              weight: 5
            },
            // Outer Ring - Protein
            {
              data: [0, 100],
              backgroundColor: ['#eb445a', '#f4f5f8'],
              borderWidth: 2,
              circumference: 360,
              weight: 5
            },
            // Inner Ring - Fats
            {
              data: [0, 100],
              backgroundColor: ['#3880ff', '#f4f5f8'],
              borderWidth: 2,
              circumference: 360,
              weight: 5
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '40%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          animation: {
            animateScale: true,
            animateRotate: true
          }
        }
      });
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.searchResults = [];
      this.searching = false;
    }
  }

  // Buscar alimentos en Edamam
  searchFood() {
    if (!this.extraName || this.extraName.length < 2) return;
    this.searching = true;
    this.edamamService.searchFood(this.extraName).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searching = false;
      },
      error: () => {
        this.searchResults = [];
        this.searching = false;
        this.toastService.error('Error buscando alimentos');
      }
    });
  }

  // Seleccionar alimento de los resultados
  selectFood(food: EdamamFood) {
    this.extraName = food.name;
    this.extraKcal = food.kcal;
    this.extraProtein = food.protein;
    this.extraCarbs = food.carbs;
    this.extraFat = food.fat;
    this.searchResults = [];
  }

  addExtra() {
    if (!this.extraName || this.extraAmount === null || this.extraKcal === null || this.extraProtein === null || this.extraCarbs === null || this.extraFat === null) {
      this.toastService.error('Todos los campos son obligatorios');
      return;
    }

    if (this.extraAmount < 0 || this.extraKcal < 0 || this.extraProtein < 0 || this.extraCarbs < 0 || this.extraFat < 0) {
      this.toastService.error('Los valores no pueden ser negativos');
      return;
    }

    const newExtra = {
      name: this.extraName,
      amount: this.extraAmount + ' g',
      kcal: this.extraKcal,
      protein: this.extraProtein,
      carbs: this.extraCarbs,
      fat: this.extraFat
    };

    this.extras.push(newExtra);
    this.calculateTotalCalories();

    this.setOpen(false);

    this.extraName = '';
    this.extraAmount = null;
    this.extraKcal = null;
    this.extraProtein = null;
    this.extraCarbs = null;
    this.extraFat = null;

    this.toastService.success('Extra añadido correctamente');
  }

  removeExtra(index: number) {
    this.extras.splice(index, 1);
    this.calculateTotalCalories();
  }

  // Guardar resumen de dieta
  saveDiet() {
    this.weeklyCaloriesConsumed += this.caloriesConsumed;
    this.toastService.success('Resumen de dieta guardado correctamente');
  }

}
