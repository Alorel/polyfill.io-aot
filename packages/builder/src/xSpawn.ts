import {ChildProcess, SpawnOptions} from 'child_process';
import * as spawn from 'cross-spawn';
import merge = require('lodash/merge');

/** @internal */
export function xSpawn(cmd: string, args: string[] = [], opts: SpawnOptions = {}): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const defaultOpts: SpawnOptions = {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit'
    };
    const finalOptions: SpawnOptions = merge(defaultOpts, opts);
    let errored = false;

    const proc: ChildProcess = spawn(cmd, args, finalOptions);
    proc.once('exit', (code: number) => {
      if (!errored) {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Exited with code ${code}`));
        }
      }
    });
    proc.once('error', (e: Error) => {
      errored = true;
      reject(e);
    });
  });
}
