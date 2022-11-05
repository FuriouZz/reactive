import { computed, reactive } from "../lib";

test("computed", () => {
  const o = reactive({ name: "World" });
  const c = computed(() => `Hello ${o.name}`);
  expect(c.value).toBe("Hello World");

  o.name = "John";
  expect(c.value).toBe("Hello John");
  expect(() => {
    // @ts-ignore
    c.value = "Hello Folks!";
  }).toThrow();
});

test("computed inside reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    x: computed(
      () => position.x,
      (x) => (position.x = x)
    ),
    y: computed(() => position.y),
  });

  expect(object.x).toBe(0);
  object.x = 1;
  expect(object.x).toBe(1);
  expect(() => {
    object.y = 1;
  }).toThrow();
});
