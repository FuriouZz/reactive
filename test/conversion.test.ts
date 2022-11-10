import { signalToComputed, computedToSignal } from "../lib/conversion";
import { computed, ref, watch } from "../lib/reactive";
import { createSignal, createEffect } from "../lib/signal";

test("signal to computed", () => {
  const onWatchTrigger = jest.fn();
  const onEffectTrigger = jest.fn();

  const $count = createSignal(0);
  const [count, setCount] = $count;
  const c = signalToComputed($count);

  createEffect(() => {
    onEffectTrigger(count());
  });

  watch(
    [c],
    ([computed]) => {
      onWatchTrigger(computed);
    },
    { immediate: true }
  );

  setCount(1);
  c.value = 2;

  expect(onEffectTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onEffectTrigger).toHaveBeenCalledTimes(3);

  expect(onWatchTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onWatchTrigger).toHaveBeenCalledTimes(3);
});

test("computed to signal", () => {
  const onWatchTrigger = jest.fn();
  const onEffectTrigger = jest.fn();

  let value = 0;
  const c = computed(
    () => value,
    (v) => (value = v)
  );
  const [count, setCount] = computedToSignal(c);

  createEffect(() => {
    onEffectTrigger(count());
  });

  watch(
    [c],
    ([c]) => {
      onWatchTrigger(c);
    },
    { immediate: true }
  );

  setCount(1);
  c.value = 2;

  expect(onEffectTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onEffectTrigger).toHaveBeenCalledTimes(3);

  expect(onWatchTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onWatchTrigger).toHaveBeenCalledTimes(3);
});

test("ref to signal", () => {
  const onWatchTrigger = jest.fn();
  const onEffectTrigger = jest.fn();

  const c = ref(0);
  const [count, setCount] = computedToSignal(c);

  createEffect(() => {
    onEffectTrigger(count());
  });

  watch(
    [c],
    ([c]) => {
      onWatchTrigger(c);
    },
    { immediate: true }
  );

  setCount(1);
  c.value = 2;

  expect(onEffectTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onEffectTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onEffectTrigger).toHaveBeenCalledTimes(3);

  expect(onWatchTrigger).toHaveBeenNthCalledWith(1, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(2, 1);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(3, 2);
  expect(onWatchTrigger).toHaveBeenCalledTimes(3);
});
