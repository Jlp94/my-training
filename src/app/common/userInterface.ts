// Interfaz principal del usuario (sincronizada con API)
export interface User {
    _id: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    profile: UserProfile;
}

// Perfil del usuario
export interface UserProfile {
    name: string;
    lastName: string;
    year?: number;
    avatarUrl?: string;
    height?: number;
    weight?: number;
    notifications: boolean;
    macros?: UserMacros;
    neatLogs: UserNeat[];
    currentRoutineId?: string;
    currentDietId?: string;
    cardioKcalGoal?: number;
    dietLogs?: DietLog[];
    favoriteFoods?: string[];
    workoutLogs: WorkoutLog[];
}

// Los objetivos marcados por el entrenador (en gramos absolutos)
export interface UserMacros {
    targetKcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

// Seguimiento del progreso (peso/pasos)
export interface UserNeat {
    date: string;
    weight?: number;
    steps?: number;
}

// Log de dieta
export interface DietLog {
    startDate: string;
    macros?: UserMacros;
    notes?: string;
}

// Log de ejercicio dentro de un workout
export interface ExerciseLog {
    exerciseId: string;
    name: string;
    target: string[];
    sets: { kg: number; reps: number; rir: number }[];
}

// Log de entrenamiento
export interface WorkoutLog {
    doneAt: string;
    routineId: string;
    notes?: string;
    exerciseLogs: ExerciseLog[];
}
