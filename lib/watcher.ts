import { _InternalObservable } from "./types";

let CONTEXT_IDX = -1;
const CONTEXTS: {
  items: [_InternalObservable, string | symbol][];
  listening: boolean;
}[] = [];

function getContext(): typeof CONTEXTS[number] | undefined {
  return CONTEXTS[CONTEXT_IDX];
}

function createContext() {
  CONTEXT_IDX++;
  CONTEXTS[CONTEXT_IDX] = CONTEXTS[CONTEXT_IDX] || {
    items: [],
    listening: false,
  };
  const ctx = CONTEXTS[CONTEXT_IDX];
  ctx.items.length = 0;
  ctx.listening = true;
  return ctx;
}

function dropContext(ctx: typeof CONTEXTS[number]) {
  CONTEXT_IDX--;
  ctx.items.length = 0;
  ctx.listening = false;
}

/**
 * @internal
 */
export function registerWatch(
  observable: _InternalObservable,
  key: string | symbol
) {
  const ctx = getContext();
  if (!ctx?.listening) return;
  const value = ctx.items.find(([o, k]) => o === observable && key === k);
  if (!value) ctx.items.push([observable, key]);
}

/**
 * @internal
 */
export function getWatchKeys<T>(
  cb: () => T,
  caller?: unknown
): [value: T, keys: [_InternalObservable, string | symbol][]] {
  const ctx = createContext();
  const value = cb.call(caller);
  const keys = ctx.items.slice(0);
  dropContext(ctx);
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
        p.change.on((event) => {
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
