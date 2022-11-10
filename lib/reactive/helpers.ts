import { computed, toRef } from "./computed.js";
import { $Target, internalObservable } from "./internals.js";
import { isComputed, isRefOrComputed } from "./ref.js";
import {
  ChangeEvent,
  Computed,
  InlineWatchSource,
  InlineWatchSourceTuple,
  MapTuple,
  Observable,
  ObservableMixin,
  Ref,
  WatchCallback,
  WatchOptions,
  WatchSource,
} from "./types.js";
import { createWatcher } from "./watcher.js";

/**
 * Check if the object is reactive
 * @public
 */
export function isObservable<T>(obj: T): obj is Observable<any> {
  return typeof obj === "object" && obj !== null && Reflect.has(obj, $Target);
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
export const getChangeEmitter = (obj: any) => {
  const observable = internalObservable(obj);
  if (!observable)
    throw new Error(`[reactive] This object is not an observable`);
  return observable.change;
};

/**
 * Remove every change listeners
 * @public
 */
export const clearListeners = (obj: any) => {
  getChangeEmitter(obj).removeListeners();
};

/**
 * Trigger a change
 * @public
 */
export const triggerChange = <
  TTarget extends object,
  TMixin extends object,
  K extends keyof TTarget
>(
  o: Observable<TTarget, TMixin>,
  key: keyof TTarget | "$target" = "$target",
  newValue?: TTarget[K],
  oldValue?: TTarget[K]
) => {
  const internal = internalObservable<TTarget, TMixin>(o);
  if (!internal) throw new Error(`[reactive] This object is not an observable`);
  internal.trigger(key, newValue, oldValue);
};

/**
 * Watch reactive object
 * @public
 */
export function watch<T extends Observable>(
  obj: T,
  cb: (observable: InlineWatchSource<T>, event: ChangeEvent) => void,
  options?: WatchOptions & { filter?: (keyof T)[] }
) {
  const callback = (event: ChangeEvent) => {
    if (options?.filter && !options.filter.includes(event.key as any)) return;
    let value = obj as InlineWatchSource<T>;
    if (isRefOrComputed(obj)) value = obj.value as InlineWatchSource<T>;
    cb.call(options?.caller, value, event);
  };

  const isImmediate = isComputed(obj) || options?.immediate;

  if (isImmediate) {
    callback({ key: "$target", newValue: obj });
  }

  return getChangeEmitter(obj).on(callback);
}

/**
 * Automatically watch reactive objects
 * @public
 */
export function watchEffect(cb: () => void) {
  const w = createWatcher(cb);
  w();
  return w.unwatch;
}

/**
 * Watch keys of a reactive object
 * @public
 */
export const watchKeys = <T extends Observable, TKeys extends (keyof T)[]>(
  obj: T,
  keys: [...TKeys],
  cb: (
    newValues: MapTuple<T, [...TKeys]>,
    oldValues: MapTuple<T, [...TKeys]>
  ) => void,
  options?: WatchOptions
) => {
  const watchables = keys.map((key) => {
    const value = obj[key];
    if (isRefOrComputed(value)) return value;
    return toRef(obj, key);
  });

  return watchSources(watchables, cb as any, options);
};

/**
 * Watch changes from reactive objects present in the callback function
 * @public
 */
export function watchSources<T extends WatchSource[]>(
  values: [...T],
  cb: WatchCallback<T>,
  options?: WatchOptions
) {
  const unwatches: (() => void)[] = [];
  const computedValues = values.map((v) =>
    typeof v === "function" ? computed(v) : v
  ) as (Ref<unknown> | Computed<unknown>)[];

  let newValues = computedValues.map(
    (v) => v.value
  ) as InlineWatchSourceTuple<T>;

  for (const value of computedValues) {
    const unwatch = getChangeEmitter(value).on(() => {
      const oldValues = newValues;
      newValues = computedValues.map(
        (v) => v.value
      ) as InlineWatchSourceTuple<T>;

      const hasDiff = newValues.some(
        (_, i) => !Object.is(newValues[i], oldValues[i])
      );

      if (hasDiff) cb(newValues, oldValues);
    });
    unwatches.push(unwatch);
  }

  if (options?.immediate) {
    cb(newValues, [] as any);
  }

  return () => {
    if (unwatches.length === 0) return;
    for (let i = 0; i < unwatches.length; i++) {
      const unwatch = unwatches[i];
      unwatch();
    }
    unwatches.length = 0;
  };
}
