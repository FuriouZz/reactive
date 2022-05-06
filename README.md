Functions to create reactive objects.

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
resized.$effect(); // Trigger a change and a key change on every properties (only "value" here)
// resized.$effect([]); Trigger a change only
// resized.$effect(["value"]); Trigger a change and a key change on property "value"
```

Use `tuple()` to create an array with named fields

```ts
import { tuple } from "@furiouzz/reactive";

const createSize = (x = 0, y = 0) => {
  const o = tuple({
    target: [x, y],
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
        const target = o.$target;
        target.reverse();
        o.$effect(); // Force change for each key
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

// Change target without triggering change
sceneSize.$target.reverse();
// Trigger change
sceneSize.$effect();
```

```ts
import { observable } from "@furiouzz/reactive";

const o = observe(
  { message: "Hello World", count: 0, obj: { plop: true } },
  { deep: true }
);

o.$keyChange.on((event) => {
  console.log(event.key); // "obj" | "obj.plop"
});

o.obj = null;
o.obj = { plop: true };
o.obj.plop = false;
o.obj = null;
```