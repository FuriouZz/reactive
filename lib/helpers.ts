import { computed } from "./computed";
import { internalObservable, reactiveToTarget } from "./internals";
import {
  ChangeEvent,
  Computed,
  InlineWatchSourceTuple,
  Observable,
  ObservableMixin,
  Ref,
  WatchCallback,
  WatchSource,
} from "./types";

/**
 * Check if the object is reactive
 * @public
 */
export function isObservable<T = any>(obj: T): obj is Observable<any> {
  return reactiveToTarget.has(obj as any);
}

/**
 * Get the raw value of an reactive object
 * @public
 */
export const raw = <
  TTarget extends object = object,
  TMixin extends ObservableMixin = {}
>(
  obj: Observable<TTarget, TMixin>
): TTarget | undefined => {
  const internal = internalObservable<TTarget, TMixin>(obj);
  return internal?.target as TTarget | undefined;
};

/**
 * Expose the change emitter
 * @public
 */
export const listen = (obj: any) => {
  const observable = internalObservable(obj);
  if (!observable)
    throw new Error(`[reactive] This object is not an observable`);
  return observable.change.expose;
};

/**
 * Remove every change listeners
 * @public
 */
export const clearListeners = (obj: any) => {
  listen(obj).removeListeners();
};

/**
 * Listen changes
 * @public
 */
export const onChange = (
  obj: any,
  cb: (event: ChangeEvent) => void,
  caller?: unknown
) => {
  return listen(obj).on(cb as any, caller);
};

/**
 * Listen changes from a list key
 * @public
 */
export const onKeyChange = (
  obj: any,
  key: string | symbol | (string | symbol)[],
  cb: (event: ChangeEvent) => void,
  caller?: unknown
) => {
  const keys = Array.isArray(key) ? key : [key];
  const emitter = listen(obj);

  const ret = emitter.on(cb as any, caller);
  emitter.filter(cb as any, (e) => keys.includes(e.key));

  return ret;
};

/**
 * Trigger a change
 * @public
 */
export const triggerChange = (
  obj: any,
  key?: string | symbol | (string | symbol)[],
  oldValues?: any
) => {
  const observable = internalObservable(obj);
  if (!observable)
    throw new Error(`[reactive] This object is not an observable`);

  if (key) {
    const keys = Array.isArray(key) ? key : [key];
    observable.trigger(keys, oldValues);
  } else {
    observable.trigger([], oldValues);
  }
};

/**
 * Watch changes from reactive objects present in the callback function
 * @public
 */
export function watch<T extends WatchSource[]>(
  values: [...T],
  cb: WatchCallback<T>
) {
  const unwatches: (() => void)[] = [];
  const computedValues = values.map((v) =>
    typeof v === "function" ? computed(v) : v
  ) as (Ref<unknown> | Computed<unknown>)[];

  let newValues = computedValues.map(
    (v) => v.value
  ) as InlineWatchSourceTuple<T>;

  for (const value of computedValues) {
    const unwatch = listen(value).on(() => {
      const oldValues = newValues;
      newValues = computedValues.map(
        (v) => v.value
      ) as InlineWatchSourceTuple<T>;
      cb(newValues, oldValues);
    });
    unwatches.push(unwatch);
  }

  return () => {
    if (unwatches.length === 0) return;
    for (const unwatch of unwatches) {
      unwatch();
    }
    unwatches.length = 0;
  };
}
