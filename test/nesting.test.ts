import { computed, reactive, watch } from "../lib/reactive";

test("reactive inside reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position,
    size: { width: 0, height: 0 },
  });

  const onChange = jest.fn();

  watch([() => object.position.x, () => object.position.y], ([x, y]) => {
    onChange(x, y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(3, 20, 10);
  expect(onChange).toBeCalledTimes(3);
});

test.only("reactive inside computed inside reactive", () => {
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

  watch([() => object.position.x, () => object.position.y], ([x, y]) => {
    onChange(x, y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(3, 20, 10);
  expect(onChange).toBeCalledTimes(3);
});
