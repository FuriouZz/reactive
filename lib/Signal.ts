import Context from "./Context.js";
import Effect from "./Effect.js";
import { SignalOptions, Subscriber } from "./types.js";

export default class Signal<T> {
  subscribers: Set<Subscriber>;

  #value: T;
  #equals: boolean | ((a: T, b: T) => boolean);

  constructor(initialValue: T, options?: SignalOptions<T>) {
    this.#value = initialValue;
    this.#equals = options?.equals ?? true;
    this.subscribers = new Set();
  }

  get value() {
    return this.#value;
  }

  set value(v) {
    this.#value = v;
  }

  get() {
    if (Effect.Current) {
      this.subscribers.add(Effect.Current.trigger);
    }
    return this.value;
  }

  set(newValue: T) {
    const oldValue = this.value;

    if (typeof this.#equals === "boolean") {
      if (this.#equals && oldValue === newValue) return;
    } else {
      if (this.#equals(oldValue, newValue)) return;
    }

    const context = Context.Current;

    const update = () => {
      this.value = newValue;
      if (this.subscribers.size === 0) return;

      const subscribers = [...this.subscribers];
      this.subscribers.clear();

      if (context) {
        context.registerEffect(subscribers);
      } else {
        subscribers.forEach((effect) => effect());
      }
    };

    if (context) {
      context.registerUpdate(update);
    } else {
      update();
    }
  }
}
