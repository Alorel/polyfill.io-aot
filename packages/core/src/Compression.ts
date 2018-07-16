/** Compression type representation */
export class Compression {
  /** Brotli compression */
  public static readonly BROTLI: Compression = new Compression('js.br', 'br');
  /** Gzip compression */
  public static readonly GZIP: Compression = new Compression('js.gz', 'gz');
  /** No compression */
  public static readonly NONE: Compression = new Compression('js', 'raw');
  /** Encoding key used in the manifest */
  public readonly encodingKey: 'gz' | 'br' | 'raw';
  /** File extension */
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
