import { observe } from "../dist/index";

test("Change field", () => {
  const o = observe({ message: "Hello World" });
  o.message = "Hello John";
  expect(o.message).toBe("Hello John");
});

test("$change", (done) => {
  const o = observe({ message: "Hello World" });
  o.$change.once(() => {
    expect(o.message).toBe("Hello John");
    done();
  });
  o.message = "Hello John";
});

test("$change2", (done) => {
  const o = observe({ message: "Hello World", count: 0 });
  o.$change.on(() => {
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

test("$keyChange", (done) => {
  const o = observe({ message: "Hello World", count: 0 });
  o.$keyChange.once((event) => {
    expect(event.key).toBe("message");
  });
  o.message = "Hello John";

  o.$keyChange.once((event) => {
    expect(event.key).toBe("count");
    done();
  });
  o.count++;
});

test("deep", () => {
  const o = observe(
    { message: "Hello World", count: 0, obj: { plop: true } },
    { deep: true }
  );

  expect(typeof o.obj.$change).toBe("object");
  expect(typeof o.obj.$keyChange).toBe("object");
  expect(typeof o.obj.$effect).toBe("function");
  expect(typeof o.obj.$target).toBe("object");

  const objChange = jest.fn();
  const objPlopChange = jest.fn();

  o.$keyChange.on((event) => {
    if (event.key === "obj") {
      objChange();
    } else if (event.key = "obj.plop") {
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
