import { isObservable } from "./helpers.js";
import { InternalObservable, Observable } from "./types.js";

/**
 * @internal
 */
export const $Target = Symbol("$target");

/**
 * @internal
 */
export const targetToReactive = new WeakMap<any, InternalObservable>();

/**
 * @internal
 */
export const internalObservable = <
  TTarget extends object,
  TMixin extends object
>(
  obj: Observable<TTarget, TMixin>
) => {
  if (isObservable(obj)) {
    const target = Reflect.get(obj, $Target);
    return targetToReactive.get(target) as InternalObservable<TTarget, TMixin>;
  }
  return undefined;
};

export const getID = (o: InternalObservable) => {
  return o.change.id;
};
