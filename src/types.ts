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
export type Callable = () => void;

/**
 * @public
 */
export interface ExposedScope {
  trigger(action?: "update" | "sideEffects" | undefined): void;
}

/**
 * @public
 */
export type OnReturn<T> = (oldValue: T | undefined) => T;

/**
 * @public
 */
export type Accessor<T> = () => T;

/**
 * @public
 */
export type AccessorArray<T> = [...Extract<{ [K in keyof T]: Accessor<T[K]> }, readonly unknown[]>];
