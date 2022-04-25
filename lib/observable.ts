import Dispatcher from "./Dispatcher";

type Changed = boolean;

interface OnCreateObservable<T> {
  target?: T;
  get?: (target: T, p: keyof T) => unknown;
  set?: (target: T, p: keyof T, newValue: unknown, oldValue: unknown) => Changed;
}

export interface KeyChangeEvent<T extends object, K extends keyof T> {
  key: K;
  newValue: T[K] | null | undefined;
  oldValue: T[K] | null | undefined;
}

export type ChangeEvent = void;

export type Observable<T extends object> = T & {
  /**
   * change event dispatcher
   */
  $change: Dispatcher<ChangeEvent>;

  /**
   * keyChange event dispatcher
   */
  $keyChange: Dispatcher<KeyChangeEvent<T, keyof T>>;

  /**
   * Whether the object is observed or not
   */
  $isObservable: true;

  /**
   * Target observed
   */
  $target: T;

  /**
   * Trigger change
   */
  $effect: (reset?: boolean) => void;
};

export const createObservable = <T extends object>(
  options?: OnCreateObservable<T>
) => {
  const change = new Dispatcher<ChangeEvent>();
  const keyChange = new Dispatcher<KeyChangeEvent<T, keyof T>>();
  const target = options?.target || ({} as T);

  const set = (target: T, key: keyof T, newValue: any, oldValue: any) => {
    let changed = false;
    if (typeof options?.set === "function") {
      changed = options.set(target, key, newValue, oldValue);
    } else {
      changed = true;
      target[key] = newValue;
    }

    if (changed) {
      keyChange.dispatch({
        key: key,
        newValue,
        oldValue,
      });
      change.dispatch();
    }
  };

  const effect = (reset = false) => {
    if (reset) {
      const initialMuted = change.muted;
      change.muted = true;

      Object.keys(target).forEach((key) => {
        const oldValue = target[key as keyof T];
        const newValue = oldValue;
        set(target, key as keyof T, newValue, oldValue);
      });

      change.muted = initialMuted;
      change.dispatch();
    } else {
      change.dispatch();
    }
  };

  const p = new Proxy(target, {
    get(target, key) {
      if (key === "$change") {
        return change;
      } else if (key === "$keyChange") {
        return keyChange;
      } else if (key === "$isObservable") {
        return true;
      } else if (key === "$target") {
        return target;
      } else if (key === "$effect") {
        return effect;
      } else if (typeof options?.get === "function") {
        return options.get(target, key as keyof T);
      }

      return key in target ? target[key as keyof T] : undefined;
    },

    set(target, key, newValue) {
      const oldValue = key in target ? target[key as keyof T] : undefined;

      if (oldValue !== newValue) {
        set(target, key as keyof T, newValue, oldValue);
      }

      return true;
    },
  });

  return p as Observable<T>;
};

export const observe = <T extends object>(target: T) => {
  return createObservable({ target });
};

export const isObservable = <T extends object>(
  target: T
): target is Observable<T> => {
  const t = target as { $isObservable: boolean };
  return typeof t === "object" && t !== null && t.$isObservable;
};

export const getObservableTarget = <T extends object>(
  observable: Observable<T>
): T | null => {
  if (isObservable(observable)) {
    return observable.$target;
  }
  return null;
};
