import { getRootScope, type SignalOptions } from "@furiouzz/reactive";
import Store from "../Store.js";
import type { DeepPartial } from "../types.js";

/**
 * Create an immutable store
 * @public
 * @param target
 * @param options
 * @returns
 */
export default function createStore<T extends object>(
  target: T,
  options?: SignalOptions<T[keyof T]>,
) {
  const store = new Store(target, options);

  const batchUpdate = (v: DeepPartial<T>) => {
    getRootScope()?.batch(() => {
      store.update(v);
    });
  };

  return [store.proxy, batchUpdate] as const;
}
