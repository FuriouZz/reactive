import { getRootScope } from "../RootScope.js";
import type { ExposedScope } from "../types.js";

export type BatchCallback<T> = (this: ExposedScope, scope: ExposedScope) => T;

/**
 * Register updates and execute them at the end of the scope and execute side effects.
 * The context is given as parameter, so you can apply updates and sideEffects
 * inside the scope with context.apply()
 * @public
 * @param scope
 */
export default function batch<T>(callback: BatchCallback<T>) {
  return getRootScope()?.batch<T>(callback);
}
