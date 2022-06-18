import { computed, reactive } from "../dist/index.js";

test("computed", () => {
  const o = reactive({ name: "World" });
  const c = computed(() => `Hello ${o.name}`);
  expect(c.value).toBe("Hello World");

  o.name = "John";
  expect(c.value).toBe("Hello John");
});
