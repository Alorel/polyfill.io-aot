import {createHash} from 'crypto';

/** @internal */
export function md5String(input: string): string {
  return createHash('md5')
    .update(input || '')
    .digest('hex');
}

/** @internal */
export function md5Array(input: string[], slice = true): string {
  const arr: string[] = slice ? input.slice(0) : input;

  return md5String(JSON.stringify(arr.sort()));
}

/** @internal */
export function md5Object(input: { [k: string]: any }): string {
  return md5Array(Object.keys(input), false);
}
