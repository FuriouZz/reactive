import Context from "./Context.js";
import type { Subscriber } from "./types.js";

export default class Effect {
  trigger: Subscriber;

  #disposed: boolean;

  constructor(effect: Subscriber) {
    this.#disposed = false;
    const context = new Context();
    this.trigger = () => {
      context.run(() => {
        if (this.#disposed) return;
        try {
          Effect.push(this);
          effect();
        } finally {
          Effect.pop();
        }
      });
    };
  }

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
