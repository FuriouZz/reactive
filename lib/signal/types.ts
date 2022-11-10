export type Effect<T = unknown> = (value: T) => T;

export type Subscriber = () => void;

export interface Stream<Source, Result = Source> {
  pipe<Output>(
    transform: (source: Result) => Output
  ): ReadStream<Result, Output>;
}

export type WithPipe<T, Source, Result = Source> = T & {
  pipe<Output>(
    transform: (source: Result) => Output
  ): ReadStream<Result, Output>;
};

export interface ReadStream<Source, Result> extends Stream<Source, Result> {
  read(): Result;
}

export interface WriteStream<Source, Result> extends Stream<Source, Result> {
  write(source: Source): void;
}
