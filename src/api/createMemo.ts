import createEffect from "./createEffect.js";
import createSignal from "./createSignal.js";

/**
 * Create a computed value updated each time its dependencies have changed
 * @public
 * @param callback
 * @returns
 */
export default function createMemo<T>(
  callback: (oldValue: T | undefined) => T
) {
  const [read, write] = createSignal<T>(undefined!);

  createEffect<T>((previousValue) => {
    const value = callback(previousValue);
    write(value);
    return value;
  });

  return read;
}
