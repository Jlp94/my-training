import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonProgressBar, IonInput, IonButton, IonCheckbox,
  IonIcon, IonSelect, IonSelectOption, IonItem,
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ToastService } from 'src/app/services/toast-service';
import { TipoCardio, CardioConfig } from 'src/app/common/workoutInterface';

@Component({
  selector: 'app-cardio',
  templateUrl: './cardio.page.html',
  styleUrls: ['./cardio.page.scss'],
  standalone: true,
  imports: [
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonProgressBar, IonInput, IonButton, IonCheckbox, IonIcon,
    IonSelect, IonSelectOption, IonItem,
  ]
})
export class CardioPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);

  // TODO: Esto vendrá de la API (CardioApiResponse). Mock por ahora.
  readonly cardioConfigs: CardioConfig[] = [
    {
      _id: '1',
      type: 'cinta',
      label: 'Cinta de correr',
      kcalMin: 7.84,
      instrucciones: [
        { label: 'Velocidad', valor: '4,5 km/h' },
        { label: 'Inclinación', valor: 'Máxima' },
        { label: 'Pulsaciones', valor: '120-130 bpm' }
      ]
    },
    {
      _id: '2',
      type: 'eliptica',
      label: 'Elíptica',
      kcalMin: 6.5,
      instrucciones: [
        { label: 'Resistencia', valor: 'Nivel 8' },
        { label: 'RPM', valor: '60-70' },
        { label: 'Pulsaciones', valor: '110-120 bpm' }
      ]
    },
    {
      _id: '3',
      type: 'bici',
      label: 'Bicicleta',
      kcalMin: 5.2,
      instrucciones: [
        { label: 'Nivel', valor: '6' },
        { label: 'RPM', valor: '70-80' },
        { label: 'Pulsaciones', valor: '100-115 bpm' }
      ]
    }
  ];

  // Señales — Objetivo semanal en KCAL (lo fija el entrenador)
  weeklyKcalTarget = signal(940); // kcal totales a quemar en la semana

  // Señales — Acumuladores de la semana
  currentKcal = signal(0);       // kcal quemadas hasta ahora

  // Señales — Registro (solo lo que introduce el cliente)
  tipoCardio = signal<TipoCardio>('cinta');
  duracion = signal<number | null>(null);

  // Computed — Config actual según tipo seleccionado
  configActual = computed(() =>
    this.cardioConfigs.find(c => c.type === this.tipoCardio())!
  );

  // Computed — Icono según tipo (cinta → walk, bici → bicycle, resto → speedometer)
  cardioIcon = computed(() => {
    const tipo = this.tipoCardio();
    return tipo === 'cinta' ? 'walk-outline'
      : tipo === 'bici' ? 'bicycle-outline'
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
    const kcalRestantes = Math.max(this.weeklyKcalTarget() - this.currentKcal(), 0);
    return Math.ceil(kcalRestantes / this.configActual().kcalMin);
  });

  // Computed — Minutos equivalentes realizados según el tipo actual
  currentMinutes = computed(() => {
    return Math.round(this.currentKcal() / this.configActual().kcalMin);
  });

  // Computed — Estimación kcal de la sesión que va a registrar
  kcalEstimadas = computed(() => {
    const min = this.duracion() || 0;
    return Math.round(min * this.configActual().kcalMin);
  });

  constructor() {
    addIcons({ timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline });
  }

  ngOnInit() { }

  // Cambiar tipo de cardio
  cambiarTipoCardio(event: any) {
    this.tipoCardio.set(event.detail.value);
    this.duracion.set(null);
  }

  // Registrar sesión — suma kcal y minutos al progreso semanal
  registrarSesion() {
    const min = this.duracion();
    if (!min || min <= 0) {
      this.toastService.error('Introduce un tiempo válido');
      return;
    }

    const kcal = Math.round(min * this.configActual().kcalMin);
    this.currentKcal.update(current => current + kcal);
    this.toastService.success(`${min} min de ${this.configActual().label} → ${kcal} kcal`);

    // Resetear input
    this.duracion.set(null);
  }
}
