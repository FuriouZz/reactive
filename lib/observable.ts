import ChangeEmitter from "./ChangeEmitter";
import { listen } from "./helpers";
import {
  INTERNAL_OBSERVABLE_KEY,
  INTERNAL_REF_KEY,
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
  const listened = new WeakSet<any>();

  if (options?.reference && !("value" in target)) {
    throw new Error(
      "[reactive] A reference must have a value property in its target."
    );
  }

  const applyDeep = (result: any, key: string | symbol) => {
    if (options?.deep && typeof result === "object" && result !== null) {
      let dep: any;
      const isReactive = reactiveToTarget.has(result);
      const hasReactiveResult = targetToReactive.has(result);

      if (isReactive) {
        dep = result;
      } else if (hasReactiveResult) {
        dep = targetToReactive.get(result);
      } else {
        dep = observable(result, options);
      }

      if (!listened.has(result)) {
        listened.add(result);
        listen(dep).on((e) => {
          internalObs.trigger([key], {
            [key]: { ...result, [e.key]: e.oldValue },
          });
        });
      }
    }
  };

  const get = (target: TTarget, key: string | symbol, receiver: any) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return internalObs;
    }

    if (key === INTERNAL_REF_KEY) {
      return !!options?.reference;
    }

    // watchable: true
    if (options?.watchable) {
      registerWatch(internalObs as _InternalObservable, key);
    }

    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return Reflect.get(options.mixin, key);
    }

    let result =
      typeof options?.get === "function"
        ? options.get(target, key, receiver)
        : Reflect.get(target, key, receiver);

    // Take value from ref/computed
    if (
      typeof result === "object" &&
      result !== null &&
      Reflect.get(result, INTERNAL_REF_KEY)
    ) {
      result = result.value;
    }

    // deep: true
    applyDeep(result, key);

    // Return reactive value
    if (targetToReactive.has(result)) {
      return targetToReactive.get(result);
    }

    // Return default value
    return result;
  };

  const has = (target: TTarget, key: string | symbol) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return true;
    }

    if (key === INTERNAL_REF_KEY) {
      return !!options?.reference;
    }

    // watchable: true
    if (options?.watchable) {
      registerWatch(internalObs as _InternalObservable, key);
    }

    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return true;
    }

    const result =
      typeof options?.has === "function"
        ? options.has(target, key)
        : Reflect.has(target, key);

    // deep: true
    applyDeep(result, key);

    return result;
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

    let isValid = false;
    const currentValue = Reflect.get(target, key, receiver);

    // Set .value to ref/computed
    if (
      typeof currentValue === "object" &&
      currentValue !== null &&
      Reflect.get(currentValue, INTERNAL_REF_KEY)
    ) {
      if (equals(currentValue.value, newValue)) return true;

      if (typeof options?.set === "function") {
        isValid = options.set(
          currentValue,
          "value",
          newValue,
          currentValue.value,
          receiver
        );
      } else {
        isValid = Reflect.set(currentValue, "value", newValue, receiver);
      }

      if (isValid) {
        change.dispatch({
          key,
          newValue,
          oldValue: currentValue.value,
        });
      }

      return isValid;
    }

    // Classic cases
    if (equals(currentValue, newValue)) return true;

    if (typeof options?.set === "function") {
      isValid = options.set(target, key, newValue, currentValue, receiver);
    } else {
      isValid = Reflect.set(target, key, newValue, receiver);
    }

    if (isValid) {
      change.dispatch({
        key,
        newValue,
        oldValue: currentValue,
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
        } else {
          _target = target;
        }

        const event: ChangeEvent = { key, newValue: Reflect.get(_target, key) };
        if (oldValues && Reflect.has(oldValues, key)) {
          event.oldValue = Reflect.get(oldValues, key);
          if (!equals(event.newValue, event.oldValue)) {
            change.dispatch(event);
          }
        } else {
          change.dispatch(event);
        }
      }
    }

    change.muted = muted;
  };

  const { proxy, revoke } = Proxy.revocable(target, {
    get,
    set,
    has,
  });

  const internalObs: _InternalObservable<TTarget, TMixin> = {
    target,
    proxy: proxy as Observable<TTarget, TMixin>,
    revoke,
    change,
    trigger,
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
