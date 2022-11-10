import { internalObservable } from "./internals.js";
import { observable } from "./observable.js";
import { Computed, Readonly, ToRefs, WatchDependency } from "./types.js";
import { captureDependencies } from "./watcher.js";

/**
 * @public
 */
export function computed<T>(get: () => T): Readonly<T>;

/**
 * @public
 */
export function computed<T, U = T>(
  get: () => T,
  set: (value: U) => void
): Computed<T, U>;

/**
 * Create a computed object
 * @public
 */
export function computed<T, U = T>(get: () => T, set?: (value: U) => void) {
  const target = { value: null! as T };
  let dirty = true;

  const o = observable(target, {
    watchable: true,
    type: "computed",
    get(target, key, receiver) {
      if (dirty) {
        dirty = false;
        const { value, dependencies } = captureDependencies(get);
        listen(dependencies);
        Reflect.set(target, key, value, receiver);
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, newValue, _oldValue, receiver) {
      if (typeof set === "function") {
        Reflect.set(target, key, newValue, receiver);
        set(newValue);
        return true;
      } else {
        throw new Error(`[reactive] This computed cannot be setted.`);
      }
    },
    mixin: {
      $invalidate: () => {
        if (!internal) return;
        dirty = true;
        internal.trigger("value");
      },
    },
  });

  const listen = (dependencies: WatchDependency[]) => {
    if (!internal) return;

    // Reset dependencies
    internal.dependencies.clear();

    dependencies.forEach((root) => {
      if (!internal.dependencies.has(root.observable)) {
        internal.dependencies.add(root.observable);

        unwatches.push(
          root.observable.change.on(() => {
            unwatch();
            o.$invalidate();
          })
        );
      }
    });
  };

  const internal = internalObservable(o);
  const unwatches: (() => void)[] = [];
  const unwatch = () => {
    if (unwatches.length > 0) {
      unwatches.forEach((u) => u());
      unwatches.length = 0;
    }
  };

  return o as Computed<T, U>;
}

/**
 * @public
 */
export const toRef = <T extends object, K extends keyof T>(
  object: T,
  key: K
) => {
  return computed<T[K]>(
    () => Reflect.get(object, key),
    (value) => Reflect.set(object, key, value)
  );
};

/**
 * @public
 */
export const toRefs = <T extends object>(object: T) => {
  const ret: Record<any, any> = {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret as ToRefs<T>;
};
