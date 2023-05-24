import {
  batch,
  createAtom,
  createEffect,
  createMemo,
  createSignal,
} from "../lib/index.js";

test("createSignal()", () => {
  const [message, setMessage] = createSignal("Hello World");

  const result1 = message();
  setMessage("¡Hola Pablo!");
  const result2 = message();

  expect(result1).toBe("Hello World");
  expect(result2).toBe("¡Hola Pablo!");
});

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

  const onChange = jest.fn();

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
  const onChange = jest.fn();

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

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("batch() updates", () => {
  const onChange = jest.fn();

  const greeting = createAtom("Hello");
  const who = createAtom("World");

  createEffect(() => {
    onChange(`${greeting()} ${who()}`);
  });

  batch(() => {
    greeting("¡Hola");
    who("Pablo!");
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("createMemo()", () => {
  const onChange = jest.fn();

  const greeting = createAtom("Hello");
  const who = createAtom("World");

  const message = createMemo(() => {
    const value = `${greeting()} ${who()}`;
    onChange(value);
    return value;
  });

  who("Pablo!");
  greeting("¡Hola");

  const result = message();
  expect(result).toBe("¡Hola Pablo!");

  expect(onChange).toHaveBeenCalledTimes(3);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "Hello Pablo!");
  expect(onChange).toHaveBeenNthCalledWith(3, "¡Hola Pablo!");
});
