import { createSignal } from "./signal.js";
import { SignalOptions, Atom, Signal } from "./types.js";

export function makeAtom<T>(signal: Signal<T>) {
  const [state, setState] = signal;
  return (...args: [] | [T]): T => {
    if (args.length === 1) {
      setState(args[0]);
    }
    return state();
  };
}

export function atom<T>(value: T, options?: SignalOptions<T>): Atom<T> {
  const signal = createSignal<T>(value, options);
  return makeAtom(signal);
}
