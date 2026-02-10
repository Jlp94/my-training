import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame } from 'ionicons/icons';
import { ViewChild, ElementRef } from '@angular/core';

Chart.register(DoughnutController, PieController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-my-diet',
  templateUrl: './my-diet.page.html',
  styleUrls: ['./my-diet.page.scss'],
  standalone: true,
  imports: [IonNote, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonList, IonCheckbox]
})
export class MyDietPage implements OnInit {

  @ViewChild('macrosChart') macrosChartCanvas!: ElementRef;
  // @ViewChild('caloriesChart') caloriesChartCanvas!: ElementRef; // Pie chart if needed, or maybe just one. User said Doughnut AND Pie.

  macrosChart: any;
  caloriesChart: any;
  caloriesTarget: number = 2000;

  // Mock Data
  macros = {
    protein: 150, // Red
    carbs: 200,   // Yellow
    fats: 60      // Blue
  };

  caloriesConsumed = 1511;
  // Meals Data
  meals = [
    {
      name: 'Desayuno',
      time: 'desayuno',
      calories: 387,
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
      foods: [
        { name: 'SALMON', amount: '100 g', kcal: 224 },
        { name: 'AGUACATE/GUACAMOLE', amount: '100 g', kcal: 160 },
        { name: 'PATATA', amount: '150 g', kcal: 102 },
        { name: 'VERDURAS AL GUSTO', amount: '100 g', kcal: 50 },
      ],
      completed: false
    }
  ];

  // Extra Modal Data
  isModalOpen = false;
  extraName: string = '';
  extraAmount: number | null = null;
  extraKcal: number = 0;
  extraProtein: number = 0;
  extraCarbs: number = 0;
  extraFat: number = 0;


  constructor() {
    addIcons({ add, search, barbell, timeOutline, flame });
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.createMacrosChart();
  }

  createMacrosChart() {
    if (this.macrosChartCanvas) {
      this.macrosChart = new Chart(this.macrosChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Proteínas', 'Carbohidratos', 'Grasas'],
          datasets: [{
            data: [this.macros.protein, this.macros.carbs, this.macros.fats],
            backgroundColor: [
              '#eb445a', // Red (Proteins) - Danger tint or custom red
              '#ffc409', // Yellow (Carbs) - Warning
              '#3880ff'  // Blue (Fats) - Primary
            ],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          cutout: '60%',
          plugins: {
            legend: {
              display: false // We will build a custom legend if needed or simple text
            }
          }
        }
      });
    }
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
  }

  addExtra() {
    console.log('Adding extra:', this.extraName, this.extraAmount);
    // Logic to add extra would go here
    this.setOpen(false);
    // Reset fields
    this.extraName = '';
    this.extraAmount = null;
  }

}
