import {
  reactive,
  watch,
  watchKeys,
  ref,
  triggerChange,
} from "../lib/reactive";

test("ref", () => {
  const onChangeTrigger = jest.fn();
  const r = ref(0);

  watch(r, (r) => {
    onChangeTrigger(r);
  });

  r.value++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 1);
  expect(onChangeTrigger).toHaveBeenCalledTimes(1);
});

test("lazyRef", () => {
  const onRectangleChange = jest.fn();
  const onRectangleKeyChange = jest.fn();
  const onResizedChange = jest.fn();
  const onMovedChange = jest.fn();

  const rectangle = reactive({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  const resized = ref(false, { lazy: true });
  const moved = ref(false);

  watchKeys(rectangle, ["x", "y"], () => {
    moved.value = true;
  });

  watchKeys(rectangle, ["width", "height"], () => {
    resized.value = true;
  });

  watch(moved, (v) => onMovedChange(v));
  watch(resized, (v) => onResizedChange(v));
  watch(rectangle, (v, e) => {
    onRectangleChange(v);
    onRectangleKeyChange(e);
  });

  rectangle.width = 800;
  rectangle.height = 600;
  rectangle.x = 10;

  expect(onResizedChange).toHaveBeenCalledTimes(0);

  // Trigger change on lazy ref
  triggerChange(resized, "value");

  expect(onResizedChange).toHaveBeenCalledTimes(1);
  expect(onMovedChange).toHaveBeenCalledTimes(1);

  expect(onRectangleChange).toHaveBeenNthCalledWith(1, {
    width: 800,
    height: 600,
    x: 10,
    y: 0,
  });
  expect(onRectangleChange).toHaveBeenNthCalledWith(2, {
    width: 800,
    height: 600,
    x: 10,
    y: 0,
  });
  expect(onRectangleChange).toHaveBeenNthCalledWith(3, {
    width: 800,
    height: 600,
    x: 10,
    y: 0,
  });
  expect(onRectangleChange).toHaveBeenCalledTimes(3);

  expect(onRectangleKeyChange).toHaveBeenNthCalledWith(1, {
    key: "width",
    oldValue: 0,
    newValue: 800,
  });
  expect(onRectangleKeyChange).toHaveBeenNthCalledWith(2, {
    key: "height",
    oldValue: 0,
    newValue: 600,
  });
  expect(onRectangleKeyChange).toHaveBeenNthCalledWith(3, {
    key: "x",
    oldValue: 0,
    newValue: 10,
  });
  expect(onRectangleKeyChange).toHaveBeenCalledTimes(3);
});

test("watch reference", () => {
  const onChange = jest.fn();
  const x = ref(0);
  const position = reactive({ x, y: 0 });

  watch(x, (x) => {
    // console.log(x);
    onChange(x);
  });

  position.x = 10;

  expect(onChange).toHaveBeenNthCalledWith(1, 10);
  expect(onChange).toBeCalledTimes(1);
});
