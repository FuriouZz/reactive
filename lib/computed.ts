import { triggerChange } from "./helpers";
import { observable } from "./observable";
import { Computed, Ref } from "./types";
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

  const watcher = createWatcher<T>(() => {
    const oldValue = target.value;
    const newValue = get();
    target.value = newValue;
    triggerChange(o, "value", { value: oldValue });
    return newValue;
  });

  watcher();

  return o;
}
