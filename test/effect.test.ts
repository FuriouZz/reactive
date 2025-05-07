import { assert, expect, test, vi } from "vitest";
import { batch, createEffect, createMemo, createSignal, getRootScope, on, untrack } from "../src/index.js";

test("createEffect()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");
  const [punctuation, setPunctuation] = createSignal("");

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  setPunctuation("!");
  setWho("Pablo");
  setGreeting("¡Hola");

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello World!");
  expect(onChange).toHaveBeenNthCalledWith(3, "Hello Pablo!");
  expect(onChange).toHaveBeenNthCalledWith(4, "¡Hola Pablo!");
});

test("Update inside createEffect()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");
  const [punctuation, setPunctuation] = createSignal("");

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  createEffect(() => {
    setWho("Pablo");
    setGreeting("¡Hola");
    setPunctuation("!");
  });

  expect(onChange).toHaveBeenCalledTimes(4);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello Pablo");
  expect(onChange).toHaveBeenNthCalledWith(3, "¡Hola Pablo");
  expect(onChange).toHaveBeenNthCalledWith(4, "¡Hola Pablo!");
});

test("Update inside createEffect() with batch()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");
  const [punctuation, setPunctuation] = createSignal("");

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  createEffect(() => {
    batch(() => {
      setWho("Pablo");
      setGreeting("¡Hola");
      setPunctuation("!");
    });
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("createMemo()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");

  const message = createMemo(() => {
    const value = `${greeting()} ${who()}`;
    onChange(value);
    return value;
  });

  setWho("Pablo!");
  setGreeting("¡Hola");

  const result = message();
  expect(result).toBe("¡Hola Pablo!");

  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello Pablo!");
  expect(onChange).toHaveBeenNthCalledWith(3, "¡Hola Pablo!");
});

test("untrack()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");

  const message = createMemo(() => {
    const value = `${greeting()} ${untrack(who)}`;
    onChange(value);
    return value;
  });

  setWho("Pablo!");
  setGreeting("¡Hola");

  const result = message();
  expect(result).toBe("¡Hola Pablo!");

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("on()", () => {
  const onChange = vi.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");

  const message = createMemo(
    on(greeting, () => {
      const value = `${greeting()} ${who()}`;
      onChange(value);
      return value;
    }),
  );

  setWho("Pablo!");
  setGreeting("¡Hola");

  const result = message();
  expect(result).toBe("¡Hola Pablo!");

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("errors are not catched", () => {
  assert.throws(() => {
    createEffect(() => {
      throw new Error("Trigger an error");
    });
  }, Error);
});
