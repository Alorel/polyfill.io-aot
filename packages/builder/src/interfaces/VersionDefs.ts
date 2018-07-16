export interface MinMax {
  max: number;
  min: number;
}

export interface StaticOnly<S> {
  static: S[];
}

export interface Stepped<T> {
  steps: T[];
}

export type MinMaxStepped<T> = MinMax & Stepped<T>;
export type MinMaxStatic<S> = MinMax & StaticOnly<S>;

export interface IEDef {
  edge: MinMax;
  ie: MinMaxStatic<string>;
}
