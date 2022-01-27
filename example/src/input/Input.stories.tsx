import type { Story } from "@storybook/vue3";
import { userEvent, within } from "@storybook/testing-library";
import MyInput from "./Input.vue";

export default {
  title: "Example/Input",
  component: MyInput,
  args: {
    label: "Type below"
  },
  argTypes: {
    onChange: {},
  },
  decorators: [
    () => ({
      template: '<div style="border: 4px solid red">file<story /></div>',
    }),
  ],
};

const Template: Story<{
  label: string;
}> = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyInput },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<my-input v-bind="args" />',
});

export const Default = Template.bind({});

export const Filled = Template.bind({});
Filled.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await userEvent.type(canvas.getByRole('textbox'), 'Hello world');
};

