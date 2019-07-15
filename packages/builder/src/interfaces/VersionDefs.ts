/** Version definition for a min-max version range */
export interface MinMax {
  max: number;

  min: number;
}

/** Version definition for a static set of versions */
export interface StaticOnly<S> {
  static: S[];
}

/** Version specs for minor version ranges */
export interface Stepped<T> {
  steps: T[];
}

/** Combines {@link MinMax} and {@link Stepped} */
export type MinMaxStepped<T> = MinMax & Stepped<T>;
/** Combines {@link MinMax} and {@link StaticOnly} */
export type MinMaxStatic<S> = MinMax & StaticOnly<S>;

/** Version range for Internet Explorer */
export interface IEDef {
  edge: MinMax;

  ie: MinMaxStatic<string>;
}
