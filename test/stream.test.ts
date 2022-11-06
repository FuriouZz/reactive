import { stream, reactive, toRef, watch } from "../lib";

test("pipe", () => {
  const onChangeTrigger = jest.fn();

  const size = reactive({ width: 100, height: 100 });
  const width = toRef(size, "width");

  const value = stream([width])
    .pipe(([width]) => [width * 0.5])
    .pipe(([width]) => String(width))
    .pipe((width) => width + "px")
    .ref();

  watch(
    [value],
    ([v]) => {
      onChangeTrigger(v);
    },
    { immediate: true }
  );

  size.width = 300;
  size.width = 200;
  size.width = 150;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "50px");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, "150px");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, "100px");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, "75px");
  expect(onChangeTrigger).toHaveBeenCalledTimes(4);
});
