import type { Accessor, AccessorArray, OnReturn } from "../types.js";
import untrack from "./untrack.js";

/**
 * Give dependencies to observe
 * @public
 * @param dependencies
 * @param callback
 * @returns
 */
export default function on<T, S>(
  dependencies: Accessor<T> | AccessorArray<T>,
  callback: (oldValue: S) => S,
): OnReturn<S>;
/**
 * Give dependencies to observe
 * @public
 * @param dependencies
 * @param callback
 * @returns
 */
export default function on<T, S>(
  dependencies: Accessor<T> | AccessorArray<T>,
  callback: (oldValue: S | undefined) => S,
): OnReturn<S> {
  const deps = Array.isArray(dependencies) ? dependencies : [dependencies];
  return (oldValue: S | undefined) => {
    for (const dep of deps) dep();
    return untrack(() => callback(oldValue));
  };
}
