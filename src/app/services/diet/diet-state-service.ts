import { Injectable, inject, signal, computed } from '@angular/core';
import { DietService } from './diet-service';
import { ToastService } from '../ui/toast-service';
import { UserMacros } from '../../common/userInterface';
import { MealView, MealFoodView, Food } from '../../common/diet-interface';
import { getTodayISO, getMondayISO } from '../../common/date-utils';

@Injectable({
  providedIn: 'root',
})
export class DietStateService {
  private readonly dietService = inject(DietService);
  private readonly toastService = inject(ToastService);

  public isLoading = signal(true);
  public noDiet = signal(false);

  public macros = signal<UserMacros>({ targetKcal: 0, protein: 0, carbs: 0, fat: 0 });
  public dietExtraKcal = signal(0);

  private _meals = signal<MealView[]>([]);
  public meals = this._meals.asReadonly();

  private _extras = signal<any[]>([]);
  public extras = this._extras.asReadonly();

  private mealsCalories = signal(0);
  private extrasCalories = signal(0);

  public adjustedTarget = computed(() => this.macros().targetKcal - this.dietExtraKcal());
  public caloriesConsumed = computed(() => this.mealsCalories() + this.extrasCalories());

  public weeklyCaloriesTarget = computed(() => this.macros().targetKcal * 7);
  public weeklyCaloriesConsumed = signal(0);

  public weeklyProgress = computed(() =>
    this.weeklyCaloriesTarget() > 0 ? Math.min(this.weeklyCaloriesConsumed() / this.weeklyCaloriesTarget(), 1) : 0
  );
  public weeklyExceeded = computed(() => this.weeklyCaloriesConsumed() > this.weeklyCaloriesTarget());
  public weeklyExcessCalories = computed(() => this.weeklyCaloriesConsumed() - this.weeklyCaloriesTarget());

  public consumedMacros = computed(() => {
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

  private readonly COMPLETED_KEY = 'diet_completed';
  private readonly EXTRAS_KEY = 'diet_extras';
  private readonly WEEKLY_KEY = 'diet_weekly_kcal';

  constructor() {}

  public loadDiet() {
    this.isLoading.set(true);
    this.dietService.getMyDiet().subscribe({
      next: ({ profile, diet, foods }) => {
        this.macros.set(profile.macros || { targetKcal: 0, protein: 0, carbs: 0, fat: 0 });
        this.dietExtraKcal.set(diet.extraKcal || 0);

        const foodMap = new Map<string, Food>(foods.map(food => [food._id, food]));

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

        const completedIndices = this.loadCompletedMealsFromStorage();
        completedIndices.forEach(idx => {
          if (enrichedMeals[idx]) enrichedMeals[idx].completed = true;
        });

        this._meals.set(enrichedMeals);
        this._extras.set(this.loadExtrasFromStorage());
        this.weeklyCaloriesConsumed.set(this.loadWeeklyKcalFromStorage());

        this.recalculate();
        this.isLoading.set(false);
        this.noDiet.set(false);
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

  public toggleMealCompleted(index: number) {
    this._meals.update(current =>
      current.map((meal, idx) => idx === index ? { ...meal, completed: !meal.completed } : meal)
    );
    this.saveCompletedMealsToStorage();
    this.recalculate();
  }

  public addExtra(newExtra: any) {
    this._extras.update(current => [...current, newExtra]);
    this.saveExtrasToStorage();
    this.recalculate();
  }

  public removeExtra(index: number) {
    this._extras.update(current => current.filter((_, idx) => idx !== index));
    this.saveExtrasToStorage();
    this.recalculate();
  }

  public saveDietSummary() {
    this.saveWeeklyKcalToStorage();
    this.toastService.success('Resumen de dieta guardado correctamente');
  }

  private recalculate() {
    const mealsCal = this._meals().reduce((total, meal) => meal.completed ? total + meal.totalKcal : total, 0);
    this.mealsCalories.set(mealsCal);

    const extrasCal = this._extras().reduce((total, extra) => total + (extra.kcal || 0), 0);
    this.extrasCalories.set(extrasCal);
  }

  private getToday(): string {
    return getTodayISO();
  }

  private getWeekStart(): string {
    return getMondayISO();
  }

  private loadCompletedMealsFromStorage(): number[] {
    const raw = localStorage.getItem(this.COMPLETED_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.date === this.getToday() ? data.indices : [];
  }

  private saveCompletedMealsToStorage() {
    const indices = this._meals().map((meal, idx) => meal.completed ? idx : -1).filter(idx => idx >= 0);
    localStorage.setItem(this.COMPLETED_KEY, JSON.stringify({ date: this.getToday(), indices }));
  }

  private loadExtrasFromStorage(): any[] {
    const raw = localStorage.getItem(this.EXTRAS_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return data.date === this.getToday() ? data.items : [];
  }

  private saveExtrasToStorage() {
    localStorage.setItem(this.EXTRAS_KEY, JSON.stringify({ date: this.getToday(), items: this._extras() }));
  }

  private loadWeeklyKcalFromStorage(): number {
    const raw = localStorage.getItem(this.WEEKLY_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data.weekStart !== this.getWeekStart()) {
      localStorage.removeItem(this.WEEKLY_KEY);
      return 0;
    }
    const dailyTotals: Record<string, number> = data.dailyTotals || { [this.getToday()]: data.consumed || 0 };
    return Object.values(dailyTotals).reduce((sum, val) => sum + val, 0);
  }

  private saveWeeklyKcalToStorage() {
    let raw = localStorage.getItem(this.WEEKLY_KEY);
    let data: any = raw ? JSON.parse(raw) : { weekStart: this.getWeekStart(), dailyTotals: {} };
    if (data.weekStart !== this.getWeekStart()) data = { weekStart: this.getWeekStart(), dailyTotals: {} };
    if (!data.dailyTotals) data.dailyTotals = { [this.getToday()]: data.consumed || 0 };

    data.dailyTotals[this.getToday()] = this.caloriesConsumed();
    localStorage.setItem(this.WEEKLY_KEY, JSON.stringify(data));

    const sum = Object.values(data.dailyTotals).reduce((acc: any, val: any) => acc + val, 0);
    this.weeklyCaloriesConsumed.set(sum as number);
  }
}
