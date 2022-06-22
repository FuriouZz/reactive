import { internalObservable, reactiveToTarget } from "./internals";
import {
  ChangeEvent,
  Observable,
  ObservableKeyMap,
  ObservableMixin,
  WatchOptions,
} from "./types";
import { createWatcher } from "./watcher";

/**
 * Check if the object is reactive
 * @public
 */
export function isObservable<T = any>(
  obj: T
): obj is T extends Observable<infer TTarget, infer TKeyMap, infer TMixin>
  ? Observable<TTarget, TKeyMap, TMixin>
  : T {
  return reactiveToTarget.has(obj as any);
}

/**
 * Get the raw value of an reactive object
 * @public
 */
export const raw = <
  TTarget extends object = any,
  TKeyMap extends ObservableKeyMap<TTarget> = any,
  TMixin extends ObservableMixin = any
>(
  obj: Observable<TTarget, TKeyMap, TMixin>
): TTarget => {
  return internalObservable<TTarget, TKeyMap, TMixin>(obj)?.target || obj;
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
export function watch<T = void>(cb: () => T, options: WatchOptions = {}) {
  const watcher = createWatcher<T>(cb);

  if (!options.lazy) {
    watcher();
  }

  return watcher;
}
