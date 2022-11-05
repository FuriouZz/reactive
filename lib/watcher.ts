import { internalObservable } from "./internals";
import { InternalObservable } from "./types";

type Root = {
  observable: InternalObservable;
  deps: InternalObservable[];
};

let CONTEXT_IDX = -1;
const CONTEXTS: {
  listening: boolean;
  roots: Root[];
}[] = [];

function getContext(): typeof CONTEXTS[number] | undefined {
  return CONTEXTS[CONTEXT_IDX];
}

function createContext() {
  CONTEXT_IDX++;
  CONTEXTS[CONTEXT_IDX] = CONTEXTS[CONTEXT_IDX] || {
    items: [],
    roots: [],
    listening: false,
  };
  const ctx = CONTEXTS[CONTEXT_IDX];
  ctx.roots.length = 0;
  ctx.listening = true;
  return ctx;
}

function dropContext(ctx: typeof CONTEXTS[number]) {
  CONTEXT_IDX--;
  ctx.roots.length = 0;
  ctx.listening = false;
}

/**
 * @internal
 */
export function registerWatch(
  internal: InternalObservable,
  _key: string | symbol
) {
  const ctx = getContext();
  if (!ctx?.listening) return;

  let root: Root | undefined = undefined;

  for (const item of ctx.roots) {
    if (Object.is(internal.target, item.observable.target)) {
      root = item;
      break;
    }

    for (const key in item.deps) {
      const dep = item.deps[key];
      if (Object.is(internal.target, dep.target)) {
        root = item;
        break;
      }
    }
  }

  if (!root) {
    root = { observable: internal, deps: [] };
    ctx.roots.push(root);
  }

  for (const dep of internal.dependencies) {
    const idep = internalObservable(dep);
    if (idep && !root.deps.includes(idep)) {
      root.deps.push(idep);
    }
  }
}

/**
 * @internal
 */
export function getWatchKeys<T>(getter: () => T, caller?: unknown) {
  const ctx = createContext();
  const value = getter.call(caller);
  const roots = ctx.roots.slice(0);
  dropContext(ctx);
  return { value, roots };
}

/**
 * @internal
 */
export const createWatcher = <T>(
  getter: () => T,
  onResult?: (result: { value: T; roots: Root[] }) => void
) => {
  const unwatches: (() => void)[] = [];

  const watcher = () => {
    watcher.unwatch();
    const result = getWatchKeys<T>(getter);
    const { roots } = result;

    // console.log(
    //   JSON.stringify(
    //     roots.map((r) => ({
    //       target: r.observable.target,
    //       deps: r.deps.map((d) => d.target),
    //     }))
    //   )
    // );

    for (const { observable: internal } of roots) {
      unwatches.push(internal.change.once(() => watcher()));
    }

    if (onResult) onResult(result);
  };

  watcher.unwatch = () => {
    if (unwatches.length > 0) {
      unwatches.forEach((u) => u());
      unwatches.length = 0;
    }
  };

  return watcher;
};
