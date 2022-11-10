import { InternalObservable, WatchContext, WatchDependency } from "./types.js";

let CONTEXT_IDX = -1;
const CONTEXTS: WatchContext[] = [];

function getContext(): typeof CONTEXTS[number] | undefined {
  return CONTEXTS[CONTEXT_IDX];
}

function createContext() {
  CONTEXT_IDX++;
  CONTEXTS[CONTEXT_IDX] = CONTEXTS[CONTEXT_IDX] || {
    id: CONTEXT_IDX,
    dependencies: [],
    listening: false,
  };
  const ctx = CONTEXTS[CONTEXT_IDX];
  ctx.dependencies.length = 0;
  ctx.listening = true;
  return ctx;
}

function dropContext(ctx: typeof CONTEXTS[number]) {
  CONTEXT_IDX--;
  const id = ctx.id;
  const dependencies = ctx.dependencies.slice(0);
  ctx.dependencies.length = 0;
  ctx.listening = false;
  return { id, dependencies };
}

/**
 * @internal
 */
export function registerObervable(
  iobs: InternalObservable,
  _key: string | symbol
) {
  const ctx = getContext();
  if (!ctx?.listening || !iobs) return;

  let root: WatchDependency | undefined = undefined;

  for (const item of ctx.dependencies) {
    if (Object.is(iobs.target, item.observable.target)) {
      root = item;
      break;
    }

    for (const key in item.deps) {
      const dep = item.deps[key];
      if (Object.is(iobs.target, dep.target)) {
        root = item;
        break;
      }
    }
  }

  /**
   * Try to only register the highest reactive object
   * eg.: "cube.size.x" only "cube" is registered not "size", even "x" in a computed case.
   */
  if (!root) {
    root = { observable: iobs, deps: [] };
    ctx.dependencies.push(root);
  }

  for (const dep of iobs.dependencies) {
    if (!root.deps.includes(dep)) {
      root.deps.push(dep);
    }
  }
}

/**
 * @internal
 */
export function captureDependencies<T>(getter: () => T) {
  const ctx = createContext();
  const value = getter();
  return { ...dropContext(ctx), value };
}

/**
 * @internal
 */
export const createWatcher = <T>(getter: () => T) => {
  const unwatches: (() => void)[] = [];

  const watcher = () => {
    const result = captureDependencies(getter);

    // console.log(
    //   JSON.stringify(
    //     result.roots.map((r) => ({
    //       target: r.observable.target,
    //       deps: r.deps.map((d) => d.target),
    //     }))
    //   )
    // );

    for (const { observable: internal } of result.dependencies) {
      unwatches.push(
        internal.change.once(() => {
          watcher.unwatch();
          watcher();
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
