import { test, vi, expect } from "vitest";
import { createEffect, createMemo } from "@furiouzz/reactive";
import { createStore, createMutableStore } from "../src/index.js";

test("createStore()", () => {
  const [state, batchUpdate] = createStore({ message: "Hello World" });

  const result1 = state.message;
  batchUpdate({ message: "¡Hola Pablo!" });
  const result2 = state.message;

  expect(result1).toEqual("Hello World");
  expect(result2).toEqual("¡Hola Pablo!");
});

test("createStore() is read-only by default", () => {
  const [state] = createStore({ message: "Hello World" });
  expect(() => {
    state.message = "¡Hola Pablo!";
  }).toThrowError(TypeError);
});

test("createMutableStore()", () => {
  const state = createMutableStore({ message: "Hello World" });

  const result1 = state.message;
  state.message = "¡Hola Pablo!";
  const result2 = state.message;

  expect(result1).toEqual("Hello World");
  expect(result2).toEqual("¡Hola Pablo!");
});

test("createStore() with getter", () => {
  const onChange = vi.fn();
  const [state, batchUpdate] = createStore({
    greeting: "Hello",
    who: "World",
    get message() {
      const value = `${this.greeting} ${this.who}`;
      onChange(value);
      return value;
    },
  });

  createEffect(() => state.message);

  const result1 = state.message;
  batchUpdate({ greeting: "¡Hola", who: "Pablo!" });
  const result2 = state.message;

  expect(onChange).toHaveBeenCalledTimes(5);
  expect(result1).toEqual("Hello World");
  expect(result2).toEqual("¡Hola Pablo!");
});

test("createStore() with getter + memo", () => {
  const onChange = vi.fn();

  const [state, batchUpdate] = createStore({
    greeting: "Hello",
    who: "World",
    get message() {
      return message();
    },
  });

  const message = createMemo(() => {
    const value = `${state.greeting} ${state.who}`;
    onChange(value);
    return value;
  });

  const result1 = state.message;
  batchUpdate({ greeting: "¡Hola", who: "Pablo!" });
  const result2 = state.message;

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(result1).toEqual("Hello World");
  expect(result2).toEqual("¡Hola Pablo!");
});

test("Store + Effect (Deep)", () => {
  const onChange = vi.fn();

  const [state, batchUpdate] = createStore({
    greeting: "Hello",
    user: { firstname: "John", lastname: "Doe" },
  });

  const fullname = createMemo(
    () => `${state.greeting} ${state.user.firstname} ${state.user.lastname}!`
  );

  createEffect(() => onChange(fullname()));

  batchUpdate({ greeting: "Bonjour" });
  batchUpdate({ user: { firstname: "Francis" } });
  batchUpdate({ user: { firstname: "Francis" } });

  batchUpdate({ user: { lastname: "Dupont" } });

  batchUpdate({
    greeting: "Hola",
    user: { firstname: "Pablo", lastname: "Escobar" },
  });

  expect(onChange).toHaveBeenNthCalledWith(1, "Hello John Doe!");
  expect(onChange).toHaveBeenNthCalledWith(2, "Bonjour John Doe!");
  expect(onChange).toHaveBeenNthCalledWith(3, "Bonjour Francis Doe!");
  expect(onChange).toHaveBeenNthCalledWith(4, "Bonjour Francis Dupont!");
  expect(onChange).toHaveBeenNthCalledWith(5, "Hola Pablo Escobar!");
});

test("Store + Effect (Deep) + undefined", () => {
  const onChange = vi.fn();

  const [state, batchUpdate] = createStore<{
    greeting: string;
    user?: {
      firstname: string;
      lastname: string;
    };
  }>({
    greeting: "Hello",
    user: { firstname: "John", lastname: "Doe" },
  });

  const fullname = createMemo(() => {
    if (state.user) {
      return `${state.greeting} ${state.user.firstname} ${state.user.lastname}!`;
    }
    return `${state.greeting}!`;
  });

  createEffect(() => {
    onChange(fullname());
  });

  batchUpdate({ user: undefined });
  batchUpdate({ user: { firstname: "Pablo" } });
  batchUpdate({ user: { firstname: "Pablo" } });
  batchUpdate({ user: { lastname: "Escobar" } });
  batchUpdate({
    greeting: "Bonjour",
    user: { firstname: "Francis", lastname: "Dupont" },
  });
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello John Doe!");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello!");
  expect(onChange).toHaveBeenNthCalledWith(3, "Hello Pablo undefined!");
  expect(onChange).toHaveBeenNthCalledWith(4, "Hello Pablo Escobar!");
  expect(onChange).toHaveBeenNthCalledWith(5, "Bonjour Francis Dupont!");
});
