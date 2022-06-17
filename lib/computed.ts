import { observe } from "./observable";
import { ObservableRef } from "./types";
import { createWatcher } from "./watchable";

export function computed<T>(get: () => T, set?: (value: T) => void) {
  const target = { value: null! as T };

  const o = observe<{ value: T }>(target, {
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

    (o as ObservableRef<T>).$change.dispatch({
      type: "keyChange",
      key: "value",
      newValue,
      oldValue,
    });
    return newValue;
  });

  watcher();

  return o;
}
