import { ObservableOptions } from "./types";
import { watchable } from "./watchable";

export const reactive = <T extends object>(
  target: T,
  options: Omit<ObservableOptions<T>, "deep"> = {}
) => {
  return watchable(target, {
    deep: true,
    ...options
  })
}
