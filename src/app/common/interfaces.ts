// Enums de tipos de equipamiento
export enum EquipmentType {
    LIBRE = 'libre',
    MANCUERNAS = 'mancuernas',
    BARRA = 'barra',
    POLEA = 'polea',
    MAQUINA = 'maquina',
    MULTIPOWER = 'multipower',
    KETTLEBELL = 'kettlebell',
    DISCO = 'disco'
}

// Enums de grupos musculares
export enum MuscleGroup {
    CORE = 'core',
    PECTORAL = 'pectoral',
    ESPALDA = 'espalda',
    HOMBRO = 'hombro',
    CUADRICEPS = 'cuadriceps',
    FEMORAL = 'femoral',
    GLUTEO = 'gluteo',
    BICEPS = 'biceps',
    TRICEPS = 'triceps',
    GEMELO = 'gemelo'
}

// Enum de modos de ejecución de ejercicio
export enum ExecutionMode {
    NORMAL = 'normal',
    SUPER_SET = 'superset',
    REST_PAUSE = 'restpause',
    DROP_SET = 'dropset'
}

// Interfaz de ejercicio en la biblioteca
export interface Ejercicio {
    _id: string;
    name: string;
    categories: MuscleGroup[];
    equipment: EquipmentType;
    description: string;
    tags: string[];
    videoUrl: string;
}
export enum FoodGroup {
    CARNES = 'carnes',
    PESCADOS = 'pescados',
    LACTEOS = 'lacteos',
    CEREALES = 'cereales',
    LEGUMBRES = 'legumbres',
    FRUTAS = 'frutas',
    VERDURAS = 'verduras',
    ACEITES = 'aceites',
    SUPLEMENTOS = 'suplementos'
}