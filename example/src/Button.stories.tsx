import type { StoryFn } from "@storybook/vue3";
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

const Template: StoryFn<{
  label: string;
  primary?: boolean;
  size?: "large" | "small";
}> = (args) => ({
  components: { MyButton },
  setup() {
    return { args }
  },
  template: '<my-button v-bind="args" />',
})

export const Primary = {
  render: Template,
  args: {
    primary: true,
    label: "Button",
  }
}

export const Secondary = {
  render: Template,
  args: {
    label: "Button",
  }
}

export const Large = {
  render: Template,
  args: {
    size: "large",
    label: "Button",
  }
}

export const Small = {
  render: Template,
  args: {
    size: "small",
    label: "Button",
  }
}