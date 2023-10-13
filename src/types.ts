/**
 * @public
 */
export interface SignalOptions<T> {
  equals?: boolean | ((a: T, b: T) => boolean);
}

/**
 * Signal read and write functions
 * @public
 */
export type SignalTuple<T> = [() => T, (value: T) => void];

/**
 * @public
 */
export interface Callable {
  (): void;
}

/**
 * @public
 */
export interface ExposedScope {
  trigger(action?: "update" | "sideEffects" | undefined): void;
}
