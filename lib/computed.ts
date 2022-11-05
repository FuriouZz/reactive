import { triggerChange } from "./helpers";
import { internalObservable } from "./internals";
import { observable } from "./observable";
import { Computed, Ref, ToRefs } from "./types";
import { createWatcher } from "./watcher";

/**
 * Create a computed object
 * @public
 */
export function computed<T>(get: () => T): Computed<T>;
export function computed<T>(get: () => T, set: (value: T) => void): Ref<T>;
export function computed<T>(get: () => T, set?: (value: T) => void) {
  const target = { value: null! as T };

  const o = observable<{ value: T }, any>(target, {
    watchable: true,
    reference: true,
    set(_target, _key, newValue) {
      if (typeof set === "function") {
        set(newValue);
        return true;
      } else {
        throw new Error(`[reactive] This computed cannot be setted.`);
      }
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
