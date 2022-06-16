import { Observable, createObservable } from "./observable";

export type GetType<T> = T extends (infer U)[] ? U : any;

export interface TupleMethods<T> {
  set(...values: GetType<T>[]): void;
  setFrom(values: GetType<T>[]): void;
  setScalar(value: GetType<T>): void;
}

export type TupleSchema = Record<string | number | symbol, number>;

export type TupleFull<T, TComponents> = Record<keyof TComponents, GetType<T>>;

export type ReactiveTuple<
  T extends any[],
  TComponents extends TupleSchema,
  TMethods extends Record<string, (...args: any) => any>
> = Observable<T> & TupleFull<T, TComponents> & TupleMethods<T> & TMethods;

export const createReactiveTuple = <
  T extends any[],
  TComponents extends TupleSchema,
  TMethods extends Record<string, (...args: any) => any>
>(options: {
  target: T;
  components: TComponents;
  methods?: TMethods;
  getter?: (target: T, index: number) => GetType<T>;
  setter?: (
    target: T,
    index: number,
    newValue: GetType<T>,
    oldValue: GetType<T>
  ) => boolean;
}) => {
  const { target, components } = options;

  const set = (...values: GetType<T>[]) => {
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

  const setScalar = (value: GetType<T>) => {
    target.fill(value);
    o.$effect();
  };

  const o = createObservable({
    target,

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
              newValue as GetType<T>,
              oldValue as GetType<T>
            );
          } else {
            target[index] = newValue;
          }
          return true;
        }
      }

      return false;
    },
  });

  return o as ReactiveTuple<T, TComponents, TMethods>;
};

export const tuple = createReactiveTuple;
