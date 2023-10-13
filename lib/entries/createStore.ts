import Scope from "../Scope.js";
import Store from "../Store.js";
import type { SignalOptions, DeepPartial } from "../types.js";

/**
 * Create an immutable store
 * @public
 * @param target
 * @param options
 * @returns
 */
export default function createStore<T extends object>(
  target: T,
  options?: SignalOptions<T[keyof T]>
) {
  const store = new Store(target, options);

  const scope = new Scope();
  const batchUpdate = (v: DeepPartial<T>) => {
    Scope.run(scope, () => {
      store.update(v);
    });
  };

  return [store.proxy, batchUpdate] as const;
}
