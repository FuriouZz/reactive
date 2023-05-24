import type { Subscriber, Update } from "./types.js";

let ID = 0;

export default class Context {
  id: number;
  #updates: Update[];
  #sideEffects: Set<Subscriber>;

  constructor() {
    this.id = ++ID;
    this.#updates = [];
    this.#sideEffects = new Set();
  }

  registerUpdate(...updates: Update[]) {
    this.#updates.push(...updates);
  }

  registerEffect(...sideEffects: Subscriber[] | Subscriber[][]) {
    sideEffects.flat().forEach((s) => this.#sideEffects.add(s));
  }

  run(scope: () => void) {
    // Run scope
    try {
      Context.push(this);
      scope();
    } finally {
      Context.pop();
    }

    // Execute updates
    if (this.#updates.length > 0) {
      while (this.#updates.length > 0) {
        const update = this.#updates.shift();
        if (update) update();
      }
    }

    // Execute side effects
    if (this.#sideEffects.size > 0) {
      const sideEffects = [...this.#sideEffects];
      this.#sideEffects.clear();
      for (const sideEffect of sideEffects) {
        sideEffect();
      }
    }
  }

  static get Current(): Context | undefined {
    return this.contexts[this.contexts.length - 1];
  }

  static contexts: Context[] = [];

  static push(context: Context) {
    this.contexts.push(context);
  }

  static pop() {
    this.contexts.pop();
  }
}
