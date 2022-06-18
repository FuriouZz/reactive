import { internalObservable } from "./internals.js";
import { observable } from "./observable.js";
import { createWatcher } from "./watcher.js";

/**
 * @public
 */
export function computed<T>(get: () => T, set?: (value: T) => void) {
  const target = { value: null! as T };

  const o = observable<{ value: T }, any>(target, {
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

    internalObservable(o)?.change.dispatch({
      key: "value",
      newValue,
      oldValue,
    });

    return newValue;
  });

  watcher();

  return o;
}
