
export enum CalculationMode {
  SP1 = 'SP1!',
  NQ1 = 'NQ1!'
}

export interface CalculationResult {
  mode: CalculationMode;
  point: number;
  result: number;
  timestamp: Date;
}
