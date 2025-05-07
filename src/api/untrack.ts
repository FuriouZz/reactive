import { getRootScope } from "../RootScope.js";

/**
 * Prevent effect to observe dependencies inside the callback
 * @public
 * @param callback
 * @returns
 */
export default function untrack<T>(callback: () => T): T {
  const effect = getRootScope()?.getCurrentEffect();
  effect?.untrack();
  const value = callback();
  effect?.track();
  return value;
}
