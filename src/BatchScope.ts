import type Effect from "./Effect.js";
import generateID from "./generateID.js";
import type { Callable } from "./types.js";

/**
 * Scope class defines an execution scope.
 * It registers updates and execute them at the end of the scope and execute side effects.
 * The scope object is given as parameter, so you can apply updates and sideEffects
 * inside the scope with scope.trigger()
 * Mainly used to reduce side effects calls
 * @public
 */
export default class BatchScope {
  id!: number;
  #updates: Callable[];
  #sideEffects: Set<Effect>;

  constructor() {
    generateID(this);
    this.#updates = [];
    this.#sideEffects = new Set();
  }

  /**
   * Register update
   * @param updates
   */
  registerUpdate = (...updates: Callable[]) => {
    this.#updates.push(...updates);
  };

  /**
   * Register side effects registered during updates
   * @param sideEffects
   */
  registerEffect = (...sideEffects: Effect[]) => {
    for (const s of sideEffects.flat()) {
      this.#sideEffects.add(s);
    }
  };

  /**
   * Apply update and/or side effects
   * @param action
   */
  trigger = (action?: "update" | "sideEffects") => {
    const applyAction = action ?? "update-sideEffects";

    // Execute updates
    if (applyAction.includes("update") && this.#updates.length > 0) {
      while (this.#updates.length > 0) {
        const update = this.#updates.shift();
        if (update) update();
      }
    }

    // Execute side effects
    if (applyAction.includes("sideEffects") && this.#sideEffects.size > 0) {
      const sideEffects = [...this.#sideEffects];
      this.#sideEffects.clear();
      for (const sideEffect of sideEffects) {
        sideEffect.trigger?.();
      }
    }
  };
}
