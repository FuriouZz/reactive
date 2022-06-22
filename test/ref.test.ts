import {
  reactive,
  watch,
  onChange,
  onKeyChange,
  ref,
  triggerChange,
} from "../lib";

test("ref", (done) => {
  const r = ref(0);

  watch(() => {
    if (r.value === 0) {
      expect(r.value).toBe(0);
    } else {
      expect(r.value).toBe(1);
      done();
    }
  });

  r.value++;
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

  onChange(rectangle, () => {
    onRectangleChange({ ...rectangle });
  });

  onKeyChange(rectangle, ["x", "y", "width", "height"], (event) => {
    onRectangleKeyChange(event);
    if (event.key === "x" || event.key === "y") {
      moved.value = true;
    } else {
      resized.value = true;
    }
  });

  onChange(moved, () => {
    onMovedChange(moved.value);
  });

  onChange(resized, () => {
    onResizedChange(resized.value);
  });

  rectangle.width = 800;
  rectangle.height = 600;
  rectangle.x = 10;

  expect(onResizedChange).toHaveBeenCalledTimes(0);

  // Trigger change on lazy ref
  triggerChange(resized);

  expect(onResizedChange).toHaveBeenCalledTimes(1);
  expect(onMovedChange).toHaveBeenCalledTimes(1);

  expect(onRectangleChange).toHaveBeenNthCalledWith(1, {
    width: 800,
    height: 0,
    x: 0,
    y: 0,
  });
  expect(onRectangleChange).toHaveBeenNthCalledWith(2, {
    width: 800,
    height: 600,
    x: 0,
    y: 0,
  });
  expect(onRectangleChange).toHaveBeenNthCalledWith(3, {
    width: 800,
    height: 600,
    x: 10,
    y: 0,
  });
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
});
