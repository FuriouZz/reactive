import { computed, reactive, watch } from "../lib";

test("reactive inside reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position,
    size: { x: 0, y: 0 },
  });

  const onChange = jest.fn();

  watch(() => {
    onChange(object.position.x, object.position.y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 0, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(3, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(4, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(5, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(6, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(7, 20, 10);
  expect(onChange).toBeCalledTimes(7);
});

test("reactive inside reactive (optimized)", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position,
    size: { x: 0, y: 0 },
  });

  const onChange = jest.fn();

  const pos = object.position;
  watch(() => {
    onChange(pos.x, pos.y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 0, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(3, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(4, 20, 10);
  expect(onChange).toBeCalledTimes(4);
});

test("reactive inside computed inside reactive", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position: {
      x: computed(
        () => position.x,
        (v) => (position.x = v)
      ),
      y: computed(() => position.y),
    },
    size: { x: 0, y: 0 },
  });

  const onChange = jest.fn();

  watch(() => {
    onChange(object.position.x, object.position.y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 0, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(3, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(4, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(5, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(6, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(7, 20, 10);
  expect(onChange).toBeCalledTimes(7);
});

test("reactive inside computed inside reactive (optimzed)", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    position: {
      x: computed(
        () => position.x,
        (v) => (position.x = v)
      ),
      y: computed(() => position.y),
    },
    size: { x: 0, y: 0 },
  });

  const onChange = jest.fn();

  const pos = object.position;
  watch(() => {
    onChange(pos.x, pos.y);
  });

  position.x = 10;
  position.y = 10;
  object.position.x = 20;

  expect(onChange).toHaveBeenNthCalledWith(1, 0, 0);
  expect(onChange).toHaveBeenNthCalledWith(2, 10, 0);
  expect(onChange).toHaveBeenNthCalledWith(3, 10, 10);
  expect(onChange).toHaveBeenNthCalledWith(4, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(5, 20, 10);
  expect(onChange).toHaveBeenNthCalledWith(6, 20, 10);
  expect(onChange).toBeCalledTimes(6);
});
