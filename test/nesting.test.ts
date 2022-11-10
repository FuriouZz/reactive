import { computed, reactive, ref, watchKeys } from "../lib/reactive";

test("nesting reactive.reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position,
    size: { width: 0, height: 0 },
  });

  const onChange = jest.fn();

  watchKeys(object.position, ["x", "y"], (v) => {
    onChange(v);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, [10, 0]);
  expect(onChange).toHaveBeenNthCalledWith(2, [10, 10]);
  expect(onChange).toHaveBeenNthCalledWith(3, [20, 10]);
  expect(onChange).toBeCalledTimes(3);
});

test("nesting reactive.ref.reactive", () => {
  const x = ref(0);
  const y = ref(0);
  const object = reactive({
    position: { x, y },
    size: { width: 0, height: 0 },
  });

  const onChange = jest.fn();

  watchKeys(object.position, ["x", "y"], (v) => {
    onChange(v);
  });

  x.value = 10;
  y.value = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, [10, 0]);
  expect(onChange).toHaveBeenNthCalledWith(2, [10, 10]);
  expect(onChange).toHaveBeenNthCalledWith(3, [20, 10]);
  expect(onChange).toBeCalledTimes(3);
});

test("nesting reactive.computed.reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position: {
      x: computed(
        () => position.x,
        (v) => (position.x = v)
      ),
      y: computed(() => position.y),
    },
    size: { width: 0, height: 0 },
  });

  const onChange = jest.fn();

  watchKeys(object.position, ["x", "y"], (v) => {
    onChange(v);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, [10, 0]);
  expect(onChange).toHaveBeenNthCalledWith(2, [10, 10]);
  expect(onChange).toHaveBeenNthCalledWith(3, [20, 10]);
  expect(onChange).toBeCalledTimes(3);
});
