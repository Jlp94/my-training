import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote, IonFooter, IonText, IonFab, IonFabButton, IonProgressBar } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame, checkmarkCircle, closeCircle, close, saveOutline, alertCircle, closeOutline } from 'ionicons/icons';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastService } from 'src/app/services/toast-service';

Chart.register(DoughnutController, PieController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-my-diet',
  templateUrl: './my-diet.page.html',
  styleUrls: ['./my-diet.page.scss'],
  standalone: true,
  imports: [IonText, IonFooter, IonNote, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonList, IonCheckbox, IonFab, IonFabButton, IonProgressBar]
})
export class MyDietPage implements OnInit {
  @ViewChild('macrosChart') macrosChartCanvas!: ElementRef;
  @ViewChild('caloriesChart') caloriesChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);

  macrosChart: any;
  caloriesChart: any;
  caloriesTarget: number = 1407;

  // Datos de Prueba
  macros = {
    protein: 150, // Rojo (Proteínas)
    carbs: 200,   // Amarillo (Carbohidratos)
    fats: 60      // Azul (Grasas)
  };

  caloriesConsumed = 0;

  // Progreso semanal de calorías
  weeklyCaloriesTarget = 9849; // 1407 * 7
  weeklyCaloriesConsumed = 7200; // ejemplo: calorías ya consumidas esta semana

  get weeklyProgress(): number {
    return this.weeklyCaloriesTarget > 0 ? Math.min(this.weeklyCaloriesConsumed / this.weeklyCaloriesTarget, 1) : 0;
  }

  get weeklyExceeded(): boolean {
    return this.weeklyCaloriesConsumed > this.weeklyCaloriesTarget;
  }

  get weeklyExcessCalories(): number {
    return this.weeklyCaloriesConsumed - this.weeklyCaloriesTarget;
  }
  // Datos de Comidas
  meals = [
    {
      name: 'Desayuno',
      completed: false,
      // Totales de la comida (calculados sumando los alimentos)
      totalKcal: 387,
      totalMacros: { carbs: 45, protein: 35, fat: 12 },
      foods: [
        {
          name: 'YOGUR + PROTEINAS',
          quantity: 200, // Número puro para cálculos
          kcal: 104,
          // Macros base por cada 100g (Carbs, Protein, Fat)
          baseMacros: { carbs: 4, protein: 9, fat: 0 }
        },
        {
          name: 'MANZANA',
          quantity: 200,
          kcal: 104,
          baseMacros: { carbs: 13, protein: 0.3, fat: 0.2 }
        },
        {
          name: 'NUECES',
          quantity: 25,
          kcal: 179,
          baseMacros: { carbs: 13.7, protein: 15.2, fat: 65.2 }
        }
      ]
    },
    {
      name: 'Comida',
      completed: false,
      totalKcal: 484,
      totalMacros: { carbs: 55, protein: 45, fat: 15 },
      foods: [
        { name: 'VERDURAS AL GUSTO', quantity: 100, kcal: 50, baseMacros: { carbs: 10, protein: 2, fat: 0.2 } },
        { name: 'PLATANO', quantity: 100, kcal: 89, baseMacros: { carbs: 22.8, protein: 1.1, fat: 0.3 } },
        { name: 'HUEVOS', quantity: 50, kcal: 73.5, baseMacros: { carbs: 1.1, protein: 13, fat: 11 } },
        { name: 'ARROZ', quantity: 30, kcal: 106.5, baseMacros: { carbs: 78, protein: 7, fat: 0.6 } },
        { name: 'FILETE DE PECHUGA DE POLLO', quantity: 150, kcal: 165, baseMacros: { carbs: 0, protein: 23, fat: 1.2 } }
      ]
    },
    {
      name: 'Cena',
      completed: false,
      totalKcal: 536,
      totalMacros: { carbs: 40, protein: 40, fat: 20 },
      foods: [
        { name: 'SALMON', quantity: 100, kcal: 224, baseMacros: { carbs: 0, protein: 20, fat: 13 } },
        { name: 'AGUACATE/GUACAMOLE', quantity: 100, kcal: 160, baseMacros: { carbs: 8.5, protein: 2, fat: 14.7 } },
        { name: 'PATATA', quantity: 150, kcal: 102, baseMacros: { carbs: 17, protein: 2, fat: 0.1 } },
        { name: 'VERDURAS AL GUSTO', quantity: 100, kcal: 50, baseMacros: { carbs: 10, protein: 2, fat: 0.2 } }
      ]
    }
  ];

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


  constructor() {
    addIcons({ flame, alertCircle, closeOutline, checkmarkCircle, close, search, saveOutline, timeOutline, add, barbell });
  }

  ngOnInit() {
    this.calculateTotalCalories();
  }

  ngAfterViewInit() {
    this.createMacrosChart();
    // Force update
    setTimeout(() => this.updateChartData(), 100);
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

    if (!wasGoalReached && isGoalReached) {
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

    // Calculate TOTAL planned macros from meals to be the 100% reference
    let totalPlanMacros = { protein: 0, carbs: 0, fat: 0 };
    this.meals.forEach(m => {
      if (m.totalMacros) {
        totalPlanMacros.protein += m.totalMacros.protein;
        totalPlanMacros.carbs += m.totalMacros.carbs;
        totalPlanMacros.fat += m.totalMacros.fat;
      }
    });

    // Use totalPlanMacros as the denominator so chart fills when meals are done
    const pPct = Math.min(100, (consumed.protein / totalPlanMacros.protein) * 100);
    const cPct = Math.min(100, (consumed.carbs / totalPlanMacros.carbs) * 100);
    const fPct = Math.min(100, (consumed.fat / totalPlanMacros.fat) * 100);

    // Dataset 0: Protein
    this.macrosChart.data.datasets[0].data = [pPct, 100 - pPct];
    // Dataset 1: Carbs
    this.macrosChart.data.datasets[1].data = [cPct, 100 - cPct];
    // Dataset 2: Fats
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
              backgroundColor: ['#ffc409', '#f4f5f8'], // Yellow
              borderWidth: 2,
              circumference: 360,
              weight: 5
            },
            // Outer Ring - Protein
            {
              data: [0, 100],
              backgroundColor: ['#eb445a', '#f4f5f8'], // Red
              borderWidth: 2,
              circumference: 360,
              weight: 5
            },
            // Inner Ring - Fats
            {
              data: [0, 100],
              backgroundColor: ['#3880ff', '#f4f5f8'], // Blue
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
  }

  addExtra() {
    // Validación de campos obligatorios
    if (!this.extraName || this.extraAmount === null || this.extraKcal === null || this.extraProtein === null || this.extraCarbs === null || this.extraFat === null) {
      this.toastService.error('Todos los campos son obligatorios');
      return;
    }

    // Validación de valores negativos
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

    // Reiniciar campos
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
