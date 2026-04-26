import { Component, signal, computed, inject, effect } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent, IonCard, IonCardHeader, IonCardTitle,
  IonCardContent, IonProgressBar, IonInput, IonButton, IonCheckbox,
  IonIcon, IonSelect, IonSelectOption, IonItem, IonSpinner, IonRow, IonText, IonChip, IonCol } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ToastService } from 'src/app/services/ui/toast-service';
import { CardioService } from 'src/app/services/workout/cardio-service';
import { UserService } from 'src/app/services/user/user-service';
import { Cardio } from 'src/app/common/cardio-interface';

@Component({
  selector: 'app-cardio',
  templateUrl: './cardio.page.html',
  styleUrls: ['./cardio.page.scss'],
  standalone: true,
  imports: [IonCol, IonChip, IonText, IonRow, IonSpinner, 
    IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonProgressBar, IonInput, IonButton, IonCheckbox, IonIcon,
    IonSelect, IonSelectOption, IonItem,
  ]
})
export class CardioPage {
  private readonly toastService: ToastService = inject(ToastService);
  protected readonly cardioService: CardioService = inject(CardioService);
  private readonly userService: UserService = inject(UserService);
  
  constructor() {
    addIcons({ timeOutline, flameOutline, heartOutline, speedometerOutline, saveOutline, bicycleOutline, walkOutline, trendingUpOutline });

    effect(() => {
      const cardios = this.cardiosResource.value();
      if (cardios && cardios.length > 0 && !this.selectedCardioId()) {
        this.selectedCardioId.set(cardios[0]._id);
      }
    });
  }

  private readonly cardiosResource = rxResource({
    stream: () => this.cardioService.findAll()
  });

  private readonly profileResource = rxResource({
    stream: () => this.userService.getProfile()
  });

  protected readonly cardioList = computed(() => this.cardiosResource.value() ?? []);

  protected readonly isLoading = computed(() => this.cardiosResource.isLoading() || this.profileResource.isLoading());
  
  protected readonly weeklyKcalTarget = computed(() => this.profileResource.value()?.cardioKcalGoal ?? 0);

  protected selectedCardioId = signal<string>('');
  protected duracion = signal<number | null>(null);

  configActual = computed(() =>
    this.cardioList().find((cardio: Cardio) => cardio._id === this.selectedCardioId())!
  );

  cardioIcon = computed(() => {
    const config = this.configActual();
    if (!config) return 'speedometer-outline';
    return config.type === 'cinta' ? 'walk-outline'
      : config.type === 'bici' ? 'bicycle-outline'
        : 'speedometer-outline';
  });

  progress = computed(() => {
    const target = this.weeklyKcalTarget();
    return target > 0 ? Math.min(this.cardioService.weeklyCardioKcal() / target, 1) : 0;
  });

  isCompleted = computed(() => this.cardioService.weeklyCardioKcal() >= this.weeklyKcalTarget());

  extraKcal = computed(() => {
    const diff = this.cardioService.weeklyCardioKcal() - this.weeklyKcalTarget();
    return diff > 0 ? diff : 0;
  });

  targetMinutes = computed(() => {
    const config = this.configActual();
    if (!config) return 0;
    const kcalRestantes = Math.max(this.weeklyKcalTarget() - this.cardioService.weeklyCardioKcal(), 0);
    return Math.ceil(kcalRestantes / config.kcalMin);
  });

  currentMinutes = computed(() => {
    const config = this.configActual();
    if (!config) return 0;
    return Math.round(this.cardioService.weeklyCardioKcal() / config.kcalMin);
  });

  kcalEstimadas = computed(() => {
    const min = this.duracion() || 0;
    const config = this.configActual();
    if (!config) return 0;
    return Math.round(min * config.kcalMin);
  });

  cambiarTipoCardio(event: any) {
    this.selectedCardioId.set(event.detail.value);
    this.duracion.set(null);
  }

  registrarSesion() {
    const min = this.duracion();
    if (!min || min <= 0) {
      this.toastService.error('Introduce un tiempo válido');
      return;
    }

    const kcal = Math.round(min * this.configActual().kcalMin);
    
    this.cardioService.addKcal(kcal);
    
    this.toastService.success(`${min} min de ${this.configActual().label} → ${kcal} kcal`);

    this.duracion.set(null);
  }
}
