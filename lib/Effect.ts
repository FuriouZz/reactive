import type { Callable } from "./types.js";

/**
 * This class tracks signal access, means a get() call, and subscribe to the signal
 * @public
 */
export default class Effect {
  trigger: Callable;

  #disposed: boolean;

  constructor(effect: Callable) {
    this.#disposed = false;
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
   * Stop listening signals
   */
  dispose() {
    this.#disposed = true;
  }

  static get Current(): Effect | undefined {
    return this.effects[this.effects.length - 1];
  }

  static effects: Effect[] = [];

  static push(context: Effect) {
    this.effects.push(context);
  }

  static pop() {
    this.effects.pop();
  }
}
