import { SignalOptions } from "@furiouzz/reactive";
import Store from "../Store.js";

/**
 * Create a mutable store
 * @public
 * @param target
 * @param options
 * @returns
 */
export default function createMutableStore<T extends object>(
  target: T,
  options?: SignalOptions<T[keyof T]>,
) {
  const store = new Store(target, { ...options, readonly: false });
  return store.proxy;
}
