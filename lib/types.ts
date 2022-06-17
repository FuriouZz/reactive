import type Dispatcher from "./Dispatcher";

export type Changed = boolean;

export interface CreateObservableOptions<T> {
  target?: T;
  get?: (target: T, p: string | symbol, receiver?: any) => any;
  set?: (
    target: T,
    p: string | symbol,
    newValue: any,
    oldValue: any,
    receiver?: any
  ) => Changed;
  compare?: (newValue: any, oldValue: any) => boolean;
}

export interface ObservableOptions<T>
  extends Omit<CreateObservableOptions<T>, "target"> {
  deep?: boolean;
}

export interface KeyChangeEvent {
  type: "keyChange";
  key: string | symbol;
  newValue: any;
  oldValue: any;
}

export type ChangeEvent = {
  type: "change";
};

export interface BaseObservable<T extends object> {
  /**
   * change event dispatcher
   */
  $change: Dispatcher<ChangeEvent | KeyChangeEvent>;

  /**
   * Whether the object is observed or not
   */
  $isObservable: true;

  /**
   * Whether the object is watchable or not
   */
  $isWatchable?: true;

  /**
   * Target observed
   */
  $target: T;

  /**
   * Trigger change
   */
  $effect: (keys?: (keyof T)[]) => void;

  /**
   * Revoke proxy
   */
  $revoke: () => void;
}

// export type ObservableDeeply<T extends object> = {
//   [K in keyof T]: T[K] extends object ? ObservableDeeply<T[K]> : T[K];
// } & BaseObservable<T>;

export type Observable<T extends object> = {
  [K in keyof T]: T[K];
} & BaseObservable<T>;

export type ObservableRef<T> = Observable<{ value: T }>;

export interface WatchOptions {
  lazy?: boolean;
}

export namespace Tuple {
  export type GetType<T> = T extends (infer U)[] ? U : any;

  export interface Methods<T> {
    set(...values: GetType<T>[]): void;
    setFrom(values: GetType<T>[]): void;
    setScalar(value: GetType<T>): void;
  }

  export type Schema = Record<string | number | symbol, number>;

  export type Full<T, TComponents> = Record<keyof TComponents, GetType<T>>;

  export type Reactive<
    T extends any[],
    TComponents extends Schema,
    TMethods extends Record<string, (...args: any) => any>
  > = Observable<T> & Full<T, TComponents> & Methods<T> & TMethods;
}
