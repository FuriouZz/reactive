import ChangeEmitter from "./ChangeEmitter";
import { listen } from "./helpers";
import {
  INTERNAL_OBSERVABLE_KEY,
  reactiveToTarget,
  targetToReactive,
} from "./internals";
import {
  ObservableOptions,
  Observable,
  _InternalObservable,
  ChangeEvent,
  ObservableMixin,
} from "./types";
import { registerWatch } from "./watcher";

const createObservable = <
  TTarget extends object,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: ObservableOptions<TTarget, TMixin>
): _InternalObservable<TTarget, TMixin> => {
  const change = new ChangeEmitter();
  const equals = options?.compare || Object.is;

  const get = (target: TTarget, key: string | symbol, receiver: any) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return internalObs;
    }

    // watchable: true
    if (options?.watchable) {
      registerWatch(internalObs as _InternalObservable, key);
    }

    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return Reflect.get(options.mixin, key);
    }

    const result =
      typeof options?.get === "function"
        ? options.get(target, key, receiver)
        : Reflect.get(target, key, receiver);

    const reactiveResult = targetToReactive.get(result);

    // deep: true
    if (options?.deep && typeof result === "object" && result !== null) {
      if (reactiveResult) return reactiveResult;
      const resObservable = observable(result, options);
      listen(resObservable).on((event) => {
        internalObs.change.dispatch({
          ...event,
          key: `${String(key)}.${String(event.key)}`,
        });
      });
      return resObservable;
    }

    return reactiveResult || result;
  };

  const set = (
    target: TTarget,
    key: string | symbol,
    newValue: any,
    receiver: any
  ) => {
    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return Reflect.set(options.mixin, key, newValue);
    }

    const oldValue = Reflect.get(target, key, receiver);
    let isValid = false;

    if (typeof options?.set === "function") {
      isValid = options.set(target, key, newValue, oldValue, receiver);
    } else {
      isValid = Reflect.set(target, key, newValue, receiver);
    }

    // Get new value
    const value = Reflect.get(target, key, receiver);

    if (!equals(value, oldValue)) {
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

    let _target = target;
    keys =
      keys === undefined || keys.length === 0 ? Object.keys(_target) : keys;

    if (keys.length > 0) {
      for (const key of keys) {
        if (options?.mixin && Reflect.has(options.mixin, key)) {
          _target = options.mixin;
        }

        const event: ChangeEvent = { key, newValue: Reflect.get(_target, key) };

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

  const internalObs: _InternalObservable<TTarget, TMixin> = {
    target,
    proxy: proxy as Observable<TTarget, TMixin>,
    revoke,
    change,
    trigger: trigger,
  };

  // lazy; true
  if (options?.lazy) {
    internalObs.change.muted = true;
  }

  return internalObs;
};

/**
 * Wrap the target around a proxy
 * @public
 */
export const observable = <
  TTarget extends object,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: ObservableOptions<TTarget, TMixin>
): Observable<TTarget, TMixin> => {
  if (targetToReactive.has(target)) {
    return targetToReactive.get(target)!.proxy as Observable<TTarget, TMixin>;
  }

  const o: _InternalObservable<TTarget, TMixin> = createObservable<
    TTarget,
    TMixin
  >(target, options);

  targetToReactive.set(target, o.proxy);
  reactiveToTarget.set(o.proxy, target);

  return o.proxy;
};
