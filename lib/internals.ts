import { _InternalObservable, Observable, ObservableMixin } from "./types";

/**
 * @internal
 */
export const INTERNAL_OBSERVABLE_KEY = Symbol("internal observable key");

/**
 * @internal
 */
export const INTERNAL_REF_KEY = Symbol("ref.value");

/**
 * @internal
 */
export const targetToReactive = new WeakMap<any, Observable>();

/**
 * @internal
 */
export const reactiveToTarget = new WeakMap<Observable, any>();

/**
 * @internal
 */
export const internalObservable = <
  TTarget extends object,
  TMixin extends ObservableMixin = never
>(
  obj: any
) => {
  if (reactiveToTarget.has(obj)) {
    return Reflect.get(obj, INTERNAL_OBSERVABLE_KEY) as _InternalObservable<
      TTarget,
      TMixin
    >;
  }
  return undefined;
};
