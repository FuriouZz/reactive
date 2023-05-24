import type Signal from "../Signal.js";
import type { SignalTuple } from "../types.js";

export function makeAtom<T>(value: Signal<T> | SignalTuple<T>) {
  const [get, set] = (() => {
    if (Array.isArray(value)) {
      return value;
    } else {
      return [value.get, value.set];
    }
  })();

  return (...args: [T] | []) => {
    if (args.length === 1) {
      set(args[0]);
    }
    return get();
  };
}
