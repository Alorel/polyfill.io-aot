import * as Bluebird from 'bluebird';
import noop = require('lodash/noop');
import * as wp from 'workerpool';
import {Executor} from './Executor';

/** @internal */
export abstract class PoolExecutor extends Executor {
  protected _pool: wp.WorkerPool;

  protected _initPool(path: string) {
    this._terminate().catch(noop);
    this._pool = wp.pool(path, {
      maxWorkers: this.conf.processes,
      minWorkers: this.conf.processes
    });
  }

  protected _terminate() {
    if (this._pool) {
      return this._wrap(this._pool.terminate()).then(noop);
    }

    return Bluebird.resolve();
  }

  /**
   * The worker pool promises are a tad buggy
   * @param input Worker pool promise
   * @returns Bluebird-wrapped promise
   */
  protected _wrap<T>(input: wp.Promise<T>): Bluebird<T> {
    return new Bluebird<T>((resolve, reject) => {
      input.then(resolve).catch(reject);
    });
  }
}
