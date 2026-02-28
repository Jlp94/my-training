// Interfaces de dietas (sincronizadas con API diets.schema.ts)

// Dieta principal
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

// Comida (Desayuno, Almuerzo, etc.)
export interface Comida {
  name: string;
  foods: ComidaAlimento[];
}

// Alimento dentro de una comida (solo referencia + cantidad)
export interface ComidaAlimento {
  foodId: string;
  quantity: number; // gramos
}

// Macros totales de la dieta
export interface DietMacros {
  protein: number;
  carbs: number;
  fat: number;
}

// Alimento de la BBDD (viene de /foods)
export interface Alimento {
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

// Alimento enriquecido para la vista (con nombre, kcal y macros calculados)
export interface MealFoodView {
  name: string;
  quantity: number;
  kcal: number;
  baseMacros: { carbs: number; protein: number; fat: number };
}

// Comida enriquecida para la vista
export interface MealView {
  name: string;
  completed: boolean;
  totalKcal: number;
  totalMacros: { carbs: number; protein: number; fat: number };
  foods: MealFoodView[];
}

// Item de la lista de la compra (calculado en el frontend)
export interface ShoppingItem {
  name: string;
  quantity: number; // gramos base (1 día)
  selected: boolean;
}

// Enum de grupos de alimentos (sincronizado con API)
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

// Enum de clasificación nutricional (sincronizado con API)
export enum NutritionalType {
  PROTEINA_MAGRA = 'proteína magra',
  PROTEINA_GRASA = 'proteína grasa',
  CARB_COMPLEJO = 'carbohidrato complejo',
  CARB_SIMPLE = 'carbohidrato simple',
  GRASA = 'grasa',
  VEGETAL_FIBRA = 'vegetal fibra',
}

// Resultado simplificado del buscador Edamam
export interface EdamamFood {
  name: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
