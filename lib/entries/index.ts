import Effect from "../Effect.js";
import Signal from "../Signal.js";
import type {
  DeepPartial,
  ReactiveProxy,
  SignalOptions,
  SignalTuple,
} from "../types.js";
import Context from "../Context.js";
import RefSignal from "../RefSignal.js";
import Store from "../Store.js";

export { default as Effect } from "../Effect.js";
export { default as Signal } from "../Signal.js";
export { default as Context } from "../Context.js";
export { default as RefSignal } from "../RefSignal.js";
export { default as Store } from "../Store.js";
export type { SignalOptions, SignalTuple } from "../types.js";

/**
 * Create a signal
 * @public
 * @param value
 * @param options
 * @returns
 */
export function createSignal<T>(
  value: T,
  options?: Pick<SignalOptions<T>, "equals">
): SignalTuple<T> {
  const signal = new Signal(value, options);
  return [() => signal.get(), (value: T) => signal.set(value)];
}

/**
 * Create a signal referencing object's value
 * @public
 * @param target
 * @param key
 * @param options
 * @returns
 */
export function createRefSignal<T extends object, K extends keyof T>(
  target: T,
  key: K,
  options?: Pick<SignalOptions<T[K]>, "equals">
): SignalTuple<T[K]> {
  const signal = new RefSignal(target, key, target, options);
  return [() => signal.get(), (value: T[K]) => signal.set(value)];
}

/**
 * Create side effects executed each time its dependencies have changed
 * @public
 * @param subscriber
 * @param defaultValue
 * @returns
 */
export function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T
): () => void;
/**
 * Create side effects executed each time its dependencies have changed
 * @public
 * @param subscriber
 * @param defaultValue
 * @returns
 */
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

/**
 * Create a computed value updated each time its dependencies have changed
 * @public
 * @param subscriber
 * @returns
 */
export function createMemo<T>(subscriber: (oldValue: T | undefined) => T) {
  const [read, write] = createSignal<T>(undefined!);

  createEffect<T>((previousValue) => {
    const value = subscriber(previousValue);
    write(value);
    return value;
  });

  return read;
}

/**
 * Register updates and execute them at the end of the scope and execute side effects.
 * The context is given as parameter, so you can apply updates and sideEffects
 * inside the scope with context.apply()
 * @public
 * @param scope
 */
export function batch(scope: (this: Context, context: Context) => void) {
  const context = new Context();
  Context.run(context, scope);
}

/**
 * Create an immutable store
 * @public
 * @param target
 * @param options
 * @returns
 */
export function createStore<T extends object>(
  target: T,
  options?: SignalOptions<T[keyof T]>
) {
  const store = new Store(target, options);

  const context = new Context();
  const batchUpdate = (v: DeepPartial<T>) => {
    Context.run(context, () => {
      store.update(v);
    });
  };

  return [store.proxy, batchUpdate] as const;
}

/**
 * Create a mutable store
 * @public
 * @param target
 * @param options
 * @returns
 */
export function createMutableStore<T extends object>(
  target: T,
  options?: SignalOptions<T[keyof T]>
) {
  const store = new Store(target, { ...options, readonly: false });
  return store.proxy;
}

/**
 * Wrap the given object into a store
 * @public
 * @param target
 * @returns
 */
export function createReactive<T extends object>(
  target: T,
  options?: { deep?: boolean }
) {
  const store = new Store(target, { readonly: false, deep: options?.deep });
  const context = new Context();

  const batchUpdate = (v: DeepPartial<T>) => {
    Context.run(context, () => store.update(v));
  };

  const $store = {
    get subscribers() {
      return store.subscribers;
    },
    batchUpdate: batchUpdate,
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
