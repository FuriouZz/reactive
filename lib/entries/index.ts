import Effect from "../Effect.js";
import Signal from "../Signal.js";
import type { SignalOptions, SignalTuple } from "../types.js";
import Context from "../Context.js";
import RefSignal from "../RefSignal.js";

export { default as Effect } from "../Effect.js";
export { default as Signal } from "../Signal.js";
export { default as Context } from "../Context.js";
export { default as RefSignal } from "../RefSignal.js";
export type { SignalOptions, SignalTuple } from "../types.js";

export function createSignal<T>(
  value: T,
  options?: Pick<SignalOptions<T>, "equals">
): SignalTuple<T> {
  const signal = new Signal(value, options);
  return [() => signal.get(), (value: T) => signal.set(value)];
}

export function createRefSignal<T extends object, K extends keyof T>(
  target: T,
  key: K,
  options?: Pick<SignalOptions<T[K]>, "equals">
): SignalTuple<T[K]> {
  const signal = new RefSignal(target, key, target, options);
  return [() => signal.get(), (value: T[K]) => signal.set(value)];
}

export function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T
): () => void;
export function createEffect<T>(
  subscriber: (oldValue: T) => T,
  defaultValue: T
): () => void;
export function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T,
  defaultValue?: T
) {
  let lastComputedValue = defaultValue;

  const effect = new Effect(() => {
    lastComputedValue = subscriber(lastComputedValue);
  });

  effect.trigger();

  return () => effect.dispose();
}

export function createMemo<T>(subscriber: (oldValue: T | undefined) => T) {
  const [read, write] = createSignal<T>(undefined!);

  createEffect<T>((previousValue) => {
    const value = subscriber(previousValue);
    write(value);
    return value;
  });

  return read;
}

export function batch(scope: () => void) {
  const context = new Context();
  Context.run(context, scope);
}
