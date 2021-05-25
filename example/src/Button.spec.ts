import { mount } from "@cypress/vue";
import { composeStories } from "@storybook/testing-vue3";

import * as stories from "./Button.stories";

const { Primary, Large } = composeStories(stories);

describe("<Button />", () => {
  it("Primary", () => {
    mount(Primary());
  });
  it("Large", () => {
    mount(Large({ label: "Large" }));
  });
});
