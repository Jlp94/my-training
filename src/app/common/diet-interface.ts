export interface Dieta {
  _id: string;
  userId: string;
  name: string;
  isActive: boolean;
  notes?: string;
  meals: Comida[];
  extraKcal: number;
  totalKcal: number;
  totalMacros: DietMacros;
}

export interface Comida {
  name: string;
  foods: ComidaAlimento[];
}

export interface ComidaAlimento {
  foodId: string;
  quantity: number;
}

export interface DietMacros {
  protein: number;
  carbs: number;
  fat: number;
}

export interface Food {
  _id: string;
  name: string;
  brand?: string;
  category: FoodGroup;
  nutritionalType: NutritionalType;
  carbs: number;
  protein: number;
  fat: number;
  kcal: number;
}

export interface MealFoodView {
  name: string;
  quantity: number;
  kcal: number;
  baseMacros: { carbs: number; protein: number; fat: number };
}

export interface MealView {
  name: string;
  completed: boolean;
  totalKcal: number;
  totalMacros: { carbs: number; protein: number; fat: number };
  foods: MealFoodView[];
}

export interface ShoppingItem {
  name: string;
  quantity: number;
  selected: boolean;
}

export enum FoodGroup {
  CARNES = 'carnes',
  PESCADOS = 'pescados',
  LACTEOS = 'lácteos',
  CEREALES = 'cereales',
  LEGUMBRES = 'legumbres',
  FRUTAS = 'frutas',
  VERDURAS = 'verduras',
  ACEITES = 'aceites',
  SUPLEMENTOS = 'suplementos',
  HUEVOS = 'huevos',
  FRUTOS_SECOS = 'frutos secos',
}

export enum NutritionalType {
  PROTEINA_MAGRA = 'proteína magra',
  PROTEINA_GRASA = 'proteína grasa',
  CARB_COMPLEJO = 'carbohidrato complejo',
  CARB_SIMPLE = 'carbohidrato simple',
  GRASA = 'grasa',
  VEGETAL_FIBRA = 'vegetal fibra',
}

export interface EdamamFood {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
