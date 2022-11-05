import type ChangeEmitter from "./ChangeEmitter";

/**
 * @public
 */
export type ObservableMixin = Record<string | symbol | number, any>;

/**
 * @public
 */
export interface ObservableOptions<
  TTarget,
  TMixin extends ObservableMixin = never
> {
  lazy?: boolean;
  watchable?: boolean;
  reference?: boolean;
  deep?: boolean;
  mixin?: TMixin;
  get?: (target: TTarget, p: string | symbol, receiver?: any) => any;
  has?: (target: TTarget, p: string | symbol) => boolean;
  set?: (
    target: TTarget,
    p: string | symbol,
    newValue: any,
    oldValue: any,
    receiver?: any
  ) => boolean;
  compare?: (newValue: any, oldValue: any) => boolean;
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
  TMixin extends ObservableMixin = never
> {
  /**
   *
   */
  target: TTarget;

  /**
   * Proxy
   */
  proxy: Observable<TTarget, TMixin>;

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
export type Observable<
  TTarget extends object = any,
  TMixin extends ObservableMixin = any
> = {
  [K in keyof TTarget]: TTarget[K] extends Ref<infer UTarget>
    ? UTarget
    : TTarget[K] extends object
    ? Observable<TTarget[K]>
    : TTarget[K];
} & {
  [K in keyof TMixin]: TMixin[K];
};

/**
 * @public
 */
export type Ref<T> = Observable<{ value: T }>;

/**
 * @public
 */
export type Computed<T> = Observable<{ readonly value: T }>;

/**
 * @public
 */
export interface WatchOptions {
  lazy?: boolean;
}
