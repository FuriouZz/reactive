import { triggerChange } from "./helpers";
import { internalObservable } from "./internals";
import { observable } from "./observable";
import { Computed, Readonly, Ref, ToRefs } from "./types";
import { createWatcher } from "./watcher";

/**
 * Create a computed object
 * @public
 */
export function computed<T>(get: () => T): Readonly<T>;
export function computed<T, U = T>(
  get: () => T,
  set: (value: U) => void
): Computed<T, U>;
export function computed<T, U = T>(get: () => T, set?: (value: U) => void) {
  const target = { value: null! as T };

  const o = observable<{ value: T }, any>(target, {
    watchable: true,
    reference: true,
    set(target, key, newValue, oldValue, receiver) {
      if (typeof set === "function") {
        Reflect.set(target, key, newValue, receiver);
        set(newValue);
        return true;
      } else {
        throw new Error(`[reactive] This computed cannot be setted.`);
      }
    },
    mixin: {
      $invalidate() {
        watcher();
      },
    },
  });

  const internal = internalObservable(o);

  const watcher = createWatcher<T>(
    () => {
      const oldValue = target.value;
      const newValue = get();
      target.value = newValue;
      triggerChange(o, "value", { value: oldValue });
      return newValue;
    },
    ({ roots }) => {
      if (internal) {
        roots.forEach((root) => {
          if (!internal.dependencies.has(root.observable)) {
            internal.dependencies.add(root.observable);
            root.observable.change.on(() => watcher());
          }
        });
      }
    }
  );

  watcher();

  return o;
}

export const toRef = <T extends object, K extends keyof T>(
  object: T,
  key: K
) => {
  return computed<T[K]>(
    () => Reflect.get(object, key),
    (value) => Reflect.set(object, key, value)
  );
};

export const toRefs = <T extends object>(object: T) => {
  const ret: Record<any, any> = {};
  for (const key in object) {
    ret[key] = toRef(object, key);
  }
  return ret as ToRefs<T>;
};
