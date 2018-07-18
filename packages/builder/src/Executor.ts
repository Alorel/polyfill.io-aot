import * as ora from 'ora';
import {LazyGetter} from 'typescript-lazy-get-decorator';
import {BuildEvent} from './interfaces/BuildEvent';
import {PolyfillBuilderConfig} from './interfaces/PolyfillBuilderConfig';
import {PolyfillBuilder} from './PolyfillBuilder';

const $builder = Symbol('builder');

//tslint:disable:no-empty

/** @internal */
export abstract class Executor {

  private readonly [$builder]: PolyfillBuilder;

  public constructor(builder: PolyfillBuilder) {
    this[$builder] = builder;
  }

  @LazyGetter()
  protected get _ora() {
    const opts: any = {
      spinner: 'dots',
      stream: process.stdout
    };

    return ora(opts);
  }

  @LazyGetter()
  protected get builder(): PolyfillBuilder {
    return this[$builder];
  }

  @LazyGetter()
  protected get conf(): PolyfillBuilderConfig {
    return this.builder.conf;
  }

  public start(): this {
    setImmediate(() => {
      this.execute();
    });

    return this;
  }

  protected emit(event: BuildEvent, ...args: any[]): this {
    setImmediate(() => {
      this.builder.emit(event, ...args);
    });

    return this;
  }

  protected abstract execute(): void;

  protected formatError(e: Error) {
    if (!e) {
      return '[unknown error]';
    }

    return e.stack || e.message || e;
  }

  protected onError(e: Error): void {
    this.emit(BuildEvent.ERROR, e);
  }
}
