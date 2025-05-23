import { batch, createEffect } from "@furiouzz/reactive";
import { expect, test, vi } from "vitest";
import { createReactive } from "../src/index.js";

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
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  vec2.x = 10;
  vec2.y = 10;
  vec2.set(20, 20);
  vec2.setScalar(30);

  expect(onChange).toHaveBeenCalledTimes(7);
  expect(onChange).toHaveBeenNthCalledWith(1, "0 0");
  expect(onChange).toHaveBeenNthCalledWith(2, "10 0");
  expect(onChange).toHaveBeenNthCalledWith(3, "10 10");
  expect(onChange).toHaveBeenNthCalledWith(4, "20 10");
  expect(onChange).toHaveBeenNthCalledWith(5, "20 20");
  expect(onChange).toHaveBeenNthCalledWith(6, "30 20");
  expect(onChange).toHaveBeenNthCalledWith(7, "30 30");
});

test("createEffect()", () => {
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange).toHaveBeenNthCalledWith(1, "0 0");
});

test("batchUpdate()", () => {
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batch(() => {
    vec2.x = 10;
    vec2.y = 10;
  });

  batch(() => {
    vec2.set(20, 20);
  });

  batch(() => {
    vec2.setScalar(30);
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "0 0");
  expect(onChange).toHaveBeenNthCalledWith(2, "10 10");
  expect(onChange).toHaveBeenNthCalledWith(3, "20 20");
  expect(onChange).toHaveBeenNthCalledWith(4, "30 30");
});

test("batchUpdate() (2)", () => {
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());
  const { batchUpdate } = vec2.$store;

  createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batchUpdate({ x: 45 });
  batchUpdate({ y: 15 });
  batch(({ trigger }) => {
    vec2.y = vec2.x / 2;
    trigger("update"); // force vec2.y to be updated
    vec2.x = vec2.y * 1.5;
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "0 0");
  expect(onChange).toHaveBeenNthCalledWith(2, "45 0");
  expect(onChange).toHaveBeenNthCalledWith(3, "45 15");
  expect(onChange).toHaveBeenNthCalledWith(4, "33.75 22.5");
});

test("dispose createEffect()", () => {
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());
  const { batchUpdate } = vec2.$store;

  const unsubscribe = createEffect(() => {
    onChange(`${vec2.x} ${vec2.y}`);
  });

  batchUpdate({ x: 10, y: 10 });
  batchUpdate({ x: 20, y: 20 });
  unsubscribe();
  batchUpdate({ x: 30, y: 30 });

  expect(onChange).toHaveBeenCalledTimes(3);
});

test("add/remove subscribers", () => {
  const onChange = vi.fn();
  const vec2 = createReactive(new Vector2());

  const unsubscribe = createEffect(() => onChange(`${vec2.x} ${vec2.y}`));

  vec2.set(10, 10);
  vec2.setScalar(20);
  unsubscribe();
  vec2.setScalar(30);

  expect(onChange).toHaveBeenCalledTimes(5);
  expect(onChange).toHaveBeenNthCalledWith(1, "0 0");
  expect(onChange).toHaveBeenNthCalledWith(2, "10 0");
  expect(onChange).toHaveBeenNthCalledWith(3, "10 10");
  expect(onChange).toHaveBeenNthCalledWith(4, "20 10");
  expect(onChange).toHaveBeenNthCalledWith(5, "20 20");
});

test("batch updates", () => {
  const onChange = vi.fn();

  const state = createReactive({ message: "Hello World" });

  createEffect(() => {
    state.message;
    onChange();
  });

  batch(() => {
    state.message = "Bonjour François Dupont";
    state.message = "¡Hola Pablo!";
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(state.message).toEqual("¡Hola Pablo!");
});

test("batch updates for two values", () => {
  const onChange = vi.fn();

  const state = createReactive({ x: 0, y: 0 });

  createEffect(() => {
    state.x;
    state.y;
    onChange();
  });

  batch(({ trigger: apply }) => {
    state.x = 10;
    state.y = 10;
    apply("update");
    state.x += 10;
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(`${state.x} ${state.y}`).toEqual("20 10");
});
