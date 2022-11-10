import { computed, reactive, ref, watch } from "../lib/reactive";

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

test("watch computed", () => {
  const onChange = jest.fn();
  const position = reactive({ x: 0, y: 0 });
  const x = computed(() => position.x);

  watch(x, (x) => {
    // console.log(x);
    onChange(x);
  });

  position.x = 10;

  expect(onChange).toHaveBeenNthCalledWith(1, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10);
  expect(onChange).toBeCalledTimes(2);
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
