import generateID from "./generateID.js";
import type { Subscriber } from "./types.js";

/**
 * Context class defines an execution scope.
 * It register all updates and subscribers at the end of the scope,
 * except if inside the scope, context.apply() is called.
 * Mainly used by batch(), createEffect() and createMemo() to reduce side effects calls
 */
export default class Context {
  id!: number;
  #updates: Subscriber[];
  #sideEffects: Set<Subscriber>;

  constructor() {
    generateID(this);
    this.#updates = [];
    this.#sideEffects = new Set();
  }

  /**
   * Register update
   * @param updates
   */
  registerUpdate(...updates: Subscriber[]) {
    this.#updates.push(...updates);
  }

  /**
   * Register side effects registered during updates
   * @param sideEffects
   */
  registerEffect(...sideEffects: Subscriber[] | Subscriber[][]) {
    sideEffects.flat().forEach((s) => this.#sideEffects.add(s));
  }

  /**
   * Apply update and/or side effects
   * @param action
   */
  apply(action?: "update" | "sideEffects") {
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

  /**
   * Run scope with the given context
   * @param context
   * @param scope
   */
  static run(
    context: Context,
    scope: (this: Context, context: Context) => void
  ) {
    try {
      Context.push(context);
      scope.call(context, context);
    } finally {
      Context.pop();
    }

    context.apply();
  }
}
