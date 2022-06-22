import {
  _InternalObservable,
  Observable,
  ObservableMixin,
  ObservableKeyMap,
} from "./types";

/**
 * @internal
 */
export const INTERNAL_OBSERVABLE_KEY = Symbol("internal observable key");

/**
 * @internal
 */
export const targetToReactive = new Map<any, Observable>();

/**
 * @internal
 */
export const reactiveToTarget = new Map<Observable, any>();

/**
 * @internal
 */
export const internalObservable = <
  TTarget extends object,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
>(
  obj: any
) => {
  if (reactiveToTarget.has(obj)) {
    return Reflect.get(obj, INTERNAL_OBSERVABLE_KEY) as _InternalObservable<
      TTarget,
      TKeyMap,
      TMixin
    >;
  }
  return undefined;
};
