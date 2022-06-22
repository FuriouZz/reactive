import { raw } from "./helpers";
import { Ref } from "./types";
import { observable } from "./observable";

/**
 * Create a boxed value
 * @public
 */
export const ref = <T>(value: T, options?: { lazy?: boolean }): Ref<T> => {
  return observable({ value }, { ...options, watchable: true, });
};

/**
 * Extract value for a box
 * @public
 */
export const unref = <T>(observable: Ref<T>): T | undefined => {
  return raw(observable).value;
};
