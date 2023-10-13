import Signal from "../Signal.js";
import type { SignalOptions, SignalTuple } from "../types.js";

/**
 * Create a signal
 * @public
 * @param value
 * @param options
 * @returns
 */
export default function createSignal<T>(
  value: T,
  options?: Pick<SignalOptions<T>, "equals">
): SignalTuple<T> {
  const signal = new Signal(value, options);
  return [() => signal.get(), (value: T) => signal.set(value)];
}
