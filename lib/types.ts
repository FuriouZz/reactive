import type ChangeEmitter from "./ChangeEmitter.js";

/**
 * @public
 */
export type ObservableKeyMap<T> = Record<string | symbol | number, keyof T>;

/**
 * @internal
 */
export interface CreateObservableOptions<
  T,
  KeyMap extends ObservableKeyMap<T> = never
> {
  keyMap?: KeyMap;
  get?: (target: T, p: string | symbol, receiver?: any) => any;
  set?: (
    target: T,
    p: string | symbol,
    newValue: any,
    oldValue: any,
    receiver?: any
  ) => any;
  compare?: (newValue: any, oldValue: any) => boolean;
}

/**
 * @public
 */
 export interface ObservableOptions<T, K extends ObservableKeyMap<T> = never>
  extends Omit<CreateObservableOptions<T, K>, "target"> {
  deep?: boolean;
  watchable?: boolean;
  lazy?: boolean;
}

/**
 * @public
 */
export interface ChangeEvent {
  key: string | symbol;
  newValue: any;
  oldValue?: any;
}

/**
 * @internal
 */
 export interface InternalObservable<
  T extends object = any,
  KeyMap extends ObservableKeyMap<T> = never
> {
  /**
   *
   */
  target: T;

  /**
   * Proxy
   */
  proxy: Observable<T, KeyMap>;

  /**
   * Revoke proxy
   */
  revoke: () => void;

  /**
   * change event dispatcher
   */
  change: ChangeEmitter;

  /**
   * Trigger change
   */
  trigger: (keys?: (string | symbol)[], oldValues?: any) => void;
}

/**
 * @internal
 */
export type BaseObservableKeyMapped<
  T extends object = any,
  KeyMap extends ObservableKeyMap<T> = any
> = {
  [K in keyof KeyMap]: T[KeyMap[K]];
};

/**
 * @public
 */
export type Observable<
  T extends object = any,
  KeyMap extends ObservableKeyMap<T> = any
> = {
  [K in keyof T]: T[K];
} & BaseObservableKeyMapped<T, KeyMap>;

/**
 * @public
 */
export type Ref<T> = Observable<{ value: T }>;

/**
 * @internal
 */
export interface WatchOptions {
  lazy?: boolean;
}
