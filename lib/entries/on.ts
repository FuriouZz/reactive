import untrack from "./untrack.js";

export interface OnReturn<T> {
  (oldValue: T | undefined): T;
}

export default function on<T>(
  dependencies: (() => any) | (() => any)[],
  callback: (oldValue: T) => T
): OnReturn<T>;
export default function on<T>(
  dependencies: (() => any) | (() => any)[],
  callback: (oldValue: T | undefined) => T
): OnReturn<T> {
  const deps = Array.isArray(dependencies) ? dependencies : [dependencies];
  return (oldValue: T | undefined) => {
    deps.forEach((dep) => dep());
    return untrack(() => callback(oldValue));
  };
}
