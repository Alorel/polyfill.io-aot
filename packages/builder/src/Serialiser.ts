const setKeys = ['flags', 'aliasOf'];

/** @internal */
export function replacer(key: string, value: any): any {
  if (value && setKeys.includes(key)) {
    return [].concat(...value);
  }

  return value;
}

/** @internal */
export function reviver(key: string, value: any): any {
  if (Array.isArray(value) && setKeys.includes(key)) {
    return new Set(value);
  }

  return value;
}
