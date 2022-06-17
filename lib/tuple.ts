import { observe } from "./observable";
import { Tuple } from "./types";

export const createReactiveTuple = <
  T extends any[],
  TComponents extends Tuple.Schema,
  TMethods extends Record<string, (...args: any) => any>
>(options: {
  target: T;
  components: TComponents;
  methods?: TMethods;
  getter?: (target: T, index: number) => Tuple.GetType<T>;
  setter?: (
    target: T,
    index: number,
    newValue: Tuple.GetType<T>,
    oldValue: Tuple.GetType<T>
  ) => boolean;
}) => {
  const { target, components } = options;

  const set = (...values: Tuple.GetType<T>[]) => {
    if (values.length === 1) {
      target.fill(values[0]);
      o.$effect();
    } else if (target.length === values.length) {
      const length = target.length;
      for (let i = 0; i < length; i++) {
        target[i] = values[i];
      }
      o.$effect();
    }
  };

  const setFrom = (values: T) => {
    set(...values);
  };

  const setScalar = (value: Tuple.GetType<T>) => {
    target.fill(value);
    o.$effect();
  };

  const o = observe(target, {
    // Only get fields and options.methods
    get(target, key) {
      if (
        options.methods &&
        options.methods[key as keyof typeof options.methods]
      ) {
        return options.methods[key as keyof typeof options.methods];
      }

      switch (key) {
        case "set": {
          return set;
        }
        case "setFrom": {
          return setFrom;
        }
        case "setScalar": {
          return setScalar;
        }
      }

      if (typeof key === "string") {
        const index = components[key];
        if (!isNaN(index)) {
          if (options.getter !== undefined) {
            return options.getter(target, index);
          } else {
            return target[index];
          }
        }
      }

      return undefined;
    },

    // Only set fields
    set(target, key, newValue, oldValue) {
      if (typeof key === "string") {
        const index = components[key];
        if (!isNaN(index)) {
          if (options.setter !== undefined) {
            options.setter(
              target,
              index,
              newValue as Tuple.GetType<T>,
              oldValue as Tuple.GetType<T>
            );
          } else {
            target[index] = newValue;
          }
          return true;
        }
      }

      return false;
    },
  }) as Tuple.Reactive<T, TComponents, TMethods>;

  return o;
};

export const tuple = createReactiveTuple;
