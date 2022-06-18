import ChangeEmitter from "./ChangeEmitter.js";
import { listen } from "./helpers.js";
import {
  INTERNAL_OBSERVABLE_KEY,
  reactiveToTarget,
  targetToReactive,
} from "./internals.js";
import {
  CreateObservableOptions,
  ObservableOptions,
  Observable,
  ObservableKeyMap,
  InternalObservable,
  ChangeEvent,
} from "./types.js";
import { registerWatch } from "./watcher.js";

const createObservable = <
  T extends object,
  KeyMap extends ObservableKeyMap<T> = never
>(
  target: T,
  options?: CreateObservableOptions<T, KeyMap>
): InternalObservable<T, KeyMap> => {
  const change = new ChangeEmitter();
  const equals = options?.compare || Object.is;

  const getKey = (key: string | symbol) => {
    if (options?.keyMap && options?.keyMap[key] !== undefined) {
      return options?.keyMap[key] as string | symbol;
    }
    return key;
  };

  const get = (target: T, key: string | symbol, receiver: any) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return internalObs;
    }

    key = getKey(key);

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
    key = getKey(key);

    const oldValue = Reflect.get(target, key, receiver);

    if (typeof options?.set === "function") {
      newValue = options.set(target, key, newValue, oldValue);
    }

    const isValid = Reflect.set(target, key, newValue, receiver);

    if (!equals(newValue, oldValue)) {
      change.dispatch({
        key,
        newValue,
        oldValue,
      });
    }

    return isValid;
  };

  const trigger = (keys?: (string | symbol)[], oldValues?: any) => {
    const muted = change.muted;
    change.muted = false;

    keys = keys === undefined || keys.length === 0 ? Object.keys(target) : keys;

    if (keys.length > 0) {
      for (const key of keys) {
        const event: ChangeEvent = { key, newValue: Reflect.get(target, key) }

        if (oldValues && Reflect.has(oldValues, key)) {
          event.oldValue = Reflect.get(oldValues, key);
        }

        change.dispatch(event);
      }
    }

    change.muted = muted;
  };

  const { proxy, revoke } = Proxy.revocable(target, {
    get,
    set,
  });

  const internalObs: InternalObservable<T, KeyMap> = {
    target,
    proxy: proxy as Observable<T, KeyMap>,
    revoke,
    change,
    trigger: trigger,
  };

  return internalObs;
};

/**
 * @public
 */
export const observable = <
  T extends object,
  KeyMap extends ObservableKeyMap<T>
>(
  target: T,
  options?: ObservableOptions<T, KeyMap>
): Observable<T, KeyMap> => {
  if (targetToReactive.has(target)) {
    return targetToReactive.get(target)!.proxy as Observable<T, KeyMap>;
  }

  const o: InternalObservable<T, KeyMap> = createObservable<T, KeyMap>(target, {
    ...options,
    get(target, key, receiver?) {
      const result =
        typeof options?.get === "function"
          ? options.get(target, key, receiver)
          : Reflect.get(target, key, receiver);

      const reactiveResult = targetToReactive.get(result);

      // deep: true
      if (options?.deep && typeof result === "object" && result !== null) {
        if (reactiveResult) return reactiveResult;
        const resObservable = observable(result);
        listen(resObservable).on((event) => {
          o.change.dispatch({
            ...event,
            key: `${String(key)}.${String(event.key)}`,
          });
        });
        return resObservable;
      }

      // watchable: true
      if (options?.watchable) {
        registerWatch(o as InternalObservable, key);
      }

      return reactiveResult || result;
    },
  });

  // lazy; true
  if (options?.lazy) {
    o.change.muted = true;
  }

  targetToReactive.set(target, o.proxy);
  reactiveToTarget.set(o.proxy, target);

  return o.proxy;
};
