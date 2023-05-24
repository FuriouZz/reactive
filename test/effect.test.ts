import {
  batch,
  createEffect,
  createMemo,
  createSignal,
} from "../lib/entries/index.js";

test("createEffect()", () => {
  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");
  const [punctuation, setPunctuation] = createSignal("");

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

test("Update inside createEffect()", () => {
  const onChange = jest.fn();

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
  const onChange = jest.fn();

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
  const onChange = jest.fn();

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
