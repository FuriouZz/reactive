import { getRootScope } from "../RootScope.js";

/**
 * Prevent effect to observe dependencies inside the callback
 * @public
 * @param callback
 * @returns
 */
export default function untrack<T>(callback: () => T): T {
  getRootScope()?.getCurrentEffect()?.untrack();
  const value = callback();
  getRootScope()?.getCurrentEffect()?.track();
  return value;
}
