import Effect from "./Effect.js";
import Signal from "./Signal.js";
import Store from "./Store.js";
import {
  DeepPartial,
  ReactiveProxy,
  SignalOptions,
  StoreOptions,
  Subscriber,
} from "./types.js";
import Context from "./Context.js";

export function createSignal<T>(
  value: T,
  options?: Pick<SignalOptions<T>, "equals">
) {
  const signal = new Signal(value, options);
  return [() => signal.get(), (value: T) => signal.set(value)] as const;
}

export function createAtom<T>(value: T) {
  const signal = new Signal(value);
  return (...args: [T] | []) => {
    if (args.length === 1) {
      signal.set(args[0]);
    }
    return signal.get();
  };
}

export function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T
): () => void;
export function createEffect<T>(
  subscriber: (oldValue: T) => T,
  defaultValue: T
): () => void;
export function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T,
  defaultValue?: T
) {
  let lastComputedValue = defaultValue;

  const effect = new Effect(() => {
    lastComputedValue = subscriber(lastComputedValue);
  });

  effect.trigger();

  return () => effect.dispose();
}

export function createMemo<T>(subscriber: (oldValue: T | undefined) => T) {
  const [read, write] = createSignal<T>(undefined!);

  createEffect<T>((previousValue) => {
    const value = subscriber(previousValue);
    write(value);
    return value;
  });

  return read;
}

export function batch(transaction: () => void) {
  new Context().run(transaction);
}

export function createStore<T extends object>(
  target: T,
  options?: StoreOptions<T>
) {
  const store = new Store(target, options);

  const context = new Context();
  const update = (v: DeepPartial<T>) => {
    context.run(() => store.update(v));
  };

  return [store.proxy, update] as const;
}

export function createReactive<T extends object>(target: T) {
  const store = new Store(target, { readonly: false });
  const context = new Context();
  const subscribers = new WeakMap<() => void, () => void>();

  const batchUpdate = (v: DeepPartial<T> | (() => void)) => {
    context.run(() => {
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
