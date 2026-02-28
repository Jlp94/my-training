// Interfaz de ejercicio (sincronizada con API)
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

// Respuesta de la API para ejercicios
export interface ExerciseListApiResponse {
  status: number;
  message: string;
  error: string | null;
  data: Ejercicio[];
}

export interface ExerciseApiResponse {
  status: number;
  message: string;
  error: string | null;
  data: Ejercicio;
}

// Enums de tipos de equipamiento (sincronizado con API)
export enum EquipmentType {
  LIBRE = 'libre',
  MANCUERNAS = 'mancuernas',
  BARRA = 'barra',
  POLEA = 'polea',
  MAQUINA = 'máquina',
  MULTIPOWER = 'multipower',
  KETTLEBELL = 'kettlebell',
  DISCO = 'disco'
}

// Enums de grupos musculares (sincronizado con API)
export enum MuscleGroup {
  CORE = 'core',
  PECTORAL = 'pectoral',
  ESPALDA = 'espalda',
  HOMBRO = 'hombro',
  CUADRICEPS = 'cuádriceps',
  FEMORAL = 'femoral',
  GLUTEO = 'glúteo',
  BICEPS = 'bíceps',
  TRICEPS = 'tríceps',
  GEMELO = 'gemelo',
  ANTEBRAZO = 'antebrazo'
}

// Enum de tipos de movimiento
export enum MovementType {
  PUSH = 'push',
  PULL = 'pull',
  LEG = 'leg',
}
