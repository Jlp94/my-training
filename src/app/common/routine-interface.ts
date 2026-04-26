export interface Rutina {
  _id: string;
  userIds: string[];
  name: string;
  isActive: boolean;
  sessions: SesionRutina[];
}

export interface SesionRutina {
  _id?: string;
  routineType: string;
  category: string;
  routineDayOfWeek: number;
  observations?: string;
  exercises: EjercicioRutina[];
}

export interface EjercicioRutina {
  exerciseId: string;
  name?: string;
  target?: string[];
  rest: number;
  executionType: ExecutionMode;
  observations?: string | null;
  restPauseSeconds?: number | null;
  idExSuperSet?: string | null;
  tempo: Tempo;
  sets: Set[];
}

export interface Tempo {
  eccentric: number;
  isometric: number;
  concentric: number;
}

export interface Set {
  kg: number;
  reps: number;
  rir: number;
}

export interface CardioReport {
  currentWeek?: number;
  postWeek?: number;
}

export enum DayOfWeek {
  DOMINGO = 0,
  LUNES = 1,
  MARTES = 2,
  MIERCOLES = 3,
  JUEVES = 4,
  VIERNES = 5,
  SABADO = 6,
}

export enum ExecutionMode {
  NORMAL = 'normal',
  SUPER_SET = 'superset',
  REST_PAUSE = 'restpause',
  DROP_SET = 'dropset',
}
