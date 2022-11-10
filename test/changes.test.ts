import {
  reactive,
  triggerChange,
  watchSources,
  toRef,
  watchKeys,
  raw,
} from "../lib/reactive";

const createSize = (x = 0, y = 0) => {
  const target = [x, y];

  const set = (...values: number[]) => {
    if (values.length === 1) {
      target.fill(values[0]);
      triggerChange(o);
    } else if (values.length === target.length) {
      values.forEach((v, i) => (target[i] = v));
      triggerChange(o);
    }
    return o;
  };

  const setFrom = (values: number[]) => {
    set(...values);
    return o;
  };

  const changeOrientation = () => {
    target.reverse();
    triggerChange(o); // Force change for each key
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
        target[0] = value;
        triggerChange(o);
      },
      get height() {
        return target[1];
      },
      set height(value) {
        target[1] = value;
        triggerChange(o);
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

  watchSources([width, height], ([width, height]) => {
    // console.log("change", width, height);
    onChangeTrigger(width, height);
  });

  update(sceneSize);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 350, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 800, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(9, 1024, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(11, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(13, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onChangeTrigger).toHaveBeenCalledTimes(14);
});

test("listen specific key change", () => {
  const onChangeTrigger = jest.fn();
  const sceneSize = createSize();

  watchKeys(sceneSize, [0, 1], ([width, height]) => {
    // console.log("change", width, height);
    onChangeTrigger(width, height);
  });

  update(sceneSize);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 350, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 800, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(9, 1024, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(11, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(13, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onChangeTrigger).toHaveBeenCalledTimes(14);
});

test("watch mixin keys", () => {
  const onChangeTrigger = jest.fn();
  const sceneSize = createSize();

  watchKeys(sceneSize, ["width", "height"], ([width, height]) => {
    // console.log("change", width, height);
    onChangeTrigger(width, height);
  });

  update(sceneSize);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 350, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 800, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(9, 1024, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(11, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(13, 720, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onChangeTrigger).toHaveBeenCalledTimes(14);
});
