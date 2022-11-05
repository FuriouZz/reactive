import { reactive, triggerChange, raw, watch, listen, toRef } from "../lib";

const createSize = (x = 0, y = 0) => {
  const target = [x, y];

  const set = (...values: number[]) => {
    if (values.length === 1) {
      const oldValues = [...target];
      target.fill(values[0]);
      triggerChange(o, [], oldValues);
    } else if (values.length === target.length) {
      const oldValues = [...target];
      values.forEach((v, i) => (target[i] = v));
      triggerChange(o, [], oldValues);
    }
    return o;
  };

  const setFrom = (values: number[]) => {
    set(...values);
    return o;
  };

  const changeOrientation = () => {
    const oldValues = [...target];
    target.reverse();
    triggerChange(o, [], oldValues); // Force change for each key
    return o;
  };

  const o = reactive(target, {
    mixin: {
      set,
      setFrom,
      changeOrientation,
      get width() {
        return target[0];
      },
      set width(value) {
        const oldValue = target[0];
        target[0] = value;
        triggerChange(o, "width", { width: oldValue });
      },
      get height() {
        return target[1];
      },
      set height(value) {
        const oldValue = target[1];
        target[1] = value;
        triggerChange(o, "height", { height: oldValue });
      },
      get x() {
        return o[0];
      },
      set x(value) {
        o[0] = value;
      },
      get y() {
        return o[1];
      },
      set y(value) {
        o[1] = value;
      },
    },
  });

  return o;
};

const update = (sceneSize: ReturnType<typeof createSize>) => {
  sceneSize.width = 350;
  sceneSize.height = 350;
  sceneSize.set(200).set(800, 600);
  sceneSize.x = 1024;
  sceneSize.y = 768;
  sceneSize.setFrom([1280, 720]).changeOrientation();

  // Change target without triggering change
  raw(sceneSize)?.reverse();
  // Trigger change but without giving old values
  triggerChange(sceneSize);
};

test("listen every changes", () => {
  const sceneSize = createSize();
  const width = toRef(sceneSize, 0);
  const height = toRef(sceneSize, 1);

  const onChangeTrigger = jest.fn();

  watch([width, height], ([x, y]) => {
    onChangeTrigger(x, y);
  });

  update(sceneSize);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 200, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 800, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(9, 1280, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(11, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(13, 1280, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onChangeTrigger).toHaveBeenCalledTimes(14);
});

test("listen specific key change", () => {
  const sceneSize = createSize();

  const onKeyChangeTrigger = jest.fn();

  listen(sceneSize).on((e) => {
    if (e.key === "0" || e.key === "1") {
      onKeyChangeTrigger(e.key, e.oldValue, e.newValue);
    }
  });

  update(sceneSize);

  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(1, "0", 350, 200);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(2, "1", 350, 200);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(3, "0", 200, 800);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(4, "1", 200, 600);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(5, "0", 800, 1024);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(6, "1", 600, 768);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(7, "0", 1024, 1280);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(8, "1", 768, 720);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(9, "0", 1280, 720);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(10, "1", 720, 1280);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(11, "0", undefined, 1280);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(12, "1", undefined, 720);
  expect(onKeyChangeTrigger).toHaveBeenCalledTimes(12);
});

test("listen mixin's key change", () => {
  const sceneSize = createSize();

  const onKeyChangeTrigger = jest.fn();

  listen(sceneSize).on((e) => {
    if (e.key === "width" || e.key === "height") {
      onKeyChangeTrigger(e.key, e.oldValue, e.newValue);
    }
  });

  update(sceneSize);

  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(1, "width", 0, 350);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(2, "height", 0, 350);
  expect(onKeyChangeTrigger).toHaveBeenCalledTimes(2);
});

test("watch mixin keys", () => {
  const sceneSize = createSize();
  const width = toRef(sceneSize, "width");
  const height = toRef(sceneSize, "height");

  const onWatchTrigger = jest.fn();

  watch([width, height], ([width, height]) => {
    onWatchTrigger(width, height);
  });

  update(sceneSize);

  expect(onWatchTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(3, 200, 350);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(5, 800, 200);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(9, 1280, 768);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(11, 720, 720);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(13, 1280, 1280);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onWatchTrigger).toHaveBeenCalledTimes(14);
});
