import { raw } from "./helpers.js";
import { Ref } from "./types.js";
import { observable } from "./observable.js";

/**
 * @public
 */
export const ref = <T>(value: T, options?: { lazy?: boolean }): Ref<T> => {
  return observable({ value }, { ...options, watchable: true, });
};

/**
 * @public
 */
export const unref = <T>(observable: Ref<T>): T | undefined => {
  return raw(observable).value;
};
