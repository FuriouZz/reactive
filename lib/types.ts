export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export interface SignalOptions<T> {
  equals?: boolean | ((a: T, b: T) => boolean);
}

export type SignalTuple<T> = [() => T, (value: T) => void];

export interface Subscriber {
  (): void;
}

export interface StoreOptions<T> extends SignalOptions<T[keyof T]> {
  readonly?: boolean;
}

export type ReactiveProxy<T extends object> = T & {
  $store: {
    subscribers: Set<Subscriber>;
    batchUpdate(state: DeepPartial<T> | (() => void)): void;
    createEffect(subscriber: () => void): () => void;
    disposeEffect(subscriber: () => void): void;
  };
};
