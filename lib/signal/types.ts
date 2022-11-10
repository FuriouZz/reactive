/**
 * @public
 */
export type Effect<T = unknown> = (value: T) => T;

/**
 * @public
 */
export type Subscriber = () => void;

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
