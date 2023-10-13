import Effect from "../Effect.js";

/**
 * Prevent effect to observe dependencies inside the callback
 * @public
 * @param callback
 * @returns
 */
export default function untrack<T>(callback: () => T): T {
  Effect.Current?.untrack();
  const value = callback();
  Effect.Current?.track();
  return value;
}
