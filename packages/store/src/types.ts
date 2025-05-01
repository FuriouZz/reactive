import { SignalOptions } from "@furiouzz/reactive";

export type DeepPartial<T> = T extends object ? {
    [K in keyof T]?: DeepPartial<T[K]>;
  }
  : T;

export interface StoreOptions<T> extends SignalOptions<T[keyof T]> {
  readonly?: boolean;
  deep?: boolean;
}

export type ReactiveProxy<T extends object> = T & {
  $store: {
    batchUpdate(state: DeepPartial<T>): void;
  };
};
