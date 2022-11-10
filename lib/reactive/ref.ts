import { raw } from "./helpers.js";
import { Ref } from "./types.js";
import { observable } from "./observable.js";
import { internalObservable } from "./internals.js";

/**
 * Create a boxed value
 * @public
 */
export const ref = <T>(value: T, options?: { lazy?: boolean }): Ref<T> => {
  return observable(
    { value },
    { ...options, watchable: true, type: "reference", deep: false }
  );
};

/**
 * Extract value from the box
 * @public
 */
export const unref = <T>(observable: Ref<T>): T | undefined => {
  if (isRefOrComputed(observable)) {
    const target = raw(observable);
    return target?.value;
  }
  return undefined;
};

/**
 * Is it a boxed value or computed value?
 * @public
 */
export const isRefOrComputed = <T = unknown>(obj: any): obj is Ref<T> => {
  const internal = internalObservable(obj);
  return internal?.type === "reference" || internal?.type === "computed";
};

/**
 * Is it a boxed value?
 * @public
 */
export const isRef = <T = unknown>(obj: any): obj is Ref<T> => {
  const internal = internalObservable(obj);
  return internal?.type === "reference";
};

/**
 * Is it a computed value?
 * @public
 */
export const isComputed = <T = unknown>(obj: any): obj is Ref<T> => {
  const internal = internalObservable(obj);
  return internal?.type === "computed";
};
