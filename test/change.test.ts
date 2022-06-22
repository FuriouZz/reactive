import { onChange, onKeyChange, reactive, watch } from "../lib";

test("onChange", (done) => {
  const o = reactive({ message: "Hello World" });

  onChange(o, () => {
    expect(o.message).toBe("Hello John");
    done();
  });

  o.message = "Hello John";
});

test("watch", (done) => {
  const o = reactive({ message: "Hello World" });

  let i = 0;
  watch(() => {
    if (i === 0) {
      expect(o.message).toBe("Hello World");
    } else if (i === 1) {
      expect(o.message).toBe("Hello John");
      done();
    }
    i++;
  });

  o.message = "Hello John";
});

test("onChange2", (done) => {
  const o = reactive({ message: "Hello World", count: 0 });

  onChange(o, () => {
    if (o.count === 0) {
      expect(o.message).toBe("Hello John");
    } else {
      expect(o.count).toBe(1);
      done();
    }
  });

  o.message = "Hello John";
  o.count++;
});

test("onKeyChange", (done) => {
  const o = reactive({ message: "Hello World", count: 0 });

  onKeyChange(o, "message", () => {
    expect(o.message).toBe("Hello John");
  });

  o.message = "Hello John";

  onKeyChange(o, "count", () => {
    expect(o.count).toBe(1);
    done();
  });

  o.count++;
});
