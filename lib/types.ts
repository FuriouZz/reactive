import type ChangeEmitter from "./ChangeEmitter";

/**
 * @public
 */
export type ObservableKeyMap<T> = Record<string | symbol | number, keyof T>;

/**
 * @public
 */
export type ObservableMixin = Record<string | symbol | number, any>;

/**
 * @public
 */
export interface CreateObservableOptions<
  TTarget,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
> {
  keyMap?: TKeyMap;
  mixin?: TMixin;
  get?: (target: TTarget, p: string | symbol, receiver?: any) => any;
  set?: (
    target: TTarget,
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
export interface ObservableOptions<
  TTarget,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
> extends Omit<CreateObservableOptions<TTarget, TKeyMap, TMixin>, "target"> {
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
export interface _InternalObservable<
  TTarget extends object = any,
  TKeyMap extends ObservableKeyMap<TTarget> = never,
  TMixin extends ObservableMixin = never
> {
  /**
   *
   */
  target: TTarget;

  /**
   * Proxy
   */
  proxy: Observable<TTarget, TKeyMap, TMixin>;

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
 * @public
 */
export type BaseObservableKeyMapped<
  TTarget extends object = any,
  TKeyMap extends ObservableKeyMap<TTarget> = any,
  TMixin extends ObservableMixin = any
> = {
  [K in keyof TKeyMap]: TTarget[TKeyMap[K]];
} & {
  [K in keyof TMixin]: TMixin[K];
};

/**
 * @public
 */
export type Observable<
  TTarget extends object = any,
  TKeyMap extends ObservableKeyMap<TTarget> = any,
  TMixin extends ObservableMixin = any
> = {
  [K in keyof TTarget]: TTarget[K];
} & BaseObservableKeyMapped<TTarget, TKeyMap, TMixin>;

/**
 * @public
 */
export type Ref<T> = Observable<{ value: T }>;

/**
 * @public
 */
export interface WatchOptions {
  lazy?: boolean;
}
