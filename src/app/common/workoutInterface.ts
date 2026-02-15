

// GET Ejercicios
export interface ExerciseListApiResponse { // respuesta api de los ejercicios
    status: number;
    message: string;
    error: string | null;
    data: Ejercicio[];
}

export interface WorkoutApiResponse { // respuesta api de la rutina
    status: number;
    message: string;
    error: string | null;
    data: MicroCiclo;
}

export interface MicroCiclo {
    _id: string;
    userId: string;
    cardio: CardioReport;
    sessions: RoutineSession[];
    workoutReport: SessionHistory[];
}

// Interfaz de ejercicio en la biblioteca
export interface Ejercicio {
    _id: string;
    name: string;
    movementTypes: MovementType[];
    categories: MuscleGroup[];
    equipment: EquipmentType;
    description: string;
    tags: string[];
    videoUrl: string;
}
//---------------------------

export interface RoutineSession { // lo que tengo para mostrar en my-routine
    _id: string;
    routineType: string;       // Ej: 'FullBody'
    category: string;          // Ej: '1'
    routineDayOfWeek: string;  // Ej: 'X' (Lunes, Miércoles...)
    observations: string;      // Instrucciones generales del entrenador
    exercises: EjercicioRutina[]; // Tu array detallado de ejercicios
}

// Interfaz de ejercicio dentro de una rutina
export interface EjercicioRutina {
    exerciseId: string;
    name: string;
    target: string;
    rest: number;
    executionType: ExecutionMode;
    observations?: string;
    restPauseSeconds?: number | null;
    idExSuperSet?: string | null;
    tempo: Tempo;
    sets: Serie[]; // recoger con 0,0,0 mandar con datos EjercicioReporte
}



// Interfaz de tempo de ejecución
export interface Tempo {
    eccentric: number;
    isometric: number;
    concentric: number;
}

// Interfaz de serie
export interface Serie {
    kg: number;
    reps: number;
    rir: number;
}


// Tipos de cardio disponibles
export type TipoCardio = 'cinta' | 'eliptica' | 'bici';

// Configuración definida por el entrenador para cada tipo de cardio
export interface CardioApiResponse {
    status: number;
    message: string;
    error: string | null;
    data: CardioConfig[]; // Array de configuraciones
}

export interface CardioConfig {
    _id: string;
    type: TipoCardio;
    label: string;
    kcalMin: number;      // Tu valor directo (7.84, 6.5, etc.)
    instrucciones: CardioInstruction[];
}

export interface CardioInstruction {
    label: string;
    valor: string;
}

export interface CardioReport {
    userId: string;
    currentWeek?: number; // kcal
    postWeek?: number; // kcal
}

//---------------------------

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
    GEMELO = 'gemelo',
    ANTEBRAZO = 'antebrazo'
}

// Enum de modos de ejecución de ejercicio
export enum ExecutionMode {
    NORMAL = 'normal',
    SUPER_SET = 'superset',
    REST_PAUSE = 'restpause',
    DROP_SET = 'dropset'
}

// Enum de tipos de movimiento
export enum MovementType {
    PUSH = 'push',
    PULL = 'pull',
    LEG = 'leg',
}


// La respuesta para el panel del Admin (Sin cambios aquí, es tu estándar)
//GET ADMIN
export interface AdminHistoryApiResponse {
    status: number;
    message: string;
    error: string | null;
    data: SessionHistory[];
}

// Lo que el Admin recibe para montar su tabla histórica
// POST Ejercicios
export interface SessionHistory {
    // _id: string; esto en GET admin viene en post no se usa
    userId: string;
    microCicloId: string;
    routineId: string;    // Referencia a la "plantilla" original RoutineSession _id
    date: string;         // Fecha real de finalización
    exercises: ReportSession;
    cardio: string;
}


export type EjercicioReporte = Omit<EjercicioRutina, 'rest' | 'executionType' | 'observations' | 'restPauseSeconds' | 'idExSuperSet' | 'tempo'>;

export type ReportSession = Omit<RoutineSession, '_id' | 'observations' | 'exercises'> & { exercises: EjercicioReporte[] }; 