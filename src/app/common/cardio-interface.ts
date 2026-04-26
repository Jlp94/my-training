export interface Cardio {
  _id: string;
  type: string;
  label: string;
  kcalMin: number;
  instrucciones: CardioInstruction[];
}

export interface CardioInstruction {
  label: string;
  valor: string;
}
