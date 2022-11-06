import { raw } from "./helpers";
import { Ref } from "./types";
import { observable } from "./observable";
import { INTERNAL_REF_KEY } from "./internals";

/**
 * Create a boxed value
 * @public
 */
export const ref = <T>(value: T, options?: { lazy?: boolean }): Ref<T> => {
  return observable(
    { value },
    { ...options, watchable: true, reference: true, deep: false }
  );
};

/**
 * Extract value from the box
 * @public
 */
export const unref = <T>(observable: Ref<T>): T | undefined => {
  if (isRef(observable)) {
    const target = raw(observable);
    return target?.value;
  }
  return undefined;
};

/**
 * Is it a box?
 * @public
 */
export const isRef = (observable: any): boolean => {
  return Reflect.get(observable, INTERNAL_REF_KEY);
};
