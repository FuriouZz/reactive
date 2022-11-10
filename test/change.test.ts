import { onChange, onKeyChange, reactive, toRef, watch } from "../lib/reactive";

test("onChange", (done) => {
  const o = reactive({ message: "Hello World" });
  const onChangeTrigger = jest.fn();

  onChange(o, () => {
    onChangeTrigger(o.message);
    done();
  });

  o.message = "Hello John";

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
});

test("watch", () => {
  const o = reactive({ message: "Hello World" });
  const message = toRef(o, "message");

  const onChangeTrigger = jest.fn();

  watch([message], ([message]) => {
    onChangeTrigger(message);
  });

  o.message = "Hello John";

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
});

test("onChange2", () => {
  const o = reactive({ message: "Hello World", count: 0 });
  const onChangeTrigger = jest.fn();

  onChange(o, () => {
    if (o.count === 0) {
      onChangeTrigger(o.message);
    } else {
      onChangeTrigger(o.count);
    }
  });

  o.message = "Hello John";
  o.count++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 1);
});

test("onKeyChange", () => {
  const o = reactive({ message: "Hello World", count: 0 });
  const message = toRef(o, "message");

  const onChangeTrigger = jest.fn();

  onKeyChange(o, ["message"], () => {
    onChangeTrigger(o.message);
  });

  o.message = "Hello John";

  onKeyChange(o, ["count"], () => {
    onChangeTrigger(o.count);
  });

  o.count++;

  expect(onChangeTrigger).toHaveBeenNthCalledWith(1, "Hello John");
  expect(onChangeTrigger).toHaveBeenNthCalledWith(2, 1);
});
