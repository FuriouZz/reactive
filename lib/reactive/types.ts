import type ChangeEmitter from "./ChangeEmitter.js";

/**
 * @public
 */
export type ObservableMixin = object; //Record<string | symbol | number, any>;

/**
 * @public
 */
export interface ObservableOptions<
  TTarget,
  TMixin extends ObservableMixin = {}
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
export interface InternalObservable<
  TTarget extends object = object,
  TMixin extends ObservableMixin = {}
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

  /**
   * List of observable watched by the root observable
   */
  dependencies: Set<Observable>;
}

/**
 * @public
 */
export type Observable<
  TTarget extends object = object,
  TMixin extends ObservableMixin = {}
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
export type ToRefs<T> = {
  [K in keyof T]: Ref<T[K]>;
};

/**
 * @public
 */
export type Computed<T, U = T> = Observable<{
  get value(): T,
  set value(v: T | U)
}>;

/**
 * @public
 */
export type Readonly<T> = Observable<{ readonly value: T }>;

/**
 * @public
 */
export type WatchSource = Ref<unknown> | Computed<unknown> | (() => unknown);

/**
 * @public
 */
export type InlineWatchSourceTuple<T extends WatchSource[]> = {
  [K in keyof T]: T[K] extends Ref<infer U> | Computed<infer U>
    ? U
    : T[K] extends () => infer U
    ? U
    : unknown;
};

/**
 * @public
 */
export type WatchCallback<T extends WatchSource[]> = (
  newValues: InlineWatchSourceTuple<T>,
  oldValues: InlineWatchSourceTuple<T>
) => void;

/**
 * @public
 */
export interface WatchOptions {
  immediate?: boolean;
}
