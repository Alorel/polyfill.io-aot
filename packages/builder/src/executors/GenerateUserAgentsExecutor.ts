import {Executor} from '../Executor';
import {BuildEvent} from '../interfaces/BuildEvent';
import {UAGeneratorFunction} from '../interfaces/UAGeneratorFunction';
import {USERAGENTS} from '../symbols';

/** @internal */
class GenerateUserAgentsExecutor extends Executor {

  protected execute(): void {
    this._ora.start('Generating mock user agents');
    this.emit(BuildEvent.GENERATE_UAS_ALL_BEGIN);
    try {
      const all: string[] = [];

      for (const vendor of Object.keys(this.conf.uaGenerators)) {
        this.emit(BuildEvent.GENERATE_UAS_VENDOR_BEGIN, vendor);
        try {
          const generator: UAGeneratorFunction = this.conf.uaGenerators[vendor];
          let numUnique = 0;

          for (const str of generator()) {
            if (!all.includes(str)) {
              numUnique++;
              all.push(str);
            }
          }

          this._ora.text = `Generated mock user agents for ${vendor}`;
          this.emit(BuildEvent.GENERATE_UAS_VENDOR_OK, vendor, numUnique);
        } catch (e) {
          this.emit(BuildEvent.GENERATE_UAS_VENDOR_ERR, vendor, e);
          // noinspection ExceptionCaughtLocallyJS
          throw e;
        }
      }

      this.builder[USERAGENTS] = all;
      this._ora.succeed('Generated mock user agents');
      this.emit(BuildEvent.GENERATE_UAS_ALL_OK, this.builder[USERAGENTS].length);
    } catch (e) {
      this._ora.fail(`Failed to generate mock user agents: ${this.formatError(e)}`);
      this.onError(e);
    }
  }

}

export = GenerateUserAgentsExecutor;
