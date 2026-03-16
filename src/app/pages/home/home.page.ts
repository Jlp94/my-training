import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, OnInit, signal, computed, WritableSignal, Signal, effect } from '@angular/core';
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
import { CardioService } from 'src/app/services/cardio-service';
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
  private readonly cardioService: CardioService = inject(CardioService);
  private readonly fb: FormBuilder = inject(FormBuilder);

  // Instancias de charts
  private weightChart: Chart | null = null;
  private stepsChart: Chart | null = null;
  private progressChart: Chart | null = null;

  // Datos del usuario (Signals)
  private userId: string = '';
  neatLogs: WritableSignal<UserNeat[]> = signal([]);
  cardioKcalGoal: WritableSignal<number> = signal(0);

  // Modal de registro
  isModalOpen = false;
  maxDate: string = new Date().toISOString();

  registroForm: FormGroup = this.fb.group({
    fecha: [this.todayLocal(), [Validators.required]],
    peso: [null as number | null, [Validators.min(0)]],
    pasos: [null as number | null, [Validators.min(0)]]
  });

  get fecha() { return this.registroForm.get('fecha'); }
  get peso() { return this.registroForm.get('peso'); }
  get pasos() { return this.registroForm.get('pasos'); }

  // Navegación semanal de pasos (Signal)
  currentWeekStart: WritableSignal<Date> = signal(this.getMonday(new Date()));

  private readonly meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  weekLabel = computed(() => {
    const start = this.currentWeekStart();
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const dStart = String(start.getDate()).padStart(2, '0');
    const dEnd = String(end.getDate()).padStart(2, '0');
    return `${dStart} ${this.meses[start.getMonth()]} — ${dEnd} ${this.meses[end.getMonth()]}`;
  });

  // Datos de pasos de la semana
  weekStepsData = computed(() => {
    const weekData: number[] = [];
    const logs = this.neatLogs();
    const start = this.currentWeekStart();
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(day.getDate() + i);
      const y = day.getFullYear();
      const m = String(day.getMonth() + 1).padStart(2, '0');
      const d = String(day.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${d}`;
      const log = logs.find(l => l.date === dateStr);
      weekData.push(log?.steps || 0);
    }
    return weekData;
  });

  weeklyStepsTotal = computed(() => {
    return this.weekStepsData().reduce((sum, s) => sum + s, 0);
  });

  weeklyStepsGoal = computed(() => {
    return this.cardioKcalGoal() > 0 ? this.cardioKcalGoal() * 7 : 70000;
  });

  stepsProgress = computed(() => {
    const goal = this.weeklyStepsGoal();
    return goal > 0 ? Math.min(Math.round((this.weeklyStepsTotal() / goal) * 100), 100) : 0;
  });

  // Progreso de CARDIO Semanal
  weeklyCardioKcalTotal = computed(() => {
    // Si estamos en la semana actual basada en currentWeekStart, mostrar el dato real del servicio
    // De lo contrario, no tenemos histórico en localStorage (podría mejorarse a futuro si la API lo guarda)
    const start = this.currentWeekStart();
    const isCurrentWeek = this.getWeekNumber(start) === this.getWeekNumber(new Date());
    
    return isCurrentWeek ? this.cardioService.weeklyCardioKcal() : 0;
  });

  cardioProgress = computed(() => {
    const goal = this.cardioKcalGoal();
    return goal > 0 ? Math.min(Math.round((this.weeklyCardioKcalTotal() / goal) * 100), 100) : 0;
  });

  private getWeekNumber(d: Date): number {
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    return Math.ceil((diff / 86400000 + start.getDay()) / 7);
  }

  private getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }

  // Fecha local en formato YYYY-MM-DD (evita desfase UTC)
  private todayLocal(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  prevWeek() {
    this.currentWeekStart.update(d => new Date(d.getTime() - 7 * 86400000));
    this.updateStepsChart();
  }

  nextWeek() {
    this.currentWeekStart.update(d => new Date(d.getTime() + 7 * 86400000));
    this.updateStepsChart();
  }

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, pencilOutline, body, medkitOutline, analyticsOutline, scaleOutline, footstepsOutline, barbellOutline });

    // Efecto reactivo: si cambia el progreso de cardio (ej. por cambiar currentWeekStart), actualizar el gráfico
    effect(() => {
      const progress = this.cardioProgress();
      if (this.progressChart) {
        this.progressChart.data.datasets[0].data = [progress, 100 - progress];
        this.progressChart.update();
      }
    });
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
        this.neatLogs.set(user.profile.neatLogs || []);
        this.cardioKcalGoal.set(user.profile.cardioKcalGoal || 0);

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
    const withWeight = this.neatLogs()
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
          borderColor: '#5261ff9d',
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
  // Los datos de pasos se cogen del computed this.weekStepsData()
  createStepsChart() {
    if (!this.stepsChartCanvas) return;
    const stepsData = this.weekStepsData();

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
    this.stepsChart.data.datasets[0].data = this.weekStepsData();
    this.stepsChart.update();
  }

  // ──── GRÁFICA DE PROGRESO ────
  createProgressChart() {
    if (!this.progressChartCanvas) return;

    this.progressChart = new Chart(this.progressChartCanvas.nativeElement, {
      type: 'doughnut',
      data: {
        datasets: [{
          // Ahora muestra el progreso de CARDIO, no el de pasos
          data: [this.cardioProgress(), 100 - this.cardioProgress()],
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
      fecha: this.todayLocal(),
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
    const existing = this.neatLogs().find(l => l.date === fechaValue);
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
    if (peso) log.weight = Number(peso);
    if (pasos) log.steps = Number(pasos);

    // Comprobar si ya existe un log para esa fecha → update, sino → add
    const existingLog = this.neatLogs().find(l => l.date === fecha);

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
