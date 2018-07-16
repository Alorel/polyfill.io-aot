export class Compression {
  public static readonly BROTLI: Compression = new Compression('js.br');
  public static readonly GZIP: Compression = new Compression('js.gz');
  public static readonly NONE: Compression = new Compression('js');
  public readonly extension: string;

  private constructor(extension: string) {
    Object.defineProperty(this, 'extension', {
      configurable: false,
      enumerable: true,
      value: extension,
      writable: false
    });
  }
}

Object.freeze(Compression);
