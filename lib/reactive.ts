import { observable } from "./observable";
import {
  ObservableMixin,
  ObservableKeyMap,
  ObservableOptions,
} from "./types";

/**
 * Create a reactive object
 * Same as observable(), but with these defaults
 * - deep: true
 * - watchable: true
 * - lazy: false
 * @public
 */
export const reactive = <
  TTarget extends object,
  TKeyMap extends ObservableKeyMap<TTarget>,
  TMixin extends ObservableMixin
>(
  target: TTarget,
  options: ObservableOptions<TTarget, TKeyMap, TMixin> = {}
) => {
  return observable<TTarget, TKeyMap, TMixin>(target, {
    deep: true,
    watchable: true,
    lazy: false,
    ...options,
  });
};
