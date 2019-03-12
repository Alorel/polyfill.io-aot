import {Features, PolyfillFlag} from '../PolyfillLibrary';

/** @internal */
export function reducePolyfills(features: string[], flags: PolyfillFlag[] = []): Features {
  const params = {flags};

  return features.reduce<Features>(
    (acc, feature) => {
      acc[feature] = params;

      return acc;
    },
    {}
  );
}
