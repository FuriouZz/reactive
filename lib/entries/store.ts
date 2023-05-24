import Context from "../Context.js";
import Store from "../Store.js";
import { createEffect } from "./index.js";
import { StoreOptions, DeepPartial, ReactiveProxy } from "../types.js";

export { default as Store } from "../Store.js";

export function createStore<T extends object>(
  target: T,
  options?: StoreOptions<T>
) {
  const store = new Store(target, options);

  const context = new Context();
  const update = (v: DeepPartial<T>) => {
    Context.run(context, () => store.update(v));
  };

  return [store.proxy, update] as const;
}

export function createReactive<T extends object>(target: T) {
  const store = new Store(target, { readonly: false });
  const context = new Context();
  const subscribers = new WeakMap<() => void, () => void>();

  const batchUpdate = (v: DeepPartial<T> | (() => void)) => {
    Context.run(context, () => {
      if (typeof v === "function") {
        v();
      } else {
        store.update(v);
      }
    });
  };

  const on = (subscriber: () => void) => {
    const unsubscribe = createEffect(subscriber);
    subscribers.set(subscriber, unsubscribe);
    return unsubscribe;
  };

  const off = (subscriber: () => void) => {
    if (subscribers.has(subscriber)) {
      const unsubscribe = subscribers.get(subscriber)!;
      unsubscribe();
    }
  };

  const $store = {
    get subscribers() {
      return store.subscribers;
    },
    batchUpdate: batchUpdate,
    createEffect: on,
    disposeEffect: off,
  };

  const expose = new Map<string | symbol, any>();
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
