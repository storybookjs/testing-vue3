import "@testing-library/jest-dom/extend-expect";
import { setProjectAnnotations } from "../../dist";
import { cleanup } from "@testing-library/vue";
import matchers from "@testing-library/jest-dom/matchers";

import * as globalStorybookConfig from "../.storybook/preview";

// // extends Vitest's expect method with methods from vue-testing-library and axe
expect.extend(matchers);

// // runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

// @ts-ignore
setProjectAnnotations(globalStorybookConfig);
