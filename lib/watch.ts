import { isObservable } from "./observable";

export const watch = <T extends object, K extends keyof T>(
  target: T,
  callback: <Key extends keyof T>(
    key: Key,
    newValue: T[Key] | null | undefined,
    oldValue: T[Key] | null | undefined
  ) => any,
  options?: { key: K }
) => {
  if (!isObservable(target)) throw new Error(`target is not an observable`);
  const keySpecified = !!options?.key;
  return target.$keyChange.on((event) => {
    if (keySpecified) {
      if (event!.key === options.key) {
        callback(event!.key, event!.newValue, event!.oldValue);
      }
    } else {
      callback(event!.key, event!.newValue, event!.oldValue);
    }
  });
};
