import Scope from "../Scope.js";
import type { ExposedScope } from "../types.js";

export interface BatchCallback {
  (this: ExposedScope, scope: ExposedScope): void;
}

/**
 * Register updates and execute them at the end of the scope and execute side effects.
 * The context is given as parameter, so you can apply updates and sideEffects
 * inside the scope with context.apply()
 * @public
 * @param scope
 */
export default function batch(callback: BatchCallback) {
  const scope = new Scope();
  return () => Scope.run(scope, callback);
}
