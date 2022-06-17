import { isObservable } from "./helpers";
import { ObservableRef } from "./types";
import { watchable } from "./watchable";

export const ref = <T>(value: T) => {
  return watchable({ value }) as ObservableRef<T>;
};

export const unref = <T>(observable: ObservableRef<T>): T | null => {
  if (isObservable(observable)) {
    return observable.$target.value;
  }
  return null;
};

export const lazyRef = <T>(value: T) => {
  return watchable(
    { value },
    {
      set(target, key, newValue) {
        if (key === "value") {
          target[key] = newValue as T;
        }
        return false;
      },
    }
  ) as ObservableRef<T>;
};
