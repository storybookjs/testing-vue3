import type { Story } from "@storybook/vue3";
import MyButton from "./Button.vue";

export default {
  title: "Example/Button",
  component: MyButton,
  argTypes: {
    backgroundColor: { control: "color" },
    size: {
      control: { type: "select", options: ["small", "medium", "large"] },
    },
    onClick: {},
  },
  decorators: [
    () => ({
      template: '<div style="border: 4px solid red">file<story /></div>',
    }),
  ],
};

const Template: Story<{
  label: string;
  primary?: boolean;
  size?: "large" | "small";
}> = (args) => ({
  // Components used in your story `template` are defined in the `components` object
  components: { MyButton },
  // The story's `args` need to be mapped into the template through the `setup()` method
  setup() {
    return { args };
  },
  // And then the `args` are bound to your component with `v-bind="args"`
  template: '<my-button v-bind="args" />',
});

export const Primary = Template.bind({});
Primary.args = {
  primary: true,
  label: "Button",
};

export const Secondary = Template.bind({});
Secondary.args = {
  label: "Button",
};

export const Large = Template.bind({});
Large.args = {
  size: "large",
  label: "Button",
};
Large.decorators = [
  () => ({
    template: '<div style="border: 4px solid green">story<story /></div>',
  }),
];

export const Small = Template.bind({});
Small.args = {
  size: "small",
  label: "Button",
};
