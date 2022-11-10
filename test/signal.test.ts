import {
  createSignal,
  createEffect,
  createMemo,
  createWriteStream,
} from "../lib/signal";

test("signal", () => {
  const onChangeTrigger = jest.fn();

  const [count, setCount] = createSignal(0);
  createEffect(() => {
    onChangeTrigger(count());
  });

  setCount(1);
  setCount(count() + 1);
  setCount(count() + 1);
  setCount(count() + 1);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 3);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 4);
  expect(onChangeTrigger).toHaveBeenCalledTimes(5);
});

test("signal computed", () => {
  const onChangeTrigger = jest.fn();

  const [count, setCount] = createSignal(0);
  const result = () => count() * 2;

  createEffect(() => {
    onChangeTrigger(result());
  });

  setCount(1);
  setCount(count() + 1);
  setCount(count() + 1);
  setCount(count() + 1);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 2);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 4);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 6);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 8);
  expect(onChangeTrigger).toHaveBeenCalledTimes(5);
});

test("signal previous value", () => {
  const onChangeTrigger = jest.fn();

  const [count, setCount] = createSignal(0);

  createEffect((previousValue) => {
    const res = count() + previousValue;
    onChangeTrigger(res);
    return res;
  }, 0);

  setCount(1);
  setCount(2);
  setCount(3);
  setCount(4);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 3);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 6);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 10);
  expect(onChangeTrigger).toHaveBeenCalledTimes(5);
});

test("signal memo", () => {
  const onChangeTrigger = jest.fn();

  const [count, setCount] = createSignal(0);
  const result = createMemo(() => count() * 2);

  createEffect(() => {
    onChangeTrigger(result());
  });

  setCount(1);
  setCount(count() + 1);
  setCount(count() + 1);
  setCount(count() + 1);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 2);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 4);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 6);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 8);
  expect(onChangeTrigger).toHaveBeenCalledTimes(5);
});

test("signal pipe", () => {
  const count = createWriteStream(0);
  const result = count
    .pipe((source: number) => source * 2)
    .pipe((source) => source + 3);

  expect(result.read()).toBe(3);

  count.write(2);

  expect(result.read()).toBe(7);
});

test("signal pipe individually", () => {
  const count = createWriteStream(0);
  const multiply = count.pipe((source: number) => source * 2);
  const add = multiply.pipe((source) => source + 3);

  expect(multiply.read()).toBe(0);
  expect(add.read()).toBe(3);

  count.write(2);

  expect(multiply.read()).toBe(4);
  expect(add.read()).toBe(7);
});

test("signal listen pipe individually", () => {
  const onChangeTrigger = jest.fn();

  const count = createWriteStream(0);
  const multiply = count.pipe((source: number) => source * 2);
  const add = multiply.pipe((source) => source + 3);

  createEffect(() => {
    onChangeTrigger(multiply.read(), add.read());
  });

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0, 3);
  expect(onChangeTrigger).toHaveBeenCalledTimes(1);

  count.write(2);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 4, 7);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 4, 7);
  expect(onChangeTrigger).toHaveBeenCalledTimes(3);
});

test("signal pipe individually", () => {
  const onChangeTrigger = jest.fn();

  const count = createWriteStream(0);
  const multiply = count.pipe((source: number) => source * 2);
  const add = count.pipe((source) => source + 3);

  createEffect(() => {
    onChangeTrigger(multiply.read(), add.read());
  });

  count.write(2);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 0, 3);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 4, 3);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 4, 5);
  expect(onChangeTrigger).toHaveBeenCalledTimes(3);
});
