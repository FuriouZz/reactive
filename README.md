Functions to create reactive objects.

```ts
import { observable, ref, lazyRef, onChange, onKeyChange } from "@furiouzz/reactive";

const rectangle = observe({
  width: 0,
  height: 0,
  x: 0,
  y: 0,
});

const resized = lazyRef(false);
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
