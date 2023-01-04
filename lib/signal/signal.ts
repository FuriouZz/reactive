import { Subscriber, Effect, SignalOptions, Signal } from "./types.js";

const EffectScopes: (() => void)[] = [];

function getCurrentContext() {
  return EffectScopes[EffectScopes.length - 1];
}

/**
 * @public
 */
export function createSignal<T>(defaultValue: T, options?: SignalOptions<T>) {
  const opts = { equals: true, ...options };
  const subscribers: Subscriber<T>[] = [];
  const box = { value: defaultValue };

  const read = () => {
    const context = getCurrentContext();
    if (context && !subscribers.includes(context)) {
      subscribers.push(context);
    }
    return box.value;
  };

  const write = (newValue: T) => {
    const oldValue = box.value;

    if (opts.equals) {
      let canSet = true;
      if (typeof opts.equals === "function") {
        canSet = opts.equals(newValue, oldValue);
      } else {
        canSet = oldValue !== newValue;
      }
      if (!canSet) return;
    }

    box.value = newValue;
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      subscriber(newValue, oldValue);
    }
  };

  return [read, write] as Signal<T>;
}

/**
 * @public
 */
export function createEffect<T>(subscriber: Effect<T | undefined>): void;

/**
 * @public
 */
export function createEffect<T>(subscriber: Effect<T>, defaultValue: T): void;

/**
 * @public
 */
export function createEffect<T>(
  subscriber: Effect<T | undefined>,
  defaultValue?: T
) {
  let lastComputedValue = defaultValue;
  const scope = () => {
    lastComputedValue = subscriber(lastComputedValue);
  };

  try {
    EffectScopes.push(scope);
    scope();
  } finally {
    EffectScopes.pop();
  }
}

/**
 * @public
 */
export function createMemo<T>(subscriber: Effect<T>) {
  const [read, write] = createSignal<T>(undefined!);

  createEffect((previousValue: T) => {
    const value = subscriber(previousValue);
    write(value);
    return value;
  }, undefined!);

  return read;
}
