import { Injectable, inject, signal, WritableSignal } from '@angular/core';
import { DietService } from './diet-service';
import { ShoppingItem } from '../../common/diet-interface';

@Injectable({
  providedIn: 'root',
})
export class ShoppingListService {
  private readonly dietService: DietService = inject(DietService);

  private readonly STORAGE_KEY = 'shopping_list_checked_items';

  private foodList: WritableSignal<ShoppingItem[]> = signal<ShoppingItem[]>([]);
  shoppingList = this.foodList.asReadonly();
  isLoaded = signal(false);

  loadShoppingList() {
    this.foodList.set([]);

    this.dietService.getMyDiet().subscribe({
      next: ({ diet, foods }) => {
        const foodMap = new Map(foods.map(food => [food._id, food.name]));
        const list = new Map<string, number>();

        diet.meals.forEach(meal => {
          meal.foods.forEach(mealFood => {
            const name = foodMap.get(mealFood.foodId) || 'Alimento desconocido';
            list.set(name, (list.get(name) || 0) + mealFood.quantity);
          });
        });

        this.foodList.set(
          Array.from(list.entries())
            .map(([name, quantity]) => ({
              name,
              quantity,
              selected: this.isItemChecked(name)
            }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
        this.isLoaded.set(true);
      },
      error: (err) => {
        if (err.message === 'NO_DIET') {
          console.log('El usuario no tiene dieta asignada');
        } else {
          console.error('Error cargando lista de la compra:', err);
        }
        this.foodList.set([]);
        this.isLoaded.set(true);
      }
    });
  }

  private isItemChecked(name: string): boolean {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (!saved) return false;
    const checkedNames: string[] = JSON.parse(saved);
    return checkedNames.includes(name);
  }

  saveChecks() {
    const checkedNames = this.shoppingList()
      .filter(item => item.selected)
      .map(item => item.name);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(checkedNames));
  }

  toggleItem(item: ShoppingItem) {
    item.selected = !item.selected;
    this.saveChecks();
  }

  toggleSelectAll(select: boolean) {
    this.shoppingList().forEach(item => item.selected = select);
    this.saveChecks();
  }
}
