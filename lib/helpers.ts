import { internalObservable, reactiveToTarget } from "./internals.js";
import { ChangeEvent, Observable, WatchOptions } from "./types.js";
import { createWatcher } from "./watcher.js";

/**
 * @public
 */
export const isObservable = <T extends object>(
  obj: T
): obj is Observable<T> => {
  return reactiveToTarget.has(obj as any);
};

/**
 * @public
 */
export const raw = <T extends object>(obj: Observable<T>): T => {
  return internalObservable(obj)?.target || obj;
};

/**
 * @public
 */
export const listen = <T extends object>(obj: Observable<T>) => {
  const observable = internalObservable(obj);
  if (!observable)
    throw new Error(`[reactive] This object is not an observable`);
  return observable.change.expose;
};

/**
 * @public
 */
export const clearListeners = <T extends object>(obj: Observable<T>) => {
  listen(obj).removeListeners();
};

/**
 * @public
 */
export const onChange = <T extends object>(
  obj: Observable<T>,
  cb: (event: ChangeEvent) => void,
  caller?: unknown
) => {
  return listen(obj).on(cb as any, caller);
};

/**
 * @public
 */
export const onKeyChange = <T extends object>(
  obj: Observable<T>,
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
 * @public
 */
export const triggerChange = <T extends object>(
  obj: Observable<T>,
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
 * @public
 */
export function watch<T = void>(cb: () => T, options: WatchOptions = {}) {
  const watcher = createWatcher<T>(cb);

  if (!options.lazy) {
    watcher();
  }

  return watcher;
}
