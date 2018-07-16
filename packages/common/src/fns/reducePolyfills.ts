import {Features, PolyfillFlag} from 'polyfill-service';

/** @internal */
export function reducePolyfills(features: string[], flags: PolyfillFlag[] = []): Features {
  const params = {flags};
  const out: Features = {};

  features.reduce(
    (acc: Features, feature: string): Features => {
      acc[feature] = params;

      return acc;
    },
    out
  );

  return out;
}
