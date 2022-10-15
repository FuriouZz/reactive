import { reactive, isObservable, onKeyChange, watch } from "../lib";

test("Change field", () => {
  const o = reactive({ message: "Hello World" });
  o.message = "Hello John";
  expect(o.message).toBe("Hello John");
});

test("deep", () => {
  const o = reactive({ message: "Hello World", count: 0, obj: { plop: true, plop2: { yolo: "yolo" } } });

  expect(isObservable(o)).toBe(true);
  expect(isObservable(o.obj)).toBe(true);
  expect(isObservable(o.obj.plop2)).toBe(true);

  const objChange = jest.fn();
  const objPlopChange = jest.fn();
  const objPlop2Change = jest.fn();

  onKeyChange(o, ["obj", "obj.plop"], (event) => {
    if (event.key === "obj") {
      objChange();
    } else if ((event.key = "obj.plop")) {
      objPlopChange();
    }
  });

  watch(() => {
    o.obj?.plop2;
    objPlop2Change();
  });

  // @ts-ignore
  o.obj = null;
  o.obj = { plop: true, plop2: { yolo: "yola" } };
  o.obj.plop = false;

  // @ts-ignore
  o.obj = null;

  expect(objChange).toHaveBeenCalledTimes(3);
  expect(objPlopChange).toHaveBeenCalledTimes(1);
  expect(objPlop2Change).toHaveBeenCalledTimes(5);
});
