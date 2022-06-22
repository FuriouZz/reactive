import { reactive, isObservable, onKeyChange } from "../lib";

test("Change field", () => {
  const o = reactive({ message: "Hello World" });
  o.message = "Hello John";
  expect(o.message).toBe("Hello John");
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

  // @ts-ignore
  o.obj = null;
  o.obj = { plop: true };
  o.obj.plop = false;

  // @ts-ignore
  o.obj = null;

  expect(objChange).toHaveBeenCalledTimes(3);
  expect(objPlopChange).toHaveBeenCalledTimes(1);
});
