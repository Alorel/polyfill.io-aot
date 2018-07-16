export class Compression {
  public static readonly BROTLI: Compression = new Compression('js.br', 'br');
  public static readonly GZIP: Compression = new Compression('js.gz', 'gz');
  public static readonly NONE: Compression = new Compression('js', 'raw');
  public readonly encodingKey: 'gz' | 'br' | 'raw';
  public readonly extension: string;

  private constructor(extension: string, encodingKey: 'gz' | 'br' | 'raw') {
    Object.defineProperty(this, 'extension', {
      configurable: false,
      enumerable: true,
      value: extension,
      writable: false
    });
    Object.defineProperty(this, 'encodingKey', {
      configurable: false,
      enumerable: true,
      value: encodingKey,
      writable: false
    });
  }
}

Object.freeze(Compression);
