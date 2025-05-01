import { batch, createEffect } from "@furiouzz/reactive";
import { expect, test, vi } from "vitest";
import { createAtom } from "../src/index.js";

test("createAtom()", () => {
  const message = createAtom("Hello World");

  const result1 = message();
  const result2 = message("¡Hola Pablo!");

  expect(result1).toBe("Hello World");
  expect(result2).toBe("¡Hola Pablo!");
});

test("createEffect()", () => {
  const greeting = createAtom("Hello");
  const who = createAtom("World");
  const punctuation = createAtom("");

  const onChange = vi.fn();

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  punctuation("!");
  who("Pablo");
  greeting("¡Hola");

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello World!");
  expect(onChange).toHaveBeenNthCalledWith(3, "Hello Pablo!");
  expect(onChange).toHaveBeenNthCalledWith(4, "¡Hola Pablo!");
});

test("Update signal inside createEffect()", () => {
  const onChange = vi.fn();

  const greeting = createAtom("Hello");
  const who = createAtom("World");
  const punctuation = createAtom("");

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  createEffect(() => {
    who("Pablo");
    greeting("¡Hola");
    punctuation("!");
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello Pablo");
  expect(onChange).toHaveBeenNthCalledWith(3, "¡Hola Pablo");
  expect(onChange).toHaveBeenNthCalledWith(4, "¡Hola Pablo!");
});

test("batch() updates", () => {
  const onChange = vi.fn();

  const greeting = createAtom("Hello");
  const who = createAtom("World");

  createEffect(() => {
    onChange(`${greeting()} ${who()}`);
  });

  batch(() => {
    greeting("¡Hola");
    who("Pablo!");
  })();

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});
