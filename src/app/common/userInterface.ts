export interface UserApiResponse {
    status: number;
    message: string;
    error: string | null;
    data: User;
}

export interface User {
    _id: string
    profile: UserProfile
    auth: AuthResponse
}

export interface UserProfile {
    _id: string;
    name: string;
    avatarUrl?: string;
    height: number;
    notifications: boolean;
    macros: UserMacros;
    neatLog: UserNeat[];
    currentRoutineId?: string;
    currentDietId?: string;
    favoriteFoods?: string[];
    auth: AuthResponse;
}

// Los objetivos marcados por el entrenador
export interface UserMacros {
    targetKcal: number;
    // Distribución en porcentajes (deben sumar 100)
    pCarbs: number; // Porcentajes para calcular automaticamente en la dieta
    pProtein: number; // Porcentajes para calcular automaticamente en la dieta
    pFat: number; // Porcentajes para calcular automaticamente en la dieta
}

// Seguimiento del progreso (para tus gráficos de peso/pasos)
export interface UserNeat {
    date: string; // ISO String
    weight?: number;
    steps?: number;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;         // El JWT que te da Node.js
    user: UserProfile;    // Los datos que ya definimos (sin password)
    role: 'admin' | 'user';
}


