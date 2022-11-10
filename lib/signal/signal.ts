import { Subscriber, Effect } from "./types.js";

const Subscribers: Subscriber[] = [];

function getCurrentContext() {
  return Subscribers[Subscribers.length - 1];
}

/**
 * @public
 */
export function createSignal<T>(defaultValue: T) {
  const subscribers: Subscriber[] = [];
  const box = { value: defaultValue };

  const read = () => {
    const context = getCurrentContext();
    if (context && !subscribers.includes(context)) {
      subscribers.push(context);
    }
    return box.value;
  };

  const write = (value: T) => {
    box.value = value;
    for (let i = 0; i < subscribers.length; i++) {
      const subscriber = subscribers[i];
      subscriber();
    }
  };

  return [read, write] as const;
}

/**
 * @public
 */
export function createEffect<T>(
  subscriber: Effect<T | undefined>
): T | undefined;

/**
 * @public
 */
export function createEffect<T>(subscriber: Effect<T>, value: T): T;

/**
 * @public
 */
export function createEffect<T>(subscriber: Effect<T | undefined>, value?: T) {
  let lastComputedValue = value;
  const callback: Subscriber = () => {
    lastComputedValue = subscriber(lastComputedValue);
  };

  try {
    Subscribers.push(callback);
    callback();
  } finally {
    Subscribers.pop();
  }

  return lastComputedValue;
}

/**
 * @public
 */
export function createMemo<T>(subscriber: Effect<T>) {
  const [read, write] = createSignal<T>(undefined!);

  const callback = (previousValue: T) => {
    const value = subscriber(previousValue);
    write(value);
    return value;
  };

  createEffect(callback, undefined!);

  return read;
}
