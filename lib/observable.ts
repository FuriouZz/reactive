import Dispatcher from "./Dispatcher";

export type Changed = boolean;

export interface CreateObservableOptions<T> {
  target?: T;
  get?: (target: T, p: keyof T) => any;
  set?: (target: T, p: keyof T, newValue: any, oldValue: any) => Changed;
  compare?: (newValue: any, oldValue: any) => boolean;
}

export interface KeyChangeEvent<T extends object, K extends keyof T> {
  key: K | Omit<string, K>;
  newValue: T[K] | null | undefined;
  oldValue: T[K] | null | undefined;
}

export type ChangeEvent = void;

interface BaseObservable<T extends object> {
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
  $effect: (keys?: (keyof T)[]) => void;

  /**
   * Revoke proxy
   */
  $revoke: () => void;
}

// export type ObservableDeeply<T extends object> = {
//   [K in keyof T]: T[K] extends object ? ObservableDeeply<T[K]> : T[K];
// } & BaseObservable<T>;

export type Observable<T extends object> = {
  [K in keyof T]: T[K];
} & BaseObservable<T>;

export const createObservable = <T extends object>(
  options?: CreateObservableOptions<T>
) => {
  const change = new Dispatcher<ChangeEvent>();
  const keyChange = new Dispatcher<KeyChangeEvent<T, keyof T>>();
  const target = options?.target || ({} as T);
  const compare = options?.compare || Object.is;

  const set = (target: T, key: keyof T, newValue: any, oldValue: any) => {
    let changed: Changed = false;
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

  const effect = (keys?: (keyof T)[]) => {
    const initialMuted = change.muted;
    change.muted = true;

    keys = keys === undefined ? (Object.keys(target) as (keyof T)[]) : keys;

    if (keys.length > 0) {
      keys.forEach((key) => {
        const oldValue = target[key as keyof T];
        const newValue = oldValue;
        if (key in target) {
          set(target, key as keyof T, newValue, oldValue);
        }
      });
    }

    change.muted = initialMuted;
    change.dispatch();
  };

  const revoke = () => {
    o.revoke();
  };

  const o = Proxy.revocable(target, {
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
      } else if (key === "$revoke") {
        return revoke;
      } else if (typeof options?.get === "function") {
        return options.get(target, key as keyof T);
      }

      return key in target ? target[key as keyof T] : undefined;
    },

    set(target, key, newValue) {
      const oldValue = key in target ? target[key as keyof T] : undefined;

      if (!compare(newValue, oldValue)) {
        set(target, key as keyof T, newValue, oldValue);
      }

      return true;
    },
  });

  return o.proxy as Observable<T>;
};

export const observe = <T extends object>(
  target: T,
  options: { deep?: boolean } & Pick<CreateObservableOptions<T>, "compare"> = {}
) => {
  if (options?.deep) {
    return createObservableDeeply({ target, ...options });
  }
  return createObservable({ target, ...options });
};

export const createObservableDeeply = <T extends object>(
  options: CreateObservableOptions<T>
): Observable<T> => {
  const reactives: Partial<
    Record<
      keyof T,
      {
        observable: Observable<object>;
        unwatch: () => void;
      }
    >
  > = {};

  const createReactiveObject = (
    key: keyof T,
    value: object | Observable<object>
  ) => {
    const observable = isObservable(value)
      ? value
      : createObservableDeeply({ target: value });

    const unwatch = observable.$keyChange.on((event) => {
      root.$change.dispatch();

      root.$keyChange.dispatch({
        ...event,
        key: `${key}.${event.key}`,
      });
    });

    return { observable, unwatch };
  };

  const root = createObservable({
    target: options.target,

    get(target, key) {
      if (typeof target[key] !== "object") {
        return target[key];
      }

      if (!reactives[key]) {
        reactives[key] = createReactiveObject(
          key,
          target[key] as unknown as object
        );
      }

      if (typeof options?.get === "function") {
        return options.get(target, key);
      }

      return reactives[key]?.observable;
    },

    set(target, key, newValue, oldValue) {
      if (typeof newValue !== "object") {
        return true;
      }

      if (reactives[key] && newValue !== reactives[key]?.observable.$target) {
        const o = reactives[key]!;
        o.unwatch();
        delete reactives[key];
      }

      if (newValue !== null) {
        reactives[key] = createReactiveObject(
          key,
          target[key] as unknown as object | Observable<object>
        );
      }

      let changed: Changed = false;
      if (options.set) {
        changed = options.set(target, key, newValue, oldValue);
      } else {
        changed = true;
        target[key] = newValue;
      }

      return changed;
    },
  });

  return root as Observable<T>;
};

export const isObservable = <T extends object>(
  target: any
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
