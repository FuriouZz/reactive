import { SignalOptions, DeepPartial } from "@furiouzz/reactive";

export interface StoreOptions<T> extends SignalOptions<T[keyof T]> {
  readonly?: boolean;
  deep?: boolean;
}

export type ReactiveProxy<T extends object> = T & {
  $store: {
    batchUpdate(state: DeepPartial<T>): void;
  };
};
