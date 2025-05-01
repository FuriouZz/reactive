import Effect from "./Effect.js";
import Scope from "./Scope.js";
import { SignalOptions } from "./types.js";

/**
 * Create a signal object with a get and a set method
 * A signal is an object with subscribers called at each changes
 * If changes are done inside a Context, there are executed after Context's scope
 * @public
 */
export default class Signal<T> {
  subscribers: Set<Effect>;

  #value: T;
  #equals: boolean | ((a: T, b: T) => boolean);

  constructor(initialValue: T, options?: SignalOptions<T>) {
    this.#value = initialValue;
    this.#equals = options?.equals ?? true;
    this.subscribers = new Set();
  }

  get rawValue() {
    return this.#value;
  }

  set rawValue(v) {
    this.#value = v;
  }

  /**
   * Get signal's value
   * If executed inside an Effect, the Effect is subscribed
   * @returns
   */
  get() {
    if (Effect.Current) {
      this.subscribers.add(Effect.Current);
    }
    return this.rawValue;
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
    const oldValue = this.rawValue;

    if (typeof this.#equals === "boolean") {
      if (this.#equals && oldValue === newValue) return;
    } else {
      if (this.#equals(oldValue, newValue)) return;
    }

    const scope = Scope.Current;

    const update = () => {
      this.rawValue = newValue;
      if (this.subscribers.size === 0) return;

      const subscribers = [...this.subscribers];
      this.subscribers.clear();

      if (scope) {
        scope.registerEffect(...subscribers);
      } else {
        subscribers.forEach((effect) => effect.trigger());
      }
    };

    if (scope) {
      scope.registerUpdate(update);
    } else {
      update();
    }
  }
}
