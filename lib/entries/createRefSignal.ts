import RefSignal from "../RefSignal.js";
import type { SignalOptions, SignalTuple } from "../types.js";

/**
 * Create a signal referencing object's value
 * @public
 * @param target
 * @param key
 * @param options
 * @returns
 */
export default function createRefSignal<T extends object, K extends keyof T>(
  target: T,
  key: K,
  options?: Pick<SignalOptions<T[K]>, "equals">
): SignalTuple<T[K]> {
  const signal = new RefSignal(target, key, target, options);
  return [() => signal.get(), (value: T[K]) => signal.set(value)];
}
