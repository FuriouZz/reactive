import { _InternalObservable } from "./types";

const items: [_InternalObservable, string | symbol][] = [];
let listening = false;

/**
 * @internal
 */
export function registerWatch(p: _InternalObservable, key: string | symbol) {
  if (!listening) return;
  const value = items.find(([, k]) => key === k);
  if (!value) items.push([p, key]);
}

/**
 * @internal
 */
export function getWatchKeys<T>(
  cb: () => T,
  caller?: unknown
): [value: T, keys: [_InternalObservable, string | symbol][]] {
  items.length = 0;
  listening = true;
  const value = cb.call(caller);
  listening = false;
  const keys = items.slice(0);
  items.length = 0;
  return [value, keys];
}

/**
 * @internal
 */
export const createWatcher = <T>(cb: () => T) => {
  const unwatches: (() => void)[] = [];

  const watcher = () => {
    watcher.unwatch();

    const entries = getWatchKeys<T>(cb);
    const [, keys] = entries;

    for (const [p, key] of keys) {
      unwatches.push(
        p.change.once((event) => {
          if (event.key === key) {
            watcher();
          }
        })
      );
    }
  };

  watcher.unwatch = () => {
    if (unwatches.length > 0) {
      unwatches.forEach((u) => u());
      unwatches.length = 0;
    }
  };

  return watcher;
};
