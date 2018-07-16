//tslint:disable:max-line-length
/** @see http://ideasintosoftware.com/typescript-advanced-tricks/ */
export type Diff<T extends (string | number | symbol), U extends (string | number | symbol)> = ({[P in T]: P } & {[P in U]: never } & { [x: string]: never })[T];
