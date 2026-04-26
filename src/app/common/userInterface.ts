export interface User {
    _id: string;
    email: string;
    role: 'admin' | 'user';
    isActive: boolean;
    profile: UserProfile;
}

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

export interface UserMacros {
    targetKcal: number;
    protein: number;
    carbs: number;
    fat: number;
}

export interface UserNeat {
    date: string;
    weight?: number;
    steps?: number;
}

export interface DietLog {
    startDate: string;
    macros?: UserMacros;
    notes?: string;
}

export interface ExerciseLog {
    exerciseId: string;
    name: string;
    target: string[];
    sets: { kg: number; reps: number; rir: number }[];
}

export interface WorkoutLog {
    doneAt: string;
    routineId: string;
    notes?: string;
    exerciseLogs: ExerciseLog[];
}
