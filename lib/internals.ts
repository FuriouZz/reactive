import { InternalObservable, Observable, ObservableKeyMap } from "./types.js";

/**
 * @internal
 */
export const INTERNAL_OBSERVABLE_KEY = Symbol("internal observable key");

/**
 * @internal
 */
export const targetToReactive = new Map<any, Observable<any, any>>();

/**
 * @internal
 */
export const reactiveToTarget = new Map<Observable<any, any>, any>();

/**
 * @internal
 */
export const internalObservable = <
  T extends object,
  KeyMap extends ObservableKeyMap<T> = never
>(
  obj: Observable<T, KeyMap>
) => {
  if (reactiveToTarget.has(obj)) {
    return Reflect.get(obj, INTERNAL_OBSERVABLE_KEY) as InternalObservable<
      T,
      KeyMap
    >;
  }
  return undefined;
};
