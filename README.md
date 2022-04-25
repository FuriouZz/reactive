Functions to create reactive objects.

Warning: Deeply reactive objects are not supported.

```ts
import { observable, ref, lazyRef } from "@furiouzz/reactive";

const rectangle = observe({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
});

const resized = lazyRef(false);
const moved = ref(false);

rectangle.$change.on(() => {
  console.log("On change", rectangle);
});

rectangle.$keyChange.on((event) => {
  console.log("On key change", event);
  if (event.key === "x" || event.key === "y") {
    moved.value = true;
  } else {
    resized.value = true;
  }
});

moved.$change.on(() => {
  console.log("Rectangle moved", moved.value);
});

resized.$change.on(() => {
  console.log("Rectangle resized", resized.value);
});

rectangle.width = 800;
rectangle.height = 600;
rectangle.x = 10;

// Trigger change on lazy ref
resized.$effect();
```

Use `tuple()` to create an array with named fields

```ts
import { tuple } from "@furiouzz/reactive";

const createSize = (x = 0, y = 0) => {
  const target = [x, y];
  const o = tuple({
    target,
    components: {
      0: 0,
      1: 1,

      width: 0,
      height: 1,

      x: 0,
      y: 1,
    },

    methods: {
      changeOrientation() {
        const tmp = target[0];
        target[0] = target[1];
        target[1] = tmp;
        o.$effect(true); // Force change for each key
      },
    },
  });

  return o;
};

const sceneSize = createSize();

sceneSize.$change.on(() => {
  console.log("On scene resized", sceneSize[0], sceneSize[1]);
  // console.log("On scene resized", sceneSize.width, sceneSize.height);
  // console.log("On scene resized", sceneSize.x, sceneSize.y);
});

sceneSize.width = 350;
sceneSize.height = 350;
sceneSize.set(200);
sceneSize.set(800, 600);
sceneSize.x = 1024;
sceneSize.y = 768;
sceneSize.setFrom([1280, 720]);
sceneSize.changeOrientation();
```
