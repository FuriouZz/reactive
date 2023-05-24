import { batch, createEffect, createRefSignal } from "../lib/entries/index.js";

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
