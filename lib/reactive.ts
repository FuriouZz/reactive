import { observable } from "./observable";
import { ObservableMixin, ObservableOptions } from "./types";

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
  TMixin extends ObservableMixin
>(
  target: TTarget,
  options: ObservableOptions<TTarget, TMixin> = {}
) => {
  return observable<TTarget, TMixin>(target, {
    deep: true,
    watchable: true,
    lazy: false,
    ...options,
  });
};
