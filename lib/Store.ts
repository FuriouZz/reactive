import RefSignal from "./RefSignal.js";
import Signal from "./Signal.js";
import { StoreOptions, Subscriber } from "./types.js";

/**
 * Wrap an object into a proxy and create a tree of signals
 * By default, the store is immutable and you must call store.update().
 * Signals and stores are created lazily
 * @public
 */
export default class Store<T extends object> {
  target: T;
  proxy: T;
  subscribers: Set<Subscriber>;

  #readonly: boolean;
  #equals: boolean | ((a: any, b: any) => boolean);
  #deep: boolean;
  #signals: Map<string | symbol, RefSignal<any, any>>;
  #stores: Map<string | symbol, Store<object>>;

  constructor(target: T, options?: StoreOptions<T>) {
    this.target = target;
    this.#readonly = options?.readonly ?? true;
    this.#equals = options?.equals ?? true;
    this.#deep = options?.deep ?? true;
    this.#signals = new Map();
    this.#stores = new Map();
    this.subscribers = new Set();

    this.proxy = new Proxy(this.target, {
      get: (_, key) => {
        return this.get(key);
      },
      has: (_, key) => {
        return this.has(key);
      },
      set: (_, key, newValue) => {
        if (this.#readonly) {
          throw new TypeError(`"${String(key)}" is read-only`);
        }
        this.set(key, newValue);
        return true;
      },
      deleteProperty: (_, key) => {
        if (this.#readonly) {
          throw new TypeError(`"${String(key)}" is read-only`);
        }
        this.set(key, undefined);
        return true;
      },
    });
  }

  get(key: string | symbol) {
    const signal = this.#findSignal(key)!;
    const value = signal.get();

    if (
      this.#deep &&
      typeof value === "object" &&
      value !== null &&
      !this.#stores.has(key)
    ) {
      const store = new Store(value, {
        readonly: this.#readonly,
        equals: this.#equals,
      });
      this.#stores.set(key, store);
    }

    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;
      return store.proxy;
    }

    return value;
  }

  has(key: string | symbol) {
    const exists = Reflect.has(this.target, key);
    if (exists) this.get(key);
    return exists;
  }

  set(key: string | symbol, newValue: any) {
    const signal = this.#findSignal(key)!;
    signal.set(newValue);

    if (this.#stores.has(key)) {
      const store = this.#stores.get(key)!;

      if (newValue === undefined) {
        this.#stores.delete(key);
      } else {
        store.update(newValue);
      }
    }

    if (newValue === undefined) {
      Reflect.deleteProperty(this.target, key);
    }
  }

  update(updatedState: any) {
    for (const [key, value] of Object.entries(updatedState)) {
      this.set(key, value);
    }
  }

  #subscribe(signal: Signal<any>) {
    const subscriber = () => {
      this.subscribers.forEach((effect) => effect());
      signal.subscribers.add(subscriber);
    };
    signal.subscribers.add(subscriber);
  }

  #findSignal(key: string | symbol) {
    if (!this.#signals.has(key)) {
      const signal = new RefSignal(this.target, key as keyof T, this.proxy, {
        equals: this.#equals,
      });
      this.#subscribe(signal);
      this.#signals.set(key, signal);
    }

    return this.#signals.get(key)!;
  }
}
