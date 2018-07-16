/** A mock user agent generator function; most easily implemented as a generator */
export type UAGeneratorFunction = () => IterableIterator<string>;
