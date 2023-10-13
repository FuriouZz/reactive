import Effect from "../Effect.js";

/**
 * Create side effects executed each time its dependencies have changed
 * @public
 * @param subscriber
 * @param defaultValue
 * @returns
 */
export default function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T
): () => void;
/**
 * Create side effects executed each time its dependencies have changed
 * @public
 * @param subscriber
 * @param defaultValue
 * @returns
 */
export default function createEffect<T>(
  subscriber: (oldValue: T) => T,
  defaultValue: T
): () => void;
export default function createEffect<T>(
  subscriber: (oldValue: T | undefined) => T,
  defaultValue?: T
) {
  let lastComputedValue = defaultValue;

  const effect = new Effect(() => {
    lastComputedValue = subscriber(lastComputedValue);
  });

  effect.trigger();

  return () => effect.dispose();
}
