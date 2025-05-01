import { type Signal, type SignalTuple, untrack } from "@furiouzz/reactive";

/**
 * Create a single function as getter/setter
 * @public
 * @param value
 * @returns
 */
export default function makeAtom<T>(value: Signal<T> | SignalTuple<T>) {
  const [get, set] = (() => {
    if (Array.isArray(value)) {
      return value;
    }
    return [value.get, value.set];
  })();

  return (...args: [T] | []) => {
    if (args.length === 1) {
      set(args[0]);
      return untrack(get);
    }
    return get();
  };
}
