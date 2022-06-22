import ChangeEmitter from "./ChangeEmitter";
import { listen } from "./helpers";
import {
  INTERNAL_OBSERVABLE_KEY,
  reactiveToTarget,
  targetToReactive,
} from "./internals";
import {
  CreateObservableOptions,
  ObservableOptions,
  Observable,
  ObservableKeyMap,
  _InternalObservable,
  ChangeEvent,
  ObservableMixin,
} from "./types";
import { registerWatch } from "./watcher";

const createObservable = <
  TTarget extends object,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: CreateObservableOptions<TTarget, TKeyMap, TMixin>
): _InternalObservable<TTarget, TKeyMap, TMixin> => {
  const change = new ChangeEmitter();
  const equals = options?.compare || Object.is;

  const getKey = (key: string | symbol) => {
    if (options?.keyMap && options?.keyMap[key] !== undefined) {
      return options?.keyMap[key] as string | symbol;
    }
    return key;
  };

  const getMixinField = (key: string | symbol) => {
    if (options?.mixin && options?.mixin[key] !== undefined) {
      return options?.mixin[key];
    }
    return undefined;
  };

  const get = (target: TTarget, key: string | symbol, receiver: any) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return internalObs;
    }

    key = getKey(key);

    const field = getMixinField(key);
    if (field) return field;

    return typeof options?.get === "function"
      ? options.get(target, key, receiver)
      : Reflect.get(target, key, receiver);
  };

  const set = (
    target: TTarget,
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
        const event: ChangeEvent = { key, newValue: Reflect.get(target, key) };

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

  const internalObs: _InternalObservable<TTarget, TKeyMap, TMixin> = {
    target,
    proxy: proxy as Observable<TTarget, TKeyMap, TMixin>,
    revoke,
    change,
    trigger: trigger,
  };

  return internalObs;
};

/**
 * Wrap the target around a proxy
 * @public
 */
export const observable = <
  TTarget extends object,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: ObservableOptions<TTarget, TKeyMap, TMixin>
): Observable<TTarget, TKeyMap, TMixin> => {
  if (targetToReactive.has(target)) {
    return targetToReactive.get(target)!.proxy as Observable<
      TTarget,
      TKeyMap,
      TMixin
    >;
  }

  const o: _InternalObservable<TTarget, TKeyMap, TMixin> = createObservable<
    TTarget,
    TKeyMap,
    TMixin
  >(target, {
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
        registerWatch(o as _InternalObservable, key);
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
