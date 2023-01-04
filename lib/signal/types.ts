/**
 * @public
 */
export type Effect<T = unknown> = (oldValue: T) => T;

/**
 * @public
 */
export type Subscriber<T> = (newValue: T, oldValue: T | undefined) => void;

/**
 * @public
 */
export interface Stream<Source, Result = Source> {
  pipe<Output>(
    transform?: (source: Result) => Output
  ): ReadStream<Result, Output>;
}

/**
 * @public
 */
export interface ReadStream<Source, Result> extends Stream<Source, Result> {
  read(): Result;
}

/**
 * @public
 */
export interface WriteStream<Source, Result> extends Stream<Source, Result> {
  write(source: Source): void;
}

/**
 * @public
 */
export type Signal<T> = [() => T, (value: T) => void];

/**
 * @public
 */
export interface SignalOptions<Value> {
  equals?: boolean | ((newValue: Value, oldValue: Value) => boolean);
}

/**
 * @public
 */
export interface Atom<T> {
  (): T;
  (value: T): T;
}

/**
 * @public
 */
export interface Observable<T> {
  (): T;
  (value: T): T;
  subscribe(subscriber: Subscriber<T>, caller?: any): () => void;
  unsubscribe(subscriber: Subscriber<T>): void;
  clear(): void;
}
