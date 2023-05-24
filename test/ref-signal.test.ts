import {
  batch,
  createEffect,
  createMemo,
  createRefSignal,
} from "../lib/entries/index.js";

test("createRefSignal()", () => {
  const target = { message: "Hello World" };
  const [message, setMessage] = createRefSignal(target, "message");

  const result1 = message();
  setMessage("¡Hola Pablo!");
  const result2 = message();

  expect(result1).toBe("Hello World");
  expect(result2).toBe("¡Hola Pablo!");
  expect(target.message).toBe("¡Hola Pablo!");
});

test("createEffect()", () => {
  const target = { greeting: "Hello", who: "World", punctuation: "" };
  const [greeting, setGreeting] = createRefSignal(target, "greeting");
  const [who, setWho] = createRefSignal(target, "who");
  const [punctuation, setPunctuation] = createRefSignal(target, "punctuation");

  const onChange = jest.fn();

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

test("Update signal inside createEffect()", () => {
  const onChange = jest.fn();

  const target = { greeting: "Hello", who: "World", punctuation: "" };
  const [greeting, setGreeting] = createRefSignal(target, "greeting");
  const [who, setWho] = createRefSignal(target, "who");
  const [punctuation, setPunctuation] = createRefSignal(target, "punctuation");

  createEffect(() => {
    onChange(`${greeting()} ${who()}${punctuation()}`);
  });

  createEffect(() => {
    setWho("Pablo");
    setGreeting("¡Hola");
    setPunctuation("!");
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("batch() updates", () => {
  const onChange = jest.fn();

  const target = { greeting: "Hello", who: "World" };
  const [greeting, setGreeting] = createRefSignal(target, "greeting");
  const [who, setWho] = createRefSignal(target, "who");

  createEffect(() => {
    onChange(`${greeting()} ${who()}`);
  });

  batch(() => {
    setGreeting("¡Hola");
    setWho("Pablo!");
  });

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});

test("createMemo()", () => {
  const onChange = jest.fn();

  const target = { greeting: "Hello", who: "World" };
  const [greeting, setGreeting] = createRefSignal(target, "greeting");
  const [who, setWho] = createRefSignal(target, "who");

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
