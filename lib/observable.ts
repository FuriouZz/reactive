import Dispatcher from "./Dispatcher";
import { reactiveToTarget, targetToReactive } from "./internals";
import {
  ChangeEvent,
  CreateObservableOptions,
  KeyChangeEvent,
  ObservableOptions,
  Observable,
} from "./types";

const CHANGE_EVENT = { type: "change" } as { type: "change" };

export const createObservable = <T extends object>(
  options?: CreateObservableOptions<T>
): T => {
  const change = new Dispatcher<ChangeEvent | KeyChangeEvent>();
  const target = options?.target || ({} as T);
  const equals = options?.compare || Object.is;

  const get = (target: T, key: string | symbol, receiver: any) => {
    if (key === "$change") {
      return change;
    } else if (key === "$target") {
      return target;
    } else if (key === "$isObservable") {
      return true;
    } else if (key === "$effect") {
      return effect;
    } else if (key === "$revoke") {
      return revoke;
    }

    return typeof options?.get === "function"
      ? options.get(target, key, receiver)
      : Reflect.get(target, key, receiver);
  };

  const set = (
    target: T,
    key: string | symbol,
    newValue: any,
    receiver: any
  ) => {
    const oldValue = Reflect.get(target, key, receiver);

    if (typeof options?.set === "function") {
      newValue = options.set(target, key, newValue, oldValue);
    }

    Reflect.set(target, key, newValue, receiver);

    if (!equals(newValue, oldValue)) {
      change.dispatch({
        type: "keyChange",
        key,
        newValue,
        oldValue,
      });
    }
  };

  const effect = (keys?: (string | symbol)[]) => {
    const initialMuted = change.muted;
    change.muted = true;

    keys = keys === undefined ? Object.keys(target) : keys;

    if (keys.length > 0) {
      keys.forEach((key) => {
        const oldValue = Reflect.get(target, key);
        const newValue = oldValue;
        if (key in target) {
          set(target, key, newValue, oldValue);
        }
      });
    }

    change.muted = initialMuted;
    change.dispatch(CHANGE_EVENT);
  };

  const revoke = () => o.revoke();

  const o = Proxy.revocable(target, {
    get(target, key, receiver) {
      return get(target, key, receiver);
    },

    set(target, key, newValue, receiver) {
      set(target, key, newValue, receiver);
      return true;
    },
  });

  return o.proxy as T;
};

export const observe = <T extends object>(
  target: T,
  options?: ObservableOptions<T>
) => {
  if (targetToReactive.has(target)) {
    return targetToReactive.get(target) as T;
  }

  const o = createObservable({
    ...options,
    target,
    get(target, key, receiver?) {
      const result =
        typeof options?.get === "function"
          ? options.get(target, key, receiver)
          : Reflect.get(target, key, receiver);

      const reactiveResult = targetToReactive.get(result);

      if (options?.deep && typeof result === "object" && result !== null) {
        if (reactiveResult) return reactiveResult;
        const child = observe(result) as Observable<object>;
        child.$change.on((event) => {
          if (event.type === "change") {
            o.$change.dispatch(CHANGE_EVENT);
          } else if (event.type === "keyChange") {
            o.$change.dispatch({
              ...event,
              key: `${String(key)}.${String(event.key)}`,
            });
          }
        });
        return child;
      }

      return reactiveResult || result;
    },
  }) as Observable<T>;

  targetToReactive.set(target, o as any);
  reactiveToTarget.set(o as any, target);

  return o as T;
};
