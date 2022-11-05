import { computed, reactive, toRef, watch } from "../lib";

test("watch computed and toRef", () => {
  const position = reactive({ x: 0, enabled: false, y: 0 });
  const x = toRef(position, "x");
  const enabled = computed(() => position.enabled);

  const onChangeTrigger = jest.fn();

  watch([x, () => position.y, enabled], ([x, y, enabled]) => {
    onChangeTrigger(x, y, enabled);
  });

  position.x = 10;
  position.x = 20;
  position.y = 20;
  position.enabled = true;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 10, 0, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 20, 0, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 20, 20, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 20, 20, true);
  expect(onChangeTrigger).toHaveBeenCalledTimes(4);
});

test("watch nested", () => {
  const position = reactive({ x: 0, y: 0 });
  const object = reactive({
    enabled: false,
    position: {
      x: computed(
        () => position.x,
        (v) => (position.x = v)
      ),
      y: computed(() => position.y),
    },
  });

  const x = computed(() => object.position.x);
  const enabled = computed(() => object.enabled);

  const onChangeTrigger = jest.fn();

  watch([x, () => object.position.y, enabled], ([x, y, enabled]) => {
    onChangeTrigger(x, y, enabled);
  });

  object.position.x = 10;
  object.position.x = 20;
  position.y = 20;
  object.enabled = true;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 10, 0, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 20, 0, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 20, 20, false);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 20, 20, true);
  expect(onChangeTrigger).toHaveBeenCalledTimes(4);
});
