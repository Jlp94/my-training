import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy } from '@angular/core';
import {
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButtons, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, pencilOutline,
  analyticsOutline, medkitOutline, body, scaleOutline, footstepsOutline, barbellOutline
} from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel,
    HeaderComponent, LayoutComponent, RouterLink, FormsModule
  ],
})
export class HomePage implements AfterViewInit, OnDestroy {

  @ViewChild('weightChart') weightChartCanvas!: ElementRef;
  @ViewChild('stepsChart') stepsChartCanvas!: ElementRef;
  @ViewChild('progressChart') progressChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);

  // Instancias de charts para destruirlas al recrear
  private weightChart: Chart | null = null;
  private stepsChart: Chart | null = null;
  private progressChart: Chart | null = null;

  // Modal de registro
  isModalOpen = false;
  registroFecha: string = new Date().toISOString().split('T')[0];
  registroPeso: number | null = null;
  registroPasos: number | null = null;

  // Navegación semanal de pasos
  currentWeekStart: Date = this.getMonday(new Date());

  private readonly meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  get weekLabel(): string {
    const start = this.currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const dStart = String(start.getDate()).padStart(2, '0');
    const dEnd = String(end.getDate()).padStart(2, '0');
    return `${dStart} ${this.meses[start.getMonth()]} — ${dEnd} ${this.meses[end.getMonth()]}`;
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // lunes = 1
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  prevWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() - 7 * 86400000);
  }

  nextWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() + 7 * 86400000);
  }

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, pencilOutline, body, medkitOutline, analyticsOutline, scaleOutline, footstepsOutline, barbellOutline });
  }

  ngAfterViewInit() {
    this.destroyCharts();
    this.createWeightChart();
    this.createStepsChart();
    this.createProgressChart();
  }

  ngOnDestroy() {
    this.destroyCharts();
  }

  private destroyCharts() {
    this.weightChart?.destroy();
    this.stepsChart?.destroy();
    this.progressChart?.destroy();
    this.weightChart = null;
    this.stepsChart = null;
    this.progressChart = null;
  }

  createWeightChart() {
    this.weightChart = new Chart(this.weightChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: ['27/12', '29/12', '31/12', '03/01', '05/01', '07/01', '09/01', '11/01'],
        datasets: [{
          data: [78, 81, 79, 80, 81, 92, 81, 80, 81, 79, 80, 80, 80],
          borderColor: '#5260ff',
          backgroundColor: 'rgba(82, 96, 255, 0.15)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#5260ff'
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
    this.stepsChart = new Chart(this.stepsChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        datasets: [{
          data: [18000, 12000, 15000, 25000, 10000, 32000, 0],
          backgroundColor: [
            '#2dd36f', '#2dd36f', '#2dd36f', '#2dd36f',
            '#2dd36f', '#2dd36f', '#2dd36f'
          ],
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
    this.progressChart = new Chart(this.progressChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [95, 5],
          backgroundColor: ['#ffc409', '#f0f0f0'],
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

  // Modal
  openRegistroModal() {
    this.isModalOpen = true;
  }

  closeRegistroModal() {
    this.isModalOpen = false;
    this.registroPeso = null;
    this.registroPasos = null;
    this.registroFecha = new Date().toISOString();
  }

  guardarRegistro() {
    if (!this.registroPeso && !this.registroPasos) {
      this.toastService.error('Introduce al menos un dato');
      return;
    }
    // TODO: guardar datos en backend
    console.log('Registro:', { fecha: this.registroFecha, peso: this.registroPeso, pasos: this.registroPasos });
    this.toastService.success('Registro guardado correctamente');
    this.closeRegistroModal();
  }
}
