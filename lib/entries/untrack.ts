import Effect from "../Effect.js";

export default function untrack<T>(callback: () => T): T {
  Effect.Current?.untrack();
  const value = callback();
  Effect.Current?.track();
  return value;
}
