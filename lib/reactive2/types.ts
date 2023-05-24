import type Store from "./Store.js";

export type DeepPartial<T> = T extends object
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : T;

export interface SignalOptions<T> {
  equals?: false | ((a: T, b: T) => boolean);
}

export interface Subscriber {
  (): void;
}

export interface Update {
  (): void;
}

export interface StoreOptions {
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
