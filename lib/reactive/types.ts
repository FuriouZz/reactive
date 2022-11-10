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
  type?: ReactiveType;
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
 * @public
 */
 export type ChangeListener = (event: ChangeEvent) => void;

export type ReactiveType = "reactive" | "reference" | "computed"

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
   *
   */
  type: ReactiveType;

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
  trigger: <K extends keyof TTarget>(key?: K | "$target", newValue?: TTarget[K], oldValue?: TTarget[K]) => void;

  /**
   * List of observable watched by the root observable
   */
  dependencies: Set<InternalObservable>;
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
}, {
  $invalidate(): void
}>;

/**
 * @public
 */
export type Readonly<T> = Observable<{ readonly value: T }, {
  $invalidate(): void
}>;

/**
 * @public
 */
export interface WatchDependency {
  observable: InternalObservable;
  deps: InternalObservable[];
}

/**
 * @public
 */
export interface WatchContext {
  id: number;
  listening: boolean;
  dependencies: WatchDependency[];
}

/**
 * @public
 */
export type WatchSource<T = unknown> = Ref<T> | Computed<T> | (() => T);

export type InlineWatchSource<T> = T extends Ref<infer U> | Computed<infer U> ? U : T extends () => infer U ? U : T

/**
 * @public
 */
export type InlineWatchSourceTuple<T extends WatchSource[]> = {
  [K in keyof T]: InlineWatchSource<T[K]>;
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
  caller?: any;
  immediate?: boolean;
}

export type MapTuple<T, Tuple extends [...any[]]> = {
  [K in keyof Tuple]: T[Tuple[K]];
} & { length: Tuple["length"] };
