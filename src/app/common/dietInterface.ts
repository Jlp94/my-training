export interface DietApiResponse {
    status: number;
    message: string;
    error: string | null;
    data: UserDiet;
}

export interface UserDiet {
    userId: string;
    postWeek?: number;
    currentWeek?: number;
    todayDiet: DailyDiet;
}

export interface DailyDiet {
    _id?: string;
    userId: string;       // El vínculo con el usuario
    date: string;         // Fecha en formato ISO (YYYY-MM-DD)
    meals: Meal[];        // El array de comidas que ya definiste
    extraKcal: number;    // Para esas "comidas libres" o extras manuales
    totalDayKcal: number;
    totalDayMacros: {
        protein: number;
        carbs: number;
        fat: number;
    };
}

export interface Meal {
    name: string;
    completed: boolean;
    foods: MealFood[]; // Array dinámico de alimentos
}

export interface MealFood { // la comida para saber que cantidad comemos de ese alimento
    quantity: number; // gramos
    food: Food;
}

export interface Food { // una alimento
    _id?: string;
    name: string;
    brand?: string;
    category: FoodGroup;
    nutritionalType: NutritionalType;
    carbs: number;
    protein: number;
    fat: number;
    kcal: number;
}



export interface ShoppingItem {
    name: string;
    quantity: number; // gramos base (1 día)
    selected: boolean;
}







// Enum de grupos de alimentos
// Enum de grupos de alimentos (Botánico/Comercial)
export enum FoodGroup {
    CARNES = 'carnes',
    PESCADOS = 'pescados',
    LACTEOS = 'lacteos',
    CEREALES = 'cereales',
    LEGUMBRES = 'legumbres',
    FRUTAS = 'frutas',
    VERDURAS = 'verduras',
    ACEITES = 'aceites',
    SUPLEMENTOS = 'suplementos',
    HUEVOS = 'huevos', // Añadido para mayor precisión
    FRUTOS_SECOS = 'frutos_secos' // Añadido
}

// Enum de clasificación nutricional (Lógica del Entrenador)
export enum NutritionalType {
    PROTEINA_MAGRA = 'proteina_magra', // Pechuga
    PROTEINA_GRASA = 'proteina_grasa', // Ej: Salmón, Cordero
    CARB_COMPLEJO = 'carbohidrato_complejo', // Con fibra
    CARB_SIMPLE = 'carbohidrato_simple',    // Blancos / Rápidos
    GRASA = 'grasa',
    VEGETAL_FIBRA = 'vegetal_fibra'
}
