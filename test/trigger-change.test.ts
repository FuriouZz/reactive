import {
  reactive,
  triggerChange,
  raw,
  watch,
  onChange,
  onKeyChange,
} from "../dist/index";

test("triggerChange", () => {
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
    };

    const setFrom = (values: number[]) => {
      set(...values);
    };

    const changeOrientation = () => {
      const oldValues = [...target];
      target.reverse();
      triggerChange(o, [], oldValues); // Force change for each key
    };

    const methods = {
      set,
      setFrom,
      changeOrientation,
    };

    Object.entries(methods).forEach(([key, method]) => {
      Object.defineProperty(target, key, { value: method });
    });

    const o = reactive(target as typeof target & typeof methods, {
      keyMap: {
        0: 0,
        1: 1,

        width: 0,
        height: 1,

        x: 0,
        y: 1,
      },
    });

    return o;
  };

  const onChangeTrigger = jest.fn();
  const onKeyChangeTrigger = jest.fn();
  const onWatchTrigger = jest.fn();

  const sceneSize = createSize();

  onChange(sceneSize, () => {
    onChangeTrigger(sceneSize[0], sceneSize[1]);
  });

  onKeyChange(sceneSize, ["0", "1"], (e) => {
    onKeyChangeTrigger(e.key, e.newValue, e.oldValue);
  });

  watch(() => {
    onWatchTrigger(sceneSize.width, sceneSize.height);
  });

  sceneSize.width = 350;
  sceneSize.height = 350;
  sceneSize.set(200);
  sceneSize.set(800, 600);
  sceneSize.x = 1024;
  sceneSize.y = 768;
  sceneSize.setFrom([1280, 720]);
  sceneSize.changeOrientation();

  // Change target without triggering change
  raw(sceneSize).reverse();
  // Trigger change but without giving old values
  triggerChange(sceneSize);

  expect(onWatchTrigger).toHaveBeenNthCalledWith(1, 0, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(2, 350, 0);
  expect(onWatchTrigger).toHaveBeenNthCalledWith(3, 350, 350);
  expect(onWatchTrigger).toHaveBeenCalledTimes(3);

  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(1, "0", 200, 350);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(2, "1", 200, 350);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(3, "0", 800, 200);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(4, "1", 600, 200);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(5, "0", 1280, 1024);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(6, "1", 720, 768);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(7, "0", 720, 1280);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(8, "1", 1280, 720);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(9, "0", 1280, undefined);
  expect(onKeyChangeTrigger).toHaveBeenNthCalledWith(10, "1", 720, undefined);
  expect(onKeyChangeTrigger).toHaveBeenCalledTimes(10);

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, 350, 0);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 350, 350);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(3, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(4, 200, 200);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(5, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(6, 800, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(7, 1024, 600);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(8, 1024, 768);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(9, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(10, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(11, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(12, 720, 1280);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(13, 1280, 720);
  expect(onChangeTrigger).toHaveBeenNthCalledWith(14, 1280, 720);
  expect(onChangeTrigger).toHaveBeenCalledTimes(14);
});
