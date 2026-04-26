import { Component, inject, OnInit, signal, computed, linkedSignal, effect, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote, IonFooter, IonText, IonFab, IonFabButton, IonProgressBar, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame, checkmarkCircle, closeCircle, close, saveOutline, alertCircle, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { ToastService } from 'src/app/services/ui/toast-service';
import { DietService } from 'src/app/services/diet/diet-service';
import { EdamamService } from 'src/app/services/diet/edamam-service';
import { UserMacros } from 'src/app/common/userInterface';
import { DietStateService } from 'src/app/services/diet/diet-state-service';
import { EdamamFood, Food } from 'src/app/common/diet-interface';

Chart.register(DoughnutController, PieController, ArcElement, Legend, Tooltip);

@Component({
  selector: 'app-my-diet',
  templateUrl: './my-diet.page.html',
  styleUrls: ['./my-diet.page.scss'],
  standalone: true,
  imports: [IonText, IonFooter, IonNote, IonContent, CommonModule, FormsModule, HeaderComponent, LayoutComponent,
    IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonList, IonCheckbox, IonFab, IonFabButton, IonProgressBar, IonSpinner]
})
export class MyDietPage implements OnInit {
  @ViewChild('macrosChart') macrosChartCanvas!: ElementRef;

  private readonly toastService: ToastService = inject(ToastService);
  private readonly dietService: DietService = inject(DietService);
  private readonly edamamService: EdamamService = inject(EdamamService);
  public readonly dietStateService: DietStateService = inject(DietStateService);

  macrosChart: any;

  isModalOpen = false;
  extraName = signal('');
  extraAmount = signal<number | null>(null);

  private baseMacros = signal({ kcal: 0, protein: 0, carbs: 0, fat: 0 });

  extraKcal = linkedSignal({
    source: () => ({ amount: this.extraAmount(), base: this.baseMacros().kcal }),
    computation: (src) => src.amount ? Math.round((src.base * src.amount) / 100) : null
  });

  extraProtein = linkedSignal({
    source: () => ({ amount: this.extraAmount(), base: this.baseMacros().protein }),
    computation: (src) => src.amount ? Number(((src.base * src.amount) / 100).toFixed(1)) : null
  });

  extraCarbs = linkedSignal({
    source: () => ({ amount: this.extraAmount(), base: this.baseMacros().carbs }),
    computation: (src) => src.amount ? Number(((src.base * src.amount) / 100).toFixed(1)) : null
  });

  extraFat = linkedSignal({
    source: () => ({ amount: this.extraAmount(), base: this.baseMacros().fat }),
    computation: (src) => src.amount ? Number(((src.base * src.amount) / 100).toFixed(1)) : null
  });

  searchResults: EdamamFood[] = [];
  searching = false;
  private searchTimestamps: number[] = [];
  private readonly LIMIT_PER_MIN = 10;
  private readonly LIMIT_PER_DAY = 40;
  private readonly STORAGE_KEY = 'edamam_daily_count';

  constructor() {
    addIcons({ flame, alertCircle, closeOutline, checkmarkOutline, checkmarkCircle, close, search, saveOutline, timeOutline, add, barbell });
    
    effect(() => {
      this.dietStateService.caloriesConsumed();
      this.dietStateService.adjustedTarget();
      this.updateChartData();
    });
  }

  ngOnInit() {
    this.dietStateService.loadDiet();
  }

  updateChartData() {
    if (!this.macrosChart) return;

    const totalKcal = this.dietStateService.caloriesConsumed();
    const target = this.dietStateService.adjustedTarget();
    const consumed = Math.min(totalKcal, target);
    const remaining = Math.max(0, target - totalKcal);
    const exceeded = totalKcal > target;

    this.macrosChart.data.datasets[0].data = [consumed, remaining];
    this.macrosChart.data.datasets[0].backgroundColor = [
      exceeded ? '#eb445a' : '#2dd36f',
      '#f4f5f8'
    ];

    this.macrosChart.update();
  }

  createMacrosChart() {
    if (this.macrosChartCanvas) {
      this.macrosChart = new Chart(this.macrosChartCanvas.nativeElement, {
        type: 'doughnut',
        data: {
          labels: ['Consumidas', 'Restantes'],
          datasets: [{
            data: [0, 100],
            backgroundColor: ['#2dd36f', '#f4f5f8'],
            borderWidth: 0,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            tooltip: { enabled: false }
          },
          animation: {
            animateRotate: true
          }
        }
      });
    }
  }

  private checkRateLimit(): { ok: boolean; message?: string } {
    const now = Date.now();

    this.searchTimestamps = this.searchTimestamps.filter(timestamp => now - timestamp < 60000);

    if (this.searchTimestamps.length >= this.LIMIT_PER_MIN) {
      return { ok: false, message: 'Demasiadas búsquedas seguidas. Espera un momento.' };
    }

    const stored = localStorage.getItem(this.STORAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    let dailyCount = 0;
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) {
        dailyCount = parsed.count;
      }
    }

    if (dailyCount >= this.LIMIT_PER_DAY) {
      return { ok: false, message: 'Has alcanzado el máximo de búsquedas de hoy (40). Vuelve mañana.' };
    }

    return { ok: true };
  }

  private incrementDailyCount() {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(this.STORAGE_KEY);
    let count = 1;
    if (stored) {
      const parsed = JSON.parse(stored);
      count = parsed.date === today ? parsed.count + 1 : 1;
    }
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ date: today, count }));
  }

  searchFood() {
    const query = this.extraName();
    if (!query || query.length < 2) return;

    const { ok, message } = this.checkRateLimit();
    if (!ok) {
      this.toastService.error(message!);
      return;
    }

    this.searchTimestamps.push(Date.now());
    this.incrementDailyCount();

    this.searching = true;
    this.edamamService.searchFood(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.searching = false;
      },
      error: () => {
        this.searchResults = [];
        this.searching = false;
        this.toastService.error('Error buscando alimentos');
      }
    });
  }

  selectFood(food: EdamamFood) {
    this.extraName.set(food.name);
    this.extraAmount.set(100);
    this.baseMacros.set({
      kcal: food.kcal,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat
    });
    this.searchResults = [];
  }

  addExtra() {
    const name = this.extraName();
    const amount = this.extraAmount();
    const kcal = this.extraKcal();
    const protein = this.extraProtein();
    const carbs = this.extraCarbs();
    const fat = this.extraFat();

    if (!name || amount === null || kcal === null || protein === null || carbs === null || fat === null) {
      this.toastService.error('Todos los campos son obligatorios');
      return;
    }

    const newExtra = {
      name: name,
      amount: Number(amount) + ' g',
      kcal: Number(kcal),
      protein: Number(protein),
      carbs: Number(carbs),
      fat: Number(fat)
    };

    this.dietStateService.addExtra(newExtra);
    this.setOpen(false);
    this.toastService.success('Extra añadido correctamente');
  }

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.searchResults = [];
      this.searching = false;
      this.extraName.set('');
      this.extraAmount.set(null);
      this.baseMacros.set({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
    }
  }

  removeExtra(index: number) {
    this.dietStateService.removeExtra(index);
  }

  toggleMealCompleted(index: number) {
    this.dietStateService.toggleMealCompleted(index);
  }

  saveDiet() {
    this.dietStateService.saveDietSummary();
  }

  ngOnDestroy() {
  }
}
