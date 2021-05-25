import { mount } from "@cypress/vue";
import * as Stories from "./Button.stories";
import { composeStories } from "@storybook/testing-vue3";

const { Primary, Large } = composeStories(Stories);

describe("<Button />", () => {
  it("Primary", () => {
    mount(Primary());
  });
  it("Large", () => {
    mount(Large({ label: "Large" }));
  });
});
