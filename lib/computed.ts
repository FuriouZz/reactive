import { createObservable } from "./observable";
import { getWatchKeys } from "./watchable";

export function computed<T>(options: { get(): T; set?(value: T): void }) {
  let [cached, keys] = getWatchKeys(options.get);

  for (const [p, key] of keys) {
    p.$keyChange.on((event) => {
      if (event.key === key) {
        cached = options.get();
        o.value = cached;
      }
    });
  }

  const o = createObservable({
    target: { value: cached },
    get: () => cached,
    set(_target, _key, newValue) {
      if (options.set) {
        options.set(newValue);
        return true;
      } else {
        throw new Error(`[reactive] This computed cannot be setted.`);
      }
    },
  });

  return o;
}
