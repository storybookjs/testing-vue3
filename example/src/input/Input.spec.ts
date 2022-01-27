import { mount } from "@cypress/vue";
import { composeStories } from "@storybook/testing-vue3";

import * as stories from "./Input.stories";

const { Default, Filled } = composeStories(stories);

describe("<Input />", () => {
  it("Default", () => {
    mount(Default());
  });
  it("Filled", () => {
    mount(Filled());
    // For this to work you'd need to acquire the canvasElement and pass it to the story
    // Filled.play({ canvasElement })

    // And cypress would need to wait for the next rendering cycle then assert things like
    // cy.get('input').contains('Hello world')
  });
});
