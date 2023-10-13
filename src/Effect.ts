import type { Callable } from "./types.js";

/**
 * This class tracks signal access, means a get() call, and subscribe to the signal
 * @public
 */
export default class Effect {
  trigger: Callable;
  #disposed: boolean;
  #isTrackingDependencies: boolean;

  constructor(effect: Callable) {
    this.#disposed = false;
    this.#isTrackingDependencies = true;

    this.trigger = () => {
      if (this.#disposed) return;
      try {
        Effect.push(this);
        effect();
      } finally {
        Effect.pop();
      }
    };
  }

  /**
   * Track dependencies
   */
  track() {
    this.#isTrackingDependencies = true;
  }

  /**
   * Stop tracking dependencies
   */
  untrack() {
    this.#isTrackingDependencies = false;
  }

  /**
   * Stop listening signals
   */
  dispose() {
    this.#disposed = true;
  }

  static get Current(): Effect | undefined {
    const current = this.effects[this.effects.length - 1];
    if (current && current.#isTrackingDependencies) return current;
    return undefined;
  }

  static effects: Effect[] = [];

  static push(context: Effect) {
    this.effects.push(context);
  }

  static pop() {
    this.effects.pop();
  }
}
