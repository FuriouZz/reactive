import {
  reactive,
  onChange,
  watch,
  onKeyChange,
  isObservable,
  computed,
  ref,
} from "../dist/index";

test("Change field", () => {
  const o = reactive({ message: "Hello World" });
  o.message = "Hello John";
  expect(o.message).toBe("Hello John");
});

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

test("deep", () => {
  const o = reactive({ message: "Hello World", count: 0, obj: { plop: true } });

  expect(isObservable(o)).toBe(true);
  expect(isObservable(o.obj)).toBe(true);

  const objChange = jest.fn();
  const objPlopChange = jest.fn();

  onKeyChange(o, ["obj", "obj.plop"], (event) => {
    if (event.key === "obj") {
      objChange();
    } else if ((event.key = "obj.plop")) {
      objPlopChange();
    }
  });

  o.obj = null;
  o.obj = { plop: true };
  o.obj.plop = false;
  o.obj = null;

  expect(objChange).toHaveBeenCalledTimes(3);
  expect(objPlopChange).toHaveBeenCalledTimes(1);
});

test("computed", () => {
  const o = reactive({ name: "World" });
  const c = computed(() => `Hello ${o.name}`);
  expect(c.value).toBe("Hello World");

  o.name = "John";
  expect(c.value).toBe("Hello John");
});

test("ref", (done) => {
  const r = ref(0);

  watch(() => {
    if (r.value === 0) {
      expect(r.value).toBe(0);
    } else {
      expect(r.value).toBe(1);
      done();
    }
  });

  r.value++;
});
