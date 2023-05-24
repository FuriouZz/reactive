import { createReactive } from "../lib/index.js";

class Vector2 {
  x = 0;
  y = 0;

  set(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  setScalar(value: number) {
    this.set(value, value);
  }
}

test("createReactive()", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { createEffect } = vec2.$store;

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  vec2.x = 10;
  vec2.y = 10;
  vec2.set(20, 20);
  vec2.setScalar(30);

  expect(onChange).toHaveBeenCalledTimes(7);
  expect(onChange).toHaveBeenNthCalledWith(1, `0 0`);
  expect(onChange).toHaveBeenNthCalledWith(2, `10 0`);
  expect(onChange).toHaveBeenNthCalledWith(3, `10 10`);
  expect(onChange).toHaveBeenNthCalledWith(4, `20 10`);
  expect(onChange).toHaveBeenNthCalledWith(5, `20 20`);
  expect(onChange).toHaveBeenNthCalledWith(6, `30 20`);
  expect(onChange).toHaveBeenNthCalledWith(7, `30 30`);
});

test("createReactive() + batch()", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { createEffect, batchUpdate } = vec2.$store;

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batchUpdate(() => {
    vec2.x = 10;
    vec2.y = 10;
  });

  batchUpdate(() => {
    vec2.set(20, 20);
  });

  batchUpdate(() => {
    vec2.setScalar(30);
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, `0 0`);
  expect(onChange).toHaveBeenNthCalledWith(2, `10 10`);
  expect(onChange).toHaveBeenNthCalledWith(3, `20 20`);
  expect(onChange).toHaveBeenNthCalledWith(4, `30 30`);
});

test("createReactive() + $update()", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { createEffect, batchUpdate } = vec2.$store;

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batchUpdate({ x: 45 });
  batchUpdate({ y: 15 });
  batchUpdate(() => {
    const y = vec2.x / 2;
    const x = y * 1.5;
    vec2.set(x, y);
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, `0 0`);
  expect(onChange).toHaveBeenNthCalledWith(2, `45 0`);
  expect(onChange).toHaveBeenNthCalledWith(3, `45 15`);
  expect(onChange).toHaveBeenNthCalledWith(4, `33.75 22.5`);
});

test("createReactive() + $on()", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { createEffect, batchUpdate } = vec2.$store;

  const unsubscribe = createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batchUpdate({ x: 10, y: 10 });
  batchUpdate({ x: 20, y: 20 });
  unsubscribe();
  batchUpdate({ x: 30, y: 30 });

  expect(onChange).toHaveBeenCalledTimes(3);
});

test("createReactive() + $on() + $off()", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { createEffect, disposeEffect, batchUpdate } = vec2.$store;

  const subscriber = () => onChange(`${vec2.x} ${vec2.y}`);

  createEffect(subscriber);

  batchUpdate({ x: 10, y: 10 });
  batchUpdate({ x: 20, y: 20 });
  disposeEffect(subscriber);
  batchUpdate({ x: 30, y: 30 });

  expect(onChange).toHaveBeenCalledTimes(3);
});

test("createReactive() + $change", () => {
  const onChange = jest.fn();
  const vec2 = createReactive(new Vector2());
  const { subscribers } = vec2.$store;

  const subscriber = () => onChange(`${vec2.x} ${vec2.y}`);
  subscribers.add(subscriber);

  vec2.set(10, 10);
  vec2.setScalar(20);
  subscribers.delete(subscriber);
  vec2.setScalar(30);

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, `10 0`);
  expect(onChange).toHaveBeenNthCalledWith(2, `10 10`);
  expect(onChange).toHaveBeenNthCalledWith(3, `20 10`);
  expect(onChange).toHaveBeenNthCalledWith(4, `20 20`);
});
