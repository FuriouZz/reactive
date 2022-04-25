import {
  createObservable,
  isObservable,
  Observable,
  observe,
} from "./observable";

export type ObservableRef<T> = Observable<{ value: T }>;

export const ref = <T>(value: T) => {
  return observe({ value }) as ObservableRef<T>;
};

export const unref = <T>(observable: ObservableRef<T>): T | null => {
  if (isObservable(observable)) {
    return observable.$target.value;
  }
  return null;
};

export const lazyRef = <T>(value: T) => {
  return createObservable({
    target: { value },
    set(target, key, newValue) {
      if (key === "value") {
        target[key] = newValue as T;
      }
      return false;
    },
  }) as ObservableRef<T>;
};
