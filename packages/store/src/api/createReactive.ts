import { getRootScope } from "@furiouzz/reactive";
import Store from "../Store.js";
import type { DeepPartial, ReactiveProxy } from "../types.js";

/**
 * Wrap the given object into a store
 * @public
 * @param target
 * @returns
 */
export default function createReactive<T extends object>(
  target: T,
  options?: { deep?: boolean },
) {
  const store = new Store(target, { readonly: false, deep: options?.deep });

  const batchUpdate = (v: DeepPartial<T>) => {
    getRootScope()?.batch(() => store.update(v));
  };

  const $store = {
    batchUpdate: batchUpdate,
  };

  const expose = new Map<string | symbol, unknown>();
  expose.set("$store", $store);

  const proxy = new Proxy(store.proxy, {
    get(target, key, receiver) {
      if (expose.has(key)) {
        if (Reflect.has(target, key)) {
          throw new Error(`Conflict with key "${String(key)}"`);
        }
        return expose.get(key);
      }
      return Reflect.get(target, key, receiver);
    },
    has(target, key) {
      if (expose.has(key)) {
        if (Reflect.has(target, key)) {
          throw new Error(`Conflict with key "${String(key)}"`);
        }
        return true;
      }
      return Reflect.has(target, key);
    },
  }) as ReactiveProxy<T>;

  return proxy;
}
