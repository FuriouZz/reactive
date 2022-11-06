Functions to create reactive objects.

```ts
import { reactive, toRef, stream, watch } from "@furiouzz/reactive";

const size = reactive({ width: 100, height: 100 });
const width = toRef(size, "width");

const ref = stream([width])
  .pipe(([width]) => [width * 0.5])
  .pipe(([width]) => String(width))
  .pipe((width) => width + "px")
  .ref();

watch(
  [ref],
  ([value]) => {
    console.log(value);
  },
  { immediate: true } // log: "50px"
);

size.width = 300; // log: "150px"
size.width = 200; // log: "100px"
size.width = 150; // log: "75px"
```

```ts
const size = reactive({ width: 800, height:: 600 }, {
  mixin: {
    swap() {
      const width = size.width;
      size.width = size.height;
      size.height = width;
    },
  },
});

const { width, height } = toRefs(size);

watch([width, height], ([width, height]) => {
  console.log(width, height);
});

size.width = 1280;
// log: 1280, 600

size.height = 720;
// log: 1280, 720

size.swap();
// log: 720, 720
// log: 720, 1280
```
