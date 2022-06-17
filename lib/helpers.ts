import { reactiveToTarget } from "./internals";
import { Observable } from "./types";

export const isObservable = <T extends object>(
  obj: T
): obj is Observable<T> => {
  return reactiveToTarget.has(obj as any);
};

export const isWatchable = <T extends object>(obj: T): obj is Observable<T> => {
  if (isObservable(obj)) {
    return !!obj.$isWatchable;
  }
  return false;
};

export const raw = <T extends object>(obj: T) => {
  return reactiveToTarget.get(obj as any) || obj;
};

export const triggerChange = <T extends object>(
  observable: T,
  keys?: (keyof T)[]
) => {
  const isValid = isObservable(observable);
  if (!isValid) throw new Error(`Only observable are accepted`);
  return (observable as Observable<T>).$effect(keys);
};
