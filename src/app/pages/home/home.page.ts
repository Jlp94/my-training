import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import {
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel, IonDatetime, IonDatetimeButton
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import {
  chevronBackOutline, chevronForwardOutline, pencilOutline,
  analyticsOutline, medkitOutline, body, scaleOutline, footstepsOutline, barbellOutline
} from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast-service';
import { UserService } from 'src/app/services/user-service';
import { UserNeat } from 'src/app/common/userInterface';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel, IonDatetime, IonDatetimeButton,
    HeaderComponent, LayoutComponent, RouterLink, ReactiveFormsModule, CommonModule
  ],
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('weightChart') weightChartCanvas!: ElementRef;
  @ViewChild('stepsChart') stepsChartCanvas!: ElementRef;
  @ViewChild('progressChart') progressChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);
  private readonly userService: UserService = inject(UserService);
  private readonly fb: FormBuilder = inject(FormBuilder);

  // Instancias de charts
  private weightChart: Chart | null = null;
  private stepsChart: Chart | null = null;
  private progressChart: Chart | null = null;

  // Datos del usuario
  private userId: string = '';
  neatLogs: UserNeat[] = [];
  private cardioKcalGoal: number = 0;

  // Modal de registro
  isModalOpen = false;
  maxDate: string = new Date().toISOString();

  registroForm: FormGroup = this.fb.group({
    fecha: [new Date().toISOString().split('T')[0], [Validators.required]],
    peso: [null as number | null, [Validators.min(0)]],
    pasos: [null as number | null, [Validators.min(0)]]
  });

  get fecha() { return this.registroForm.get('fecha'); }
  get peso() { return this.registroForm.get('peso'); }
  get pasos() { return this.registroForm.get('pasos'); }

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

  // Pasos totales de la semana y porcentaje de progreso semanal
  get weeklyStepsTotal(): number {
    return this.getWeekStepsData().reduce((sum, s) => sum + s, 0);
  }

  get weeklyStepsGoal(): number {
    return this.cardioKcalGoal > 0 ? this.cardioKcalGoal : 70000;
  }

  get stepsProgress(): number {
    return this.weeklyStepsGoal > 0 ? Math.min(Math.round((this.weeklyStepsTotal / this.weeklyStepsGoal) * 100), 100) : 0;
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  prevWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() - 7 * 86400000);
    this.updateStepsChart();
  }

  nextWeek() {
    this.currentWeekStart = new Date(this.currentWeekStart.getTime() + 7 * 86400000);
    this.updateStepsChart();
  }

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, pencilOutline, body, medkitOutline, analyticsOutline, scaleOutline, footstepsOutline, barbellOutline });
  }

  ngOnInit() {
    this.loadUserData();
  }

  ngAfterViewInit() {
    // Charts se crean después de cargar datos
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

  // Cargar usuario → neatLogs → crear gráficas
  loadUserData() {
    this.userService.getUser().subscribe({
      next: (user) => {
        this.userId = user._id;
        this.neatLogs = user.profile.neatLogs || [];
        this.cardioKcalGoal = user.profile.cardioKcalGoal || 0;

        // Crear gráficas con datos reales
        setTimeout(() => {
          this.destroyCharts();
          this.createWeightChart();
          this.createStepsChart();
          this.createProgressChart();
        }, 100);
      },
      error: (err) => {
        console.error('Error cargando usuario:', err);
      }
    });
  }

  // ──── GRÁFICA DE PESO ────
  // Últimos N registros que tengan peso
  private getWeightData(): { labels: string[]; data: number[] } {
    const withWeight = this.neatLogs
      .filter(log => log.weight != null)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-12); // Últimos 12 registros

    return {
      labels: withWeight.map(log => {
        const parts = log.date.split('-');
        return `${parts[2]}/${parts[1]}`;
      }),
      data: withWeight.map(log => log.weight!)
    };
  }

  createWeightChart() {
    if (!this.weightChartCanvas) return;
    const { labels, data } = this.getWeightData();

    this.weightChart = new Chart(this.weightChartCanvas.nativeElement, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Sin datos'],
        datasets: [{
          data: data.length > 0 ? data : [0],
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
        plugins: { legend: { display: false } },
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

  // ──── GRÁFICA DE PASOS ────
  // Datos de pasos para la semana seleccionada (Lun-Dom)
  getWeekStepsData(): number[] {
    const weekData: number[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(this.currentWeekStart);
      day.setDate(day.getDate() + i);
      const dateStr = day.toISOString().split('T')[0];
      const log = this.neatLogs.find(l => l.date === dateStr);
      weekData.push(log?.steps || 0);
    }
    return weekData;
  }

  createStepsChart() {
    if (!this.stepsChartCanvas) return;
    const stepsData = this.getWeekStepsData();

    this.stepsChart = new Chart(this.stepsChartCanvas.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        datasets: [{
          data: stepsData,
          backgroundColor: '#2dd36f',
          borderRadius: 8,
          barThickness: 25
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  updateStepsChart() {
    if (!this.stepsChart) return;
    this.stepsChart.data.datasets[0].data = this.getWeekStepsData();
    this.stepsChart.update();
  }

  // ──── GRÁFICA DE PROGRESO ────
  createProgressChart() {
    if (!this.progressChartCanvas) return;

    this.progressChart = new Chart(this.progressChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{
          data: [this.stepsProgress, 100 - this.stepsProgress],
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

  // ──── MODAL ────
  openRegistroModal() {
    this.isModalOpen = true;
    this.loadExistingLog();
  }

  closeRegistroModal() {
    this.isModalOpen = false;
    this.registroForm.reset({
      fecha: new Date().toISOString().split('T')[0],
      peso: null,
      pasos: null
    });
  }

  // Al cambiar la fecha → cargar datos existentes si los hay
  onDateChange(event: any) {
    const isoValue = event.detail.value;
    if (isoValue) {
      const dateOnly = isoValue.split('T')[0];
      this.registroForm.patchValue({ fecha: dateOnly });
      this.loadExistingLog();
    }
  }

  private loadExistingLog() {
    const fechaValue = this.registroForm.get('fecha')?.value;
    const existing = this.neatLogs.find(l => l.date === fechaValue);
    if (existing) {
      this.registroForm.patchValue({
        peso: existing.weight ?? null,
        pasos: existing.steps ?? null
      });
    } else {
      this.registroForm.patchValue({ peso: null, pasos: null });
    }
  }

  guardarRegistro() {
    const { fecha, peso, pasos } = this.registroForm.value;

    if (!peso && !pasos) {
      this.toastService.error('Introduce al menos un dato');
      return;
    }

    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const log: { date: string; weight?: number; steps?: number } = { date: fecha };
    if (peso) log.weight = peso;
    if (pasos) log.steps = pasos;

    // Comprobar si ya existe un log para esa fecha → update, sino → add
    const existingLog = this.neatLogs.find(l => l.date === fecha);

    if (existingLog) {
      this.userService.updateNeatLog(this.userId, fecha, log).subscribe({
        next: () => {
          this.toastService.success('Registro actualizado correctamente');
          this.closeRegistroModal();
          this.loadUserData();
        },
        error: (err) => {
          console.error('Error actualizando registro:', err);
          this.toastService.error('Error al actualizar el registro');
        }
      });
    } else {
      this.userService.addNeatLog(this.userId, log).subscribe({
        next: () => {
          this.toastService.success('Registro guardado correctamente');
          this.closeRegistroModal();
          this.loadUserData();
        },
        error: (err) => {
          console.error('Error guardando registro:', err);
          this.toastService.error('Error al guardar el registro');
        }
      });
    }
  }
}
