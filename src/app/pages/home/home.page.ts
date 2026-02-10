import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import {
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, pencilOutline,
  analyticsOutline, medkitOutline, body
} from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { RouterLink } from '@angular/router';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    HeaderComponent,
    LayoutComponent,
    RouterLink
  ],
})
export class HomePage implements AfterViewInit {

  @ViewChild('weightChart') weightChartCanvas!: ElementRef;
  @ViewChild('stepsChart') stepsChartCanvas!: ElementRef;
  @ViewChild('progressChart') progressChartCanvas!: ElementRef;

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, pencilOutline, body, medkitOutline, analyticsOutline });
  }

  ngAfterViewInit() {
    this.createWeightChart();
    this.createStepsChart();
    this.createProgressChart();
  }

  createWeightChart() {
    new Chart(this.weightChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['27/12', '29/12', '31/12', '03/01', '05/01', '07/01', '09/01', '11/01'],
        datasets: [{
          data: [78, 81, 79, 80, 81, 92, 81, 80, 81, 79, 80, 80, 80],
          borderColor: '#3880ff',
          backgroundColor: 'rgba(56, 128, 255, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#3880ff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: { color: '#f0f0f0' },
            ticks: { callback: (value) => value + ' kg' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  createStepsChart() {
    new Chart(this.stepsChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        datasets: [{
          data: [14000, 12000, 15000, 16000, 10000, 32000, 0],
          backgroundColor: '#3880ff',
          borderRadius: 8,
          barThickness: 25
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  createProgressChart() {
    new Chart(this.progressChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [95, 5],
          backgroundColor: ['#3880ff', '#f0f0f0'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '80%',
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }
}
