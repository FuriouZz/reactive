import Context from "./Context.js";
import Effect from "./Effect.js";
import { SignalOptions, Subscriber } from "./types.js";

/**
 * Create a signal object with a get and a set method
 * A signal is an object with subscribers called at each changes
 * If changes are done inside a Context, there are executed after Context's scope
 * @public
 */
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

  /**
   * Get signal's value
   * If executed inside an Effect, the Effect is subscribed
   * @returns
   */
  get() {
    if (Effect.Current) {
      this.subscribers.add(Effect.Current.trigger);
    }
    return this.value;
  }

  /**
   * Set signal's value
   * If executed in Context's scope, updates are recorded and applied
   * at the end of the scope, then subscribers are triggered.
   * More info in Context class.
   * @param newValue
   * @returns
   */
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
