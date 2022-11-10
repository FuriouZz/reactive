import ChangeEmitter from "./ChangeEmitter.js";
import { listen } from "./helpers.js";
import {
  INTERNAL_OBSERVABLE_KEY,
  INTERNAL_REF_KEY,
  reactiveToTarget,
  targetToReactive,
} from "./internals.js";
import {
  ObservableOptions,
  Observable,
  InternalObservable,
  ChangeEvent,
  ObservableMixin,
} from "./types.js";
import { registerWatch } from "./watcher.js";

const createObservable = <
  TTarget extends object,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: ObservableOptions<TTarget, TMixin>
): InternalObservable<TTarget, TMixin> => {
  const change = new ChangeEmitter();
  const equals = options?.compare || Object.is;
  const dependencies = new Set<Observable>();

  if (options?.reference && !("value" in target)) {
    throw new Error(
      "[reactive] A reference must have a value property in its target."
    );
  }

  const addDependency = (
    target: any,
    key: string | symbol,
    dep: Observable
  ) => {
    if (dependencies.has(dep)) return;
    dependencies.add(dep);
    listen(dep).on((e) => {
      internalObs.trigger([key], {
        [key]: { ...target, [e.key]: e.oldValue },
      });
    });
  };

  const getOrCreateObservable = (value: any) => {
    if (typeof value !== "object" || value === null) {
      throw new Error(
        "[reactive] Cannot get or create observable from non-object"
      );
    }

    let dep: Observable;
    const isReactive = reactiveToTarget.has(value);
    const hasReactiveResult = targetToReactive.has(value);

    // Get observable or transform result to observable
    if (isReactive) {
      dep = value;
    } else if (hasReactiveResult) {
      dep = targetToReactive.get(value)!;
    } else {
      dep = observable(value, options);
    }

    return dep;
  };

  const applyDeep = (key: string | symbol, value: any) => {
    if (options?.deep && typeof value === "object" && value !== null) {
      const dep = getOrCreateObservable(value);
      addDependency(value, key, dep);
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
      registerWatch(internalObs as InternalObservable, key);
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
    applyDeep(key, result);

    const value = targetToReactive.has(result)
      ? targetToReactive.get(result)
      : result;

    return value;
  };

  const has = (target: TTarget, key: string | symbol) => {
    if (key === INTERNAL_OBSERVABLE_KEY) {
      return true;
    }

    if (key === INTERNAL_REF_KEY) {
      return !!options?.reference;
    }

    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return true;
    }

    return typeof options?.has === "function"
      ? options.has(target, key)
      : Reflect.has(target, key);
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
          _target = options.mixin as any;
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

  const findDependencies = (target: TTarget) => {
    for (const key in target) {
      const value = target[key] as Observable;
      const isReactive = reactiveToTarget.has(value);
      if (isReactive) {
        const target = reactiveToTarget.get(value)!;
        addDependency(target, key, value);
      } else if (options?.deep && typeof value === "object" && value !== null) {
        applyDeep(key, value);
      }
    }
  };

  const { proxy, revoke } = Proxy.revocable(target, {
    get,
    set,
    has,
  });

  const internalObs: InternalObservable<TTarget, TMixin> = {
    target,
    proxy: proxy as Observable<TTarget, TMixin>,
    revoke,
    change,
    trigger,
    dependencies,
  };

  findDependencies(target);

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
    const reactive = targetToReactive.get(target)!;
    return reactive as Observable<TTarget, TMixin>;
  }

  const o = createObservable<TTarget, TMixin>(target, options);

  targetToReactive.set(target, o.proxy);
  reactiveToTarget.set(o.proxy, target);

  return o.proxy;
};
