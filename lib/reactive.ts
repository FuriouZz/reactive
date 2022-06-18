import { observable } from "./observable.js";
import { ObservableKeyMap, ObservableOptions } from "./types.js";

/**
 * @public
 */
export const reactive = <T extends object, KeyMap extends ObservableKeyMap<T>>(
  target: T,
  options: ObservableOptions<T, KeyMap> = {}
) => {
  return observable<T, KeyMap>(target, {
    deep: true,
    watchable: true,
    lazy: false,
    ...options,
  });
};
