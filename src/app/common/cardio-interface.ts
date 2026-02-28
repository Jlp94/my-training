// Configuración de cardio definida por el entrenador
export interface Cardio {
  _id: string;
  type: string;
  label: string;
  kcalMin: number;
  instrucciones: CardioInstruction[];
}

// Instrucción dentro de una configuración de cardio
export interface CardioInstruction {
  label: string;
  valor: string;
}
