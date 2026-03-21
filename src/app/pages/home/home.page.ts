import { Component, AfterViewInit, ViewChild, ElementRef, inject, OnDestroy, OnInit, signal, computed, WritableSignal, Signal, effect } from '@angular/core';
import {
  IonContent, IonCard, IonCardHeader,
  IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
  IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel, IonDatetime, IonDatetimeButton, IonText
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { Chart, registerables } from 'chart.js';
import { addIcons } from 'ionicons';
import {
  analyticsOutline, medkitOutline, body, scaleOutline, footstepsOutline, barbellOutline, warningOutline,
  chevronBackOutline, chevronForwardOutline, pencilOutline
} from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/ui/toast-service';
import { UserService } from 'src/app/services/user/user-service';
import { UserNeat } from 'src/app/common/userInterface';
import { NeatService } from 'src/app/services/user/neat-service';
import { CardioService } from 'src/app/services/workout/cardio-service';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    IonContent, IonCard, IonCardHeader,
    IonCardTitle, IonCardContent, IonButton, IonIcon, IonGrid, IonRow, IonCol,
    IonFab, IonFabButton, IonModal, IonInput, IonItem, IonLabel, IonDatetime, IonDatetimeButton, IonText,
    HeaderComponent, LayoutComponent, RouterLink, ReactiveFormsModule, CommonModule
  ],
})
export class HomePage implements OnInit, OnDestroy {

  @ViewChild('weightChart') weightChartCanvas!: ElementRef;
  @ViewChild('stepsChart') stepsChartCanvas!: ElementRef;
  @ViewChild('progressChart') progressChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);
  private readonly userService: UserService = inject(UserService);
  public readonly neatService: NeatService = inject(NeatService);
  private readonly cardioService: CardioService = inject(CardioService);
  private readonly fb: FormBuilder = inject(FormBuilder);

  // Instancias de charts
  private weightChart: Chart | null = null;
  private stepsChart: Chart | null = null;
  private progressChart: Chart | null = null;

  // Datos del usuario (Signals)
  private userId: string = '';
  cardioKcalGoal: WritableSignal<number> = signal(0);

  // Modal de registro
  isModalOpen = false;
  maxDate: string = new Date().toISOString();
  private viewEntered = false;

  registroForm: FormGroup = this.fb.group({
    fecha: [this.todayLocal(), [Validators.required]],
    peso: [null as number | null, [Validators.min(0)]],
    pasos: [null as number | null, [Validators.min(0)]]
  });

  get fecha() { return this.registroForm.get('fecha'); }
  get peso() { return this.registroForm.get('peso'); }
  get pasos() { return this.registroForm.get('pasos'); }
  weeklyStepsTotal = computed(() => {
    return this.neatService.weeklyStepsTotal();
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
    const start = this.neatService.currentWeekStart();
    const realMonday = this.getMonday(new Date());
    
    const isCurrentWeek = start.getTime() === realMonday.getTime();
    
    return isCurrentWeek ? this.cardioService.weeklyCardioKcal() : 0;
  });

  cardioProgress = computed(() => {
    const goal = this.cardioKcalGoal();
    return goal > 0 ? Math.min(Math.round((this.weeklyCardioKcalTotal() / goal) * 100), 100) : 0;
  });

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
    this.neatService.prevWeek();
    this.updateStepsChart();
  }

  nextWeek() {
    this.neatService.nextWeek();
    this.updateStepsChart();
  }

  constructor() {
    addIcons({ 
      chevronBackOutline, chevronForwardOutline, pencilOutline, 
      body, medkitOutline, analyticsOutline, scaleOutline, 
      footstepsOutline, barbellOutline, warningOutline 
    });

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
  }

  ionViewWillEnter() {
    this.loadUserData();
  }

  ionViewDidEnter() {
    this.viewEntered = true;
    this.createAllCharts();
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
        this.neatService.setInitialLogs(user.profile.neatLogs || []);
        this.cardioKcalGoal.set(user.profile.cardioKcalGoal || 0);

        if (this.viewEntered) {
          this.createAllCharts();
        }
      },
      error: (err) => {
        console.error('Error cargando usuario:', err);
      }
    });
  }

  private createAllCharts() {
    this.destroyCharts();
    this.createWeightChart();
    this.createStepsChart();
    this.createProgressChart();
  }

  // ──── GRÁFICA DE PESO ────
  createWeightChart() {
    if (!this.weightChartCanvas) return;
    const { labels, data } = this.neatService.getWeightChartData();

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
          x: { 
            display: true,
            grid: { display: false },
            ticks: {
              autoSkip: false // Mostrar todos los días ya que ahora son cortos
            }
          }
        }
      }
    });
  }

  // ──── GRÁFICA DE PASOS ────
  createStepsChart() {
    if (!this.stepsChartCanvas) return;
    const stepsData = this.neatService.weekStepsData();

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
    this.stepsChart.data.datasets[0].data = this.neatService.weekStepsData();
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
    const existing = this.neatService.neatLogs().find(l => l.date === fechaValue);
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
    const existingLog = this.neatService.neatLogs().find(l => l.date === fecha);

    if (existingLog) {
      this.neatService.updateNeatLog(this.userId, fecha, log).subscribe({
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
      this.neatService.addNeatLog(this.userId, log).subscribe({
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
