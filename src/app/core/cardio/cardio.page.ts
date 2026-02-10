import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonProgressBar,
  IonInput,
  IonButton,
  IonCheckbox
} from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { addIcons } from 'ionicons';
import { timeOutline, flameOutline } from 'ionicons/icons';
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { ToastService } from 'src/app/services/toast-service';

@Component({
  selector: 'app-cardio',
  templateUrl: './cardio.page.html',
  styleUrls: ['./cardio.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonCard,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonCardContent,
    IonProgressBar,
    IonInput,
    IonButton,
    IonCheckbox,
    LayoutComponent
  ]
})
export class CardioPage implements OnInit {
  private readonly toastService: ToastService = inject(ToastService);

  readonly kcalPerMinute = 7.84;

  targetMinutes = signal(120);
  currentMinutes = signal(0);
  enteredMinutes = signal<number | null>(null);

  // Computeds (Cálculos derivados)
  targetKcal = computed(() => Math.round(this.targetMinutes() * this.kcalPerMinute));
  currentKcal = computed(() => this.currentMinutes() * this.kcalPerMinute);

  progress = computed(() => {
    const target = this.targetMinutes();
    return target > 0 ? Math.min(this.currentMinutes() / target, 1) : 0; // Cap at 1 for progress bar
  });

  isCompleted = computed(() => this.currentMinutes() >= this.targetMinutes());

  extraMinutes = computed(() => {
    const current = this.currentMinutes();
    const target = this.targetMinutes();
    return current > target ? current - target : 0;
  });

  constructor() {
    addIcons({ timeOutline, flameOutline });
  }

  ngOnInit() {
  }

  registerMinutes() {
    const minutes = this.enteredMinutes();
    if (minutes && minutes > 0) {
      this.currentMinutes.update(current => current + minutes);
      this.enteredMinutes.set(null);

      this.toastService.cargarToast('Minutos registrados correctamente', 1000, 'success');
    }
  }

}
