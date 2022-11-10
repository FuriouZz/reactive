import {
  computed,
  watch,
  watchKeys,
  reactive,
  toRef,
  watchSources,
  watchEffect,
} from "../lib/reactive";

test("watch", () => {
  const o = reactive({ message: "Hello World" });
  const onChangeTrigger = jest.fn();

  watch(o, () => {
    onChangeTrigger(o.message);
  });

  o.message = "Hello John";

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenCalledTimes(1);
});

test("watch event", () => {
  const o = reactive({ message: "Hello World", count: 0 });
  const onChangeTrigger = jest.fn();

  watch(o, (_, e) => {
    onChangeTrigger(e.key);
  });

  o.message = "Hello John";
  o.count++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "message");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, "count");
  expect(onChangeTrigger).toHaveBeenCalledTimes(2);
});

test("watchSources", () => {
  const onChangeTrigger = jest.fn();
  const o = reactive({ message: "Hello World" });

  watchSources([() => o.message], ([message]) => {
    onChangeTrigger(message);
  });

  o.message = "Hello John";

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenCalledTimes(1);
});

test("watchEffect", () => {
  const onChangeTrigger = jest.fn();
  const o = reactive({ message: "Hello World" });

  watchEffect(() => {
    onChangeTrigger(o.message);
  });

  o.message = "Hello John";

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello World");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, "Hello John");
  expect(onChangeTrigger).toHaveBeenCalledTimes(2);
});

test("watchKeys", () => {
  const onChangeTrigger = jest.fn();
  const o = reactive({ message: "Hello World", count: 0 });

  watchKeys(o, ["message"], ([message]) => {
    onChangeTrigger(message);
  });

  o.message = "Hello John";

  watchKeys(o, ["count"], ([count]) => {
    onChangeTrigger(count);
  });

  o.count++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onChangeTrigger).toHaveBeenCalledTimes(2);
});

test("watch with filter", () => {
  const onChangeTrigger = jest.fn();
  const o = reactive({ message: "Hello World", count: 0 });

  watch(
    o,
    (_, e) => {
      onChangeTrigger(e.newValue);
    },
    { filter: ["message"] }
  );

  o.message = "Hello John";
  o.count++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenCalledTimes(1);
});

test("watch computed and toRef", () => {
  const position = reactive({ x: 0, enabled: false, y: 0 });
  const x = toRef(position, "x");
  const enabled = computed(() => position.enabled);

  const onChangeTrigger = jest.fn();

  watchSources([x, () => position.y, enabled], ([x, y, enabled]) => {
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

  watchSources([x, () => object.position.y, enabled], ([x, y, enabled]) => {
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
