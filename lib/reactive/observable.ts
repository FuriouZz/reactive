import ChangeEmitter from "./ChangeEmitter.js";
import { isObservable } from "./helpers.js";
import { $Target, targetToReactive, internalObservable } from "./internals.js";
import { isRefOrComputed } from "./ref.js";
import { registerObervable as registerDependency } from "./watcher.js";
import {
  ObservableOptions,
  Observable,
  InternalObservable,
  ObservableMixin,
} from "./types.js";

const addDependency = (
  observable: InternalObservable<any>,
  dep: Observable,
  key: string | symbol
) => {
  const internal = internalObservable(dep);
  if (!internal || observable.dependencies.has(internal)) return;
  observable.dependencies.add(internal);
  internal.change.on((e) => {
    observable.trigger(key, e.newValue, e.oldValue);
  });
};

const findDependencies = (
  observable: InternalObservable<any>,
  options?: ObservableOptions<any, any>
) => {
  if (observable.type === "reactive") {
    for (const key in observable.target) {
      const dep = observable.target[key] as Observable;
      const isReactive = isObservable(dep);

      if (isReactive) {
        addDependency(observable, dep, key);
      } else if (options?.deep && typeof dep === "object" && dep !== null) {
        applyDeep(observable, key, dep, options);
      }
    }
  }
};

const applyDeep = (
  observable: InternalObservable<any>,
  key: string | symbol,
  value: any,
  options?: ObservableOptions<any, any>
) => {
  if (options?.deep && typeof value === "object" && value !== null) {
    const reactive = getOrCreateObservable(value, options);
    addDependency(observable, reactive, key);
  }
};

const getOrCreateObservable = (
  value: any,
  options?: ObservableOptions<any, any>
) => {
  if (typeof value !== "object" || value === null) {
    throw new Error(
      "[reactive] Cannot get or create observable from non-object"
    );
  }

  let dep: Observable;
  const isReactive = isObservable(value);
  const hasReactiveResult = targetToReactive.has(value);

  // Get observable or transform result to observable
  if (isReactive) {
    dep = value;
  } else if (hasReactiveResult) {
    dep = targetToReactive.get(value)!.proxy;
  } else {
    dep = observable(value, options);
  }

  return dep;
};

const createObservable = <
  TTarget extends object,
  TMixin extends ObservableMixin = never
>(
  target: TTarget,
  options?: ObservableOptions<TTarget, TMixin>
): InternalObservable<TTarget, TMixin> => {
  const change = new ChangeEmitter();
  const equals = options?.compare || Object.is;
  const dependencies = new Set<InternalObservable>();

  if (options?.type !== "reactive" && !("value" in target)) {
    throw new Error(
      "[reactive] A reference must have a value property in its target."
    );
  }

  const get = (target: TTarget, key: string | symbol, receiver: any) => {
    if (key === $Target) return target;

    // watchable: true
    if (options?.watchable) {
      registerDependency(internalObs, key);
    }

    // Get mixin value at key
    if (options?.mixin && Reflect.has(options.mixin, key)) {
      return Reflect.get(options.mixin, key);
    }

    let result =
      typeof options?.get === "function"
        ? options.get(target, key, receiver)
        : Reflect.get(target, key, receiver);

    // Take value from ref/computed
    if (isRefOrComputed(result)) {
      result = result.value;
    }

    // deep: true
    if (options?.deep) {
      applyDeep(internalObs, key, result, options);
    }

    const isReactive = targetToReactive.has(result);
    const value = isReactive ? targetToReactive.get(result)!.proxy : result;

    return value;
  };

  const has = (target: TTarget, key: string | symbol): boolean => {
    if (key === $Target) return true;

    // Has mixin at key
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

    let isValid = true;
    let currentValue = Reflect.get(target, key, receiver);

    // Set .value to ref/computed
    if (isRefOrComputed(currentValue)) {
      if (equals(currentValue.value, newValue)) return isValid;
      isValid = Reflect.set(currentValue, "value", newValue);
      currentValue = currentValue.value;
    }

    // Other cases
    else {
      if (equals(currentValue, newValue)) return isValid;
      if (typeof options?.set === "function") {
        isValid = options.set(target, key, newValue, currentValue, receiver);
      } else {
        isValid = Reflect.set(target, key, newValue, receiver);
      }
    }

    if (isValid) {
      change.dispatch({
        key,
        newValue: Reflect.get(target, key, receiver),
        oldValue: currentValue,
      });
    }
    return isValid;
  };

  const trigger = <K extends keyof TTarget>(
    key: K | "$target" = "$target",
    newValue?: TTarget[K],
    oldValue?: TTarget[K]
  ) => {
    const muted = change.muted;
    change.muted = false;
    if (key === "$target") {
      change.dispatch({ key: "$target", newValue: internalObs.proxy });
    } else {
      newValue = newValue ?? Reflect.get(internalObs.target, key);
      change.dispatch({ key: key as string | symbol, newValue, oldValue });
    }
    change.muted = muted;
  };

  const { proxy, revoke } = Proxy.revocable(target, { get, set, has });

  const internalObs: InternalObservable<TTarget, TMixin> = {
    target,
    proxy: proxy as Observable<TTarget, TMixin>,
    revoke,
    change,
    trigger,
    dependencies,
    type: options?.type ?? "reactive",
  };

  findDependencies(internalObs, options);

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
    const reactive = targetToReactive.get(target);
    return reactive!.proxy as Observable<TTarget, TMixin>;
  }

  const o = createObservable<TTarget, TMixin>(target, options);
  targetToReactive.set(target, o);
  return o.proxy;
};
