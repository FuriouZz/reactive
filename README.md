# Reactive <!-- omit in toc -->

Exploration of reactivity with API similar to [SolidJS](https://www.solidjs.com/)

- [Examples](#examples)
- [Atom](#atom)
- [Store](#store)
- [Reactive](#reactive)

## Examples

```ts
import { batch, createEffect, createSignal } from "@furiouzz/reactive";

const [greeting, setGreeting] = createSignal("Hello");
const [who, setWho] = createSignal("World");
const [punctuation, setPunctuation] = createSignal("");

// Listen signals changes
createEffect(() => {
  console.log(`${greeting()} ${who()}${punctuation()}`);
});

// Batch updates & side effects
batch(() => {
  setWho("Pablo");
  setGreeting("¡Hola");
  setPunctuation("!");
});
```

## Atom

```ts
import { batch, createEffect, createSignal } from "@furiouzz/reactive";
import { makeAtom } from "@furiouzz/reactive/atom.js";

const greeting = makeAtom(createSignal("Hello"));
const who = makeAtom(createSignal("World"));
const punctuation = makeAtom(createSignal(""));

// Listen signals changes
createEffect(() => {
  console.log(`${greeting()} ${who()}${punctuation()}`);
});

// Batch updates & side effects
batch(() => {
  who("Pablo");
  greeting("¡Hola");
  punctuation("!");
});
```

## Store

```ts
import { batch, createEffect, createMemo } from "@furiouzz/reactive";
import { createStore } from "@furiouzz/reactive/store";

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
  console.log(fullname());
});

batchUpdate({ user: undefined });
batchUpdate({ user: { firstname: "Pablo", lastname: "Escobar" } });
batchUpdate({
  greeting: "Bonjour",
  user: { firstname: "Francis", lastname: "Dupont" },
});
```

## Reactive

```ts
import { batch, createEffect, createMemo } from "@furiouzz/reactive";
import { createReactive } from "@furiouzz/reactive/store";

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

const onChange = () => console.log(`${vec2.x} ${vec2.y}`);

const vec2 = createReactive(new Vector2());
const { createEffect, batchUpdate, subscribers } = vec2.$store;

createEffect(() => {
  onChange(`${vec2.x} ${vec2.y}`);
});

subscribers.add(onChange);

batchUpdate({ x: 45 });
batchUpdate({ y: 15 });
batch(({ apply }) => {
  vec2.y = vec2.x / 2;
  apply("update"); // force vec2.y to be updated
  vec2.x = vec2.y * 1.5;
});
```
