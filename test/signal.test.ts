import { batch, createEffect, createSignal } from "../lib/entries/index.js";

test("createSignal()", () => {
  const [message, setMessage] = createSignal("Hello World");

  const result1 = message();
  setMessage("¡Hola Pablo!");
  const result2 = message();

  expect(result1).toBe("Hello World");
  expect(result2).toBe("¡Hola Pablo!");
});

test("batch() updates", () => {
  const onChange = jest.fn();

  const [greeting, setGreeting] = createSignal("Hello");
  const [who, setWho] = createSignal("World");

  createEffect(() => {
    onChange(`${greeting()} ${who()}`);
  });

  batch(() => {
    setGreeting("¡Hola");
    setWho("Pablo!");
  })();

  expect(onChange).toHaveBeenCalledTimes(2);
  expect(onChange).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChange).toHaveBeenNthCalledWith(2, "¡Hola Pablo!");
});
