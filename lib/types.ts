export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

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

export interface Callable {
  (): void;
}

export interface ExposedScope {
  trigger(action?: "update" | "sideEffects" | undefined): void;
}

export interface StoreOptions<T> extends SignalOptions<T[keyof T]> {
  readonly?: boolean;
  deep?: boolean;
}

export type ReactiveProxy<T extends object> = T & {
  $store: {
    batchUpdate(state: DeepPartial<T>): void;
  };
};
