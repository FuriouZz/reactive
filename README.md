Functions to create reactive objects.

```ts
import { observable, ref, lazyRef, onChange, onKeyChange } from "@furiouzz/reactive";

const rectangle = observe({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
});

const resized = ref(false, { lazy: true });
const moved = ref(false);

onChange(rectangle, () => {
  console.log("On change", rectangle);
});

onKeyChange(rectangle, (event) => {
  console.log("On key change", event);
  if (event.key === "x" || event.key === "y") {
    moved.value = true;
  } else {
    resized.value = true;
  }
});

onChange(moved, () => {
  console.log("Rectangle moved", moved.value);
});

onChange(resized, () => {
  console.log("Rectangle resized", resized.value);
});

rectangle.width = 800;
rectangle.height = 600;
rectangle.x = 10;

// Trigger change on lazy ref
triggerChange(resized); // Trigger a change and a key change on every properties (only "value" here)
// triggerChange(resized, []); Trigger a change only
// triggerChange(resized, ["value"]); Trigger a change and a key change on property "value"
```

```ts
import {
  reactive,
  triggerChange,
  raw,
  watch,
  onChange,
  onKeyChange,
} from "@furiouzz/reactive";

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
        target[0] = value;
        triggerChange(o, "width");
      },
      get height() {
        return target[1];
      },
      set height(value) {
        target[1] = value;
        triggerChange(o, "height");
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

const sceneSize = createSize();

// Listen every changes
onChange(sceneSize, () => {
  console.log(sceneSize[0], sceneSize[1]);
});

// Listen key specific changes
onKeyChange(sceneSize, ["0", "1"], (e) => {
  console.log(e.key, e.newValue, e.oldValue);
});

// Listen mixin key changes
watch(() => {
  console.log(sceneSize.width, sceneSize.height);
});
```
