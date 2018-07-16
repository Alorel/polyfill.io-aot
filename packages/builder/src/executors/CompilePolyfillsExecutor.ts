import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';
import {POLYFILL_SERVICE_PKG} from '../symbols';
import {xSpawn} from '../xSpawn';

/** @internal */
class CompilePolyfillsExecutor extends Executor {

  protected execute(): void {
    this.emit(BuildEvent.COMPILE_POLYFILLS_BEGIN);
    this._ora.start('Compiling polyfills');
    xSpawn(
      this.conf.packageManager,
      ['run', 'build'],
      {
        cwd: this.builder[POLYFILL_SERVICE_PKG],
        stdio: process.env.POLYFILL_IO_AOT_STDIO || 'pipe'
      }
    ).then(
      () => {
        this._ora.succeed('Polyfills compiled!');
        this.emit(BuildEvent.COMPILE_POLYFILLS_OK);
      },
      (e: Error) => {
        this._ora.fail(`Error compiling polyfills: ${this.formatError(e)}`);
        this.emit(BuildEvent.COMPILE_POLYFILLS_ERR, e);
        setImmediate(() => {
          this.onError(e);
        });
      }
    );
  }
}

export = CompilePolyfillsExecutor;
