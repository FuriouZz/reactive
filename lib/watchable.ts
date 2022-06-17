import { isObservable } from "./helpers";
import { observe } from "./observable";
import {
  ObservableOptions,
  KeyChangeEvent,
  Observable,
  WatchOptions,
} from "./types";

const items: [Observable<any>, string][] = [];
let listening = false;

function registerWatch(p: Observable<any>, key: string) {
  if (!listening) return;
  const value = items.find(([, k]) => key === k);
  if (!value) items.push([p, key]);
}

export const watchable = <T extends object>(
  target: T,
  options: ObservableOptions<T> = {}
) => {
  const o = observe(target, {
    ...options,
    get(target, key, receiver) {
      if (key === "$isWatchable") {
        return true;
      }
      registerWatch(o as any, key as string);
      return typeof options.get === "function"
        ? options.get(target, key, receiver)
        : Reflect.get(target, key);
    },
  });

  return o;
};

export function getWatchKeys<T>(
  cb: () => T,
  caller?: unknown
): [value: T, keys: [Observable<any>, string][]] {
  items.length = 0;
  listening = true;
  const value = cb.call(caller);
  listening = false;
  const keys = items.slice(0);
  items.length = 0;
  return [value, keys];
}

export const createWatcher = <T>(cb: () => T) => {
  const unwatches: (() => void)[] = [];

  const watcher = () => {
    watcher.unwatch();

    const entries = getWatchKeys<T>(cb);
    const [, keys] = entries;

    for (const [p, key] of keys) {
      unwatches.push(
        p.$change.once((event) => {
          if (event.type === "keyChange" && event.key === key) {
            watcher();
          }
        })
      );
    }

    return entries;
  };

  watcher.unwatch = () => {
    if (unwatches.length > 0) {
      unwatches.forEach((u) => u());
      unwatches.length = 0;
    }
  };

  return watcher;
};

export function watch<T = void>(cb: () => T, options: WatchOptions = {}) {
  const watcher = createWatcher<T>(cb);

  if (!options.lazy) {
    watcher();
  }

  return watcher;
}

export function onChange<T extends object>(
  obj: T,
  cb: () => void,
  caller?: unknown
) {
  if (!isObservable(obj))
    throw new Error(`Cannot watch change from non-observable.`);
  return obj.$change.on(cb, caller as object);
}

export function onKeyChange<T extends object>(
  obj: T,
  key: string | symbol | (string | symbol)[],
  cb: (event: KeyChangeEvent) => void,
  caller?: unknown
) {
  if (!isObservable(obj))
    throw new Error(`Cannot watch change from non-observable.`);

  const keys = Array.isArray(key) ? key : [key];

  return obj.$change.on((event) => {
    if (event.type === "keyChange" && keys.includes(event.key)) {
      cb.call(caller as object, event);
    }
  });
}
