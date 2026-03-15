import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonGrid, IonRow, IonCol, IonButton, IonIcon, IonModal, IonInput, IonItem, IonLabel, IonCheckbox, IonList, IonNote, IonFooter, IonText, IonFab, IonFabButton, IonProgressBar, IonSpinner } from '@ionic/angular/standalone';
import { HeaderComponent } from "src/app/components/header/header.component";
import { LayoutComponent } from "src/app/components/layout/layout.component";
import { Chart, DoughnutController, ArcElement, Legend, Tooltip, PieController } from 'chart.js';
import { addIcons } from 'ionicons';
import { add, search, barbell, timeOutline, flame, checkmarkCircle, closeCircle, close, saveOutline, alertCircle, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { ViewChild, ElementRef } from '@angular/core';
import { ToastService } from 'src/app/services/toast-service';
import { DietService } from 'src/app/services/diet-service';
import { EdamamService } from 'src/app/services/edamam-service';
import { Alimento, MealFoodView, MealView, EdamamFood } from 'src/app/common/diet-interface';
import { UserMacros } from 'src/app/common/userInterface';

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

  macrosChart: any;

  // Estado principal con signals
  noDiet = signal(false);
  isLoading = signal(true);

  // Macros objetivo del usuario (viene del perfil)
  macros = signal<UserMacros>({ targetKcal: 0, protein: 0, carbs: 0, fat: 0 });

  // Calorías de comidas y extras del usuario (signals)
  mealsCalories = signal(0);
  extrasCalories = signal(0);

  // extraKcal fijo de la dieta (viene de la API)
  dietExtraKcal = signal(0);

  // Derivados con computed
  adjustedTarget = computed(() => this.macros().targetKcal - this.dietExtraKcal());
  caloriesConsumed = computed(() => this.mealsCalories() + this.extrasCalories());

  // Progreso semanal
  weeklyCaloriesTarget = computed(() => this.macros().targetKcal * 7);
  weeklyCaloriesConsumed = signal(0);

  weeklyProgress = computed(() =>
    this.weeklyCaloriesTarget() > 0 ? Math.min(this.weeklyCaloriesConsumed() / this.weeklyCaloriesTarget(), 1) : 0
  );
  weeklyExceeded = computed(() => this.weeklyCaloriesConsumed() > this.weeklyCaloriesTarget());
  weeklyExcessCalories = computed(() => this.weeklyCaloriesConsumed() - this.weeklyCaloriesTarget());

  // Macros consumidos (derivado)
  consumedMacros = computed(() => {
    let protein = 0, carbs = 0, fat = 0;
    this.meals().forEach(meal => {
      if (meal.completed && meal.totalMacros) {
        protein += meal.totalMacros.protein;
        carbs += meal.totalMacros.carbs;
        fat += meal.totalMacros.fat;
      }
    });
    this.extras().forEach(extra => {
      protein += (extra.protein || 0);
      carbs += (extra.carbs || 0);
      fat += (extra.fat || 0);
    });
    return { protein, carbs, fat };
  });

  // Comidas y extras (signals)
  meals = signal<MealView[]>([]);
  extras = signal<any[]>([]);

  // ---------- Helpers localStorage ----------
  private readonly COMPLETED_KEY = 'diet_completed';
  private readonly EXTRAS_KEY = 'diet_extras';
  private readonly WEEKLY_KEY = 'diet_weekly_kcal';

  private getToday(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Obtiene el lunes de la semana actual (YYYY-MM-DD)
  private getWeekStart(): string {
    const d = new Date();
    const day = d.getDay();
    const diff = day === 0 ? 6 : day - 1; // lunes = 0
    d.setDate(d.getDate() - diff);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private loadCompletedMeals(): number[] {
    const raw = localStorage.getItem(this.COMPLETED_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.date === this.getToday() ? data.indices : [];
  }

  private saveCompletedMeals() {
    const indices = this.meals().map((meal, idx) => meal.completed ? idx : -1).filter(idx => idx >= 0);
    localStorage.setItem(this.COMPLETED_KEY, JSON.stringify({ date: this.getToday(), indices }));
  }

  private loadExtras(): any[] {
    const raw = localStorage.getItem(this.EXTRAS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.date === this.getToday() ? data.items : [];
  }

  private saveExtras() {
    localStorage.setItem(this.EXTRAS_KEY, JSON.stringify({ date: this.getToday(), items: this.extras() }));
  }

  private loadWeeklyKcal(): number {
    const raw = localStorage.getItem(this.WEEKLY_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    // Verificar si la semana cambió (nuevo lunes)
    if (data.weekStart !== this.getWeekStart()) {
      localStorage.removeItem(this.WEEKLY_KEY);
      return 0;
    }
    // Si viene del formato antiguo, migrar los datos a dailyTotals
    if (!data.dailyTotals) {
      data.dailyTotals = { [this.getToday()]: data.consumed || 0 };
    }
    // Sumamos los totales de todos los días registrados en esa semana
    const dailyTotals: Record<string, number> = data.dailyTotals || {};
    return Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
  }

  private saveWeeklyKcal() {
    let raw = localStorage.getItem(this.WEEKLY_KEY);
    let data: any = raw ? JSON.parse(raw) : { weekStart: this.getWeekStart(), dailyTotals: {} };

    // Si cambió la semana, resetear
    if (data.weekStart !== this.getWeekStart()) {
      data = { weekStart: this.getWeekStart(), dailyTotals: {} };
    }

    // Si viene del formato antiguo (no cambió semana pero no tiene dailyTotals)
    if (!data.dailyTotals) {
      data.dailyTotals = { [this.getToday()]: data.consumed || 0 };
    }

    // Actualizar el valor del día actual dentro de la semana
    data.dailyTotals[this.getToday()] = this.caloriesConsumed();
    
    localStorage.setItem(this.WEEKLY_KEY, JSON.stringify(data));
    
    // Y actualizar el signal
    const sum = Object.values(data.dailyTotals).reduce((acc: any, val: any) => acc + val, 0);
    this.weeklyCaloriesConsumed.set(sum as number);
  }

  // Datos del Modal de Extras
  isModalOpen = false;
  extraName: string = '';
  extraAmount: number | null = null;
  extraKcal: number | null = null;
  extraProtein: number | null = null;
  extraCarbs: number | null = null;
  extraFat: number | null = null;

  // Rate limiting búsqueda Edamam
  private searchTimestamps: number[] = []; // últimas búsquedas (ms)
  private readonly LIMIT_PER_MIN = 10;
  private readonly LIMIT_PER_DAY = 40;
  private readonly STORAGE_KEY = 'edamam_daily_count';

  // Búsqueda Edamam
  searchResults: EdamamFood[] = [];
  searching = false;

  constructor() {
    addIcons({ flame, alertCircle, closeOutline, checkmarkOutline, checkmarkCircle, close, search, saveOutline, timeOutline, add, barbell });
  }

  ngOnInit() {
    this.loadDiet();
  }

  ngAfterViewInit() {
    // El chart se crea después de cargar los datos (ver loadDiet)
  }

  loadDiet() {
    this.dietService.getMyDiet().subscribe({
      next: ({ profile, diet, foods }) => {
        // Macros objetivo del perfil
        const profileMacros = profile.macros || { targetKcal: 0, protein: 0, carbs: 0, fat: 0 };
        this.macros.set(profileMacros);
        this.dietExtraKcal.set(diet.extraKcal || 0);

        // Mapa foodId → alimento completo
        const foodMap = new Map<string, Alimento>(foods.map(food => [food._id, food]));

        // Enriquecer cada comida
        const enrichedMeals = diet.meals.map(meal => {
          const enrichedFoods: MealFoodView[] = meal.foods.map(mf => {
            const food = foodMap.get(mf.foodId);
            const factor = mf.quantity / 100;

            return {
              name: food?.name || 'Alimento desconocido',
              quantity: mf.quantity,
              kcal: Math.round((food?.kcal || 0) * factor),
              baseMacros: {
                carbs: food?.carbs || 0,
                protein: food?.protein || 0,
                fat: food?.fat || 0
              }
            };
          });

          const totalKcal = enrichedFoods.reduce((sum, foodItem) => sum + foodItem.kcal, 0);
          const totalMacros = enrichedFoods.reduce((acc, foodItem) => {
            const factor = foodItem.quantity / 100;
            return {
              carbs: acc.carbs + Math.round(foodItem.baseMacros.carbs * factor),
              protein: acc.protein + Math.round(foodItem.baseMacros.protein * factor),
              fat: acc.fat + Math.round(foodItem.baseMacros.fat * factor)
            };
          }, { carbs: 0, protein: 0, fat: 0 });

          return { name: meal.name, completed: false, totalKcal, totalMacros, foods: enrichedFoods };
        });

        // Restaurar estado de localStorage
        const completedIndices = this.loadCompletedMeals();
        completedIndices.forEach(idx => {
          if (enrichedMeals[idx]) enrichedMeals[idx].completed = true;
        });

        this.meals.set(enrichedMeals);
        this.extras.set(this.loadExtras());
        this.weeklyCaloriesConsumed.set(this.loadWeeklyKcal());

        // Recalcular mealsCalories y extrasCalories
        this.recalculate();

        this.isLoading.set(false);
        this.noDiet.set(false);

        // Crear chart después de que Angular renderice el canvas
        setTimeout(() => {
          this.createMacrosChart();
          this.updateChartData();
        }, 100);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.message === 'NO_DIET') {
          this.noDiet.set(true);
        } else {
          this.toastService.error('Error cargando la dieta');
        }
      }
    });
  }

  // Recalcula las señales de kcal de comidas y extras
  recalculate() {
    const mealsCal = this.meals().reduce((total, meal) => {
      return meal.completed ? total + meal.totalKcal : total;
    }, 0);
    this.mealsCalories.set(mealsCal);

    const extrasCal = this.extras().reduce((total, extra) => {
      return total + (extra.kcal || 0);
    }, 0);
    this.extrasCalories.set(extrasCal);
  }

  updateChartData() {
    if (!this.macrosChart) return;

    const totalKcal = this.caloriesConsumed();
    const target = this.adjustedTarget();
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

  setOpen(isOpen: boolean) {
    this.isModalOpen = isOpen;
    if (!isOpen) {
      this.searchResults = [];
      this.searching = false;
    }
  }

  // Comprobar rate limits antes de buscar
  private checkRateLimit(): { ok: boolean; message?: string } {
    const now = Date.now();

    // Limpiar timestamps de hace más de 1 minuto
    this.searchTimestamps = this.searchTimestamps.filter(timestamp => now - timestamp < 60000);

    // Límite por minuto
    if (this.searchTimestamps.length >= this.LIMIT_PER_MIN) {
      return { ok: false, message: 'Demasiadas búsquedas seguidas. Espera un momento.' };
    }

    // Límite por día (localStorage)
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

  // Buscar alimentos en Edamam
  searchFood() {
    if (!this.extraName || this.extraName.length < 2) return;

    const { ok, message } = this.checkRateLimit();
    if (!ok) {
      this.toastService.error(message!);
      return;
    }

    this.searchTimestamps.push(Date.now());
    this.incrementDailyCount();

    this.searching = true;
    this.edamamService.searchFood(this.extraName).subscribe({
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

  // Seleccionar alimento de los resultados
  selectFood(food: EdamamFood) {
    this.extraName = food.name;
    this.extraKcal = food.kcal;
    this.extraProtein = food.protein;
    this.extraCarbs = food.carbs;
    this.extraFat = food.fat;
    this.searchResults = [];
  }

  addExtra() {
    if (!this.extraName || this.extraAmount === null || this.extraKcal === null || this.extraProtein === null || this.extraCarbs === null || this.extraFat === null) {
      this.toastService.error('Todos los campos son obligatorios');
      return;
    }

    if (this.extraAmount < 0 || this.extraKcal < 0 || this.extraProtein < 0 || this.extraCarbs < 0 || this.extraFat < 0) {
      this.toastService.error('Los valores no pueden ser negativos');
      return;
    }

    const newExtra = {
      name: this.extraName,
      amount: Number(this.extraAmount) + ' g',
      kcal: Number(this.extraKcal),
      protein: Number(this.extraProtein),
      carbs: Number(this.extraCarbs),
      fat: Number(this.extraFat)
    };

    this.extras.update(current => [...current, newExtra]);
    this.saveExtras();
    this.recalculate();
    this.updateChartData();

    this.setOpen(false);

    this.extraName = '';
    this.extraAmount = null;
    this.extraKcal = null;
    this.extraProtein = null;
    this.extraCarbs = null;
    this.extraFat = null;

    this.toastService.success('Extra añadido correctamente');
  }

  removeExtra(index: number) {
    this.extras.update(current => current.filter((_, idx) => idx !== index));
    this.saveExtras();
    this.recalculate();
    this.updateChartData();
  }

  // Toggle completar comida y persistir
  toggleMealCompleted(index: number) {
    this.meals.update(current =>
      current.map((meal, idx) => idx === index ? { ...meal, completed: !meal.completed } : meal)
    );
    this.saveCompletedMeals();
    this.recalculate();
    this.updateChartData();
  }

  // Guardar resumen de dieta (acumula kcal semanales guardando por día)
  saveDiet() {
    this.saveWeeklyKcal();
    this.toastService.success('Resumen de dieta guardado correctamente');
  }

}
