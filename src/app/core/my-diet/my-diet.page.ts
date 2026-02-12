import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote, IonFooter, IonText } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame, checkmarkCircle, closeCircle, close } from 'ionicons/icons';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastService } from 'src/app/services/toast-service';

Chart.register(DoughnutController, PieController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-my-diet',
  templateUrl: './my-diet.page.html',
  styleUrls: ['./my-diet.page.scss'],
  standalone: true,
  imports: [IonText, IonFooter, IonNote, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonList, IonCheckbox]
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
  // Datos de Comidas
  meals = [
    {
      name: 'Desayuno',
      time: 'desayuno',
      calories: 387,
      macros: { protein: 35, carbs: 45, fat: 12 },
      foods: [
        { name: 'YOGUR + PROTEINAS', amount: '200 g', kcal: 104 },
        { name: 'MANZANA', amount: '200 g', kcal: 104 },
        { name: 'NUECES', amount: '25 g', kcal: 179 }
      ],
      completed: false
    },
    {
      name: 'Comida',
      time: 'comida',
      calories: 484,
      macros: { protein: 45, carbs: 55, fat: 15 },
      foods: [
        { name: 'VERDURAS AL GUSTO', amount: '100 g', kcal: 50 },
        { name: 'PLATANO', amount: '100 g', kcal: 89 },
        { name: 'HUEVOS', amount: '50 g', kcal: 73.5 },
        { name: 'ARROZ', amount: '30 g', kcal: 106.5 },
        { name: 'FILETE DE PECHUGA DE POLLO', amount: '150 g', kcal: 165 }
      ],
      completed: false
    },
    {
      name: 'Cena',
      time: 'cena',
      calories: 536,
      macros: { protein: 40, carbs: 40, fat: 20 },
      foods: [
        { name: 'SALMON', amount: '100 g', kcal: 224 },
        { name: 'AGUACATE/GUACAMOLE', amount: '100 g', kcal: 160 },
        { name: 'PATATA', amount: '150 g', kcal: 102 },
        { name: 'VERDURAS AL GUSTO', amount: '100 g', kcal: 50 },
      ],
      completed: false
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
    addIcons({ checkmarkCircle, timeOutline, flame, close, search, closeCircle, add, barbell });
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
      return meal.completed ? total + meal.calories : total;
    }, 0);

    const extrasCalories = this.extras.reduce((total, extra) => {
      return total + (extra.kcal || 0);
    }, 0);

    this.caloriesConsumed = mealsCalories + extrasCalories;

    this.updateChartData();

    const isGoalReached = this.caloriesConsumed >= this.caloriesTarget;

    if (!wasGoalReached && isGoalReached) {
      this.toastService.cargarToast('¡Has alcanzado las Kcal del día!', 2000, 'success');
    }
  }

  getConsumedMacros() {
    let p = 0, c = 0, f = 0;

    this.meals.forEach(m => {
      if (m.completed && m.macros) {
        p += m.macros.protein;
        c += m.macros.carbs;
        f += m.macros.fat;
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
      if (m.macros) {
        totalPlanMacros.protein += m.macros.protein;
        totalPlanMacros.carbs += m.macros.carbs;
        totalPlanMacros.fat += m.macros.fat;
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
      this.toastService.cargarToast('Todos los campos son obligatorios', 2000, 'danger');
      return;
    }

    // Validación de valores negativos
    if (this.extraAmount < 0 || this.extraKcal < 0 || this.extraProtein < 0 || this.extraCarbs < 0 || this.extraFat < 0) {
      this.toastService.cargarToast('Los valores no pueden ser negativos', 2000, 'danger');
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

    this.toastService.cargarToast('Extra añadido correctamente', 2000, 'success');
  }

  removeExtra(index: number) {
    this.extras.splice(index, 1);
    this.calculateTotalCalories();
  }

}
