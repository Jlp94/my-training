import { Component, OnInit, signal, computed, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonProgressBar, IonInput, IonButton, IonCheckbox,
  IonIcon, IonSelect, IonSelectOption, IonItem, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ToastService } from 'src/app/services/toast-service';
import { CardioService } from 'src/app/services/cardio-service';
import { UserService } from 'src/app/services/user-service';
import { Cardio } from 'src/app/common/cardio-interface';

@Component({
  selector: 'app-cardio',
  templateUrl: './cardio.page.html',
  styleUrls: ['./cardio.page.scss'],
  standalone: true,
  imports: [IonSpinner, 
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonProgressBar, IonInput, IonButton, IonCheckbox, IonIcon,
    IonSelect, IonSelectOption, IonItem,
  ]
})
export class CardioPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);
  private readonly cardioService: CardioService = inject(CardioService);
  private readonly userService: UserService = inject(UserService);
  
  constructor() {
    addIcons({ timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline });
  }

  private readonly STORAGE_KEY = 'cardio_weekly_kcal';

  cardioList: WritableSignal<Cardio[]> = signal<Cardio[]>([]);
  weeklyKcalTarget = signal(0);

  // Señales — Acumuladores de la semana
  currentKcal = signal(0);

  // Señales — Registro (solo lo que introduce el cliente)
  selectedCardioId = signal<string>('');
  duracion = signal<number | null>(null);

  // Computed — Config actual según ID seleccionado
  configActual = computed(() =>
    this.cardioList().find(cardio => cardio._id === this.selectedCardioId())!
  );

  // Computed — Icono según tipo (cinta → walk, bici → bicycle, resto → speedometer)
  cardioIcon = computed(() => {
    const config = this.configActual();
    if (!config) return 'speedometer-outline';
    return config.type === 'cinta' ? 'walk-outline'
      : config.type === 'bici' ? 'bicycle-outline'
        : 'speedometer-outline';
  });

  // Computed — Progreso basado en KCAL
  progress = computed(() => {
    const target = this.weeklyKcalTarget();
    return target > 0 ? Math.min(this.currentKcal() / target, 1) : 0;
  });

  isCompleted = computed(() => this.currentKcal() >= this.weeklyKcalTarget());

  extraKcal = computed(() => {
    const diff = this.currentKcal() - this.weeklyKcalTarget();
    return diff > 0 ? diff : 0;
  });

  // Computed — Minutos objetivo estimados según el tipo de cardio actual
  targetMinutes = computed(() => {
    const config = this.configActual();
    if (!config) return 0;
    const kcalRestantes = Math.max(this.weeklyKcalTarget() - this.currentKcal(), 0);
    return Math.ceil(kcalRestantes / config.kcalMin);
  });

  // Computed — Minutos equivalentes realizados según el tipo actual
  currentMinutes = computed(() => {
    const config = this.configActual();
    if (!config) return 0;
    return Math.round(this.currentKcal() / config.kcalMin);
  });

  // Computed — Estimación kcal de la sesión que va a registrar
  kcalEstimadas = computed(() => {
    const min = this.duracion() || 0;
    const config = this.configActual();
    if (!config) return 0;
    return Math.round(min * config.kcalMin);
  });


  // Carga las configuraciones de cardio y el objetivo del usuario
  ngOnInit() {
    // Cargar kcal de localStorage (con control de semana)
    this.loadWeeklyKcal();

    // Cargar cardios de la API
    this.cardioService.findAll().subscribe({
      next: (cardios) => {
        this.cardioList.set(cardios);
        if (cardios.length > 0) {
          this.selectedCardioId.set(cardios[0]._id);
        }
      },
      error: (err) => {
        console.error('Error cargando cardio:', err);
      }
    });

    // Cargar objetivo semanal de kcal del perfil del usuario
    this.userService.getProfile().subscribe({
      next: (profile) => {
        const goal = profile.cardioKcalGoal || 0;
        this.weeklyKcalTarget.set(goal);
      },
      error: (err) => {
        console.error('Error cargando perfil:', err);
      }
    });
  }

  // Cambiar tipo de cardio
  cambiarTipoCardio(event: any) {
    this.selectedCardioId.set(event.detail.value);
    this.duracion.set(null);
  }

  // Registrar sesión — suma kcal y guarda en localStorage
  registrarSesion() {
    const min = this.duracion();
    if (!min || min <= 0) {
      this.toastService.error('Introduce un tiempo válido');
      return;
    }

    const kcal = Math.round(min * this.configActual().kcalMin);
    this.currentKcal.update(current => current + kcal);
    this.saveWeeklyKcal();
    this.toastService.success(`${min} min de ${this.configActual().label} → ${kcal} kcal`);

    // Resetear input
    this.duracion.set(null);
  }

  // Nº de semana del año (lunes = inicio de semana)
  private getWeekNumber(): number {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil((diff / 86400000 + start.getDay()) / 7);
  }

  // Carga kcal del localStorage si es la misma semana, si no resetea
  private loadWeeklyKcal() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.week === this.getWeekNumber()) {
        this.currentKcal.set(data.kcal || 0);
      } else {
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  // Guarda kcal actual + semana en localStorage
  private saveWeeklyKcal() {
    const data = { week: this.getWeekNumber(), kcal: this.currentKcal() };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }
}
