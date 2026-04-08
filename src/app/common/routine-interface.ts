// Interfaces de rutinas (sincronizadas con API routines.schema.ts)

// Rutina principal (MicroCiclo)
export interface Rutina {
  _id: string;
  userIds: string[];
  name: string;
  isActive: boolean;
  sessions: SesionRutina[];
}

// Sesión de entrenamiento (día)
export interface SesionRutina {
  _id?: string;
  routineType: string;         // Ej: 'FullBody', 'Torso', 'Pierna'
  category: string;            // Ej: '1', '2'
  routineDayOfWeek: number;    // 0=Domingo, 1=Lunes... (DayOfWeek)
  observations?: string;
  exercises: EjercicioRutina[];
}

// Ejercicio dentro de una rutina
export interface EjercicioRutina {
  exerciseId: string;
  name?: string;              // Nombre enriquecido desde el populate
  target?: string[];          // Grupos musculares enriquecidos
  rest: number;
  executionType: ExecutionMode;
  observations?: string | null;
  restPauseSeconds?: number | null;
  idExSuperSet?: string | null;
  tempo: Tempo;
  sets: Set[];
}

// Tempo de ejecución
export interface Tempo {
  eccentric: number;
  isometric: number;
  concentric: number;
}

// Serie
export interface Set {
  kg: number;
  reps: number;
  rir: number;
}

// Reporte de cardio semanal
export interface CardioReport {
  currentWeek?: number;
  postWeek?: number;
}

// Enum de días de la semana (sincronizado con API)
export enum DayOfWeek {
  DOMINGO = 0,
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6,
}

// Enum de modos de ejecución (sincronizado con API)
export enum ExecutionMode {
  NORMAL = 'normal',
  SUPER_SET = 'superset',
  REST_PAUSE = 'restpause',
  DROP_SET = 'dropset',
}
