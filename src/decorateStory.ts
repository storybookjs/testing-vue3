import type { ConcreteComponent, Component, ComponentOptions } from "vue";
import { h } from "vue";
import { StoryFn, DecoratorFunction, StoryContext } from "@storybook/addons";

type StoryFnVueReturnType = ConcreteComponent<any>;

/*
  This normalizes a functional component into a render method in ComponentOptions.

  The concept is taken from Vue 3's `defineComponent` but changed from creating a `setup`
  method on the ComponentOptions so end-users don't need to specify a "thunk" as a decorator.
 */
function normalizeFunctionalComponent(
  options: ConcreteComponent
): ComponentOptions {
  return typeof options === "function"
    ? { render: options, name: options.name }
    : options;
}

function prepare(
  rawStory: StoryFnVueReturnType,
  innerStory?: ConcreteComponent
): Component | null {
  const story = rawStory as ComponentOptions;

  if (story == null) {
    return null;
  }

  if (innerStory) {
    return {
      // Normalize so we can always spread an object
      ...normalizeFunctionalComponent(story),
      components: { ...(story.components || {}), story: innerStory },
    };
  }

  return {
    render() {
      return h(story);
    },
  };
}

const defaultContext: StoryContext = {
  id: "unspecified",
  name: "unspecified",
  kind: "unspecified",
  parameters: {},
  args: {},
  argTypes: {},
  globals: {},
};

function makeDecoration(
  decorated: StoryFn<ConcreteComponent>,
  decorator: DecoratorFunction<ConcreteComponent>
): any {
  return (context: StoryContext = defaultContext) => {
    let story: ConcreteComponent | undefined;

    const decoratedStory = decorator(
      ({ parameters, ...innerContext }: StoryContext = {} as StoryContext) => {
        story = decorated({ ...context, ...innerContext });
        return story;
      },
      context
    );

    if (!story) {
      story = decorated(context);
    }

    if (decoratedStory === story) {
      return story;
    }

    return prepare(decoratedStory, story);
  };
}

export default function decorateStory(
  storyFn: StoryFn<StoryFnVueReturnType>,
  decorators: DecoratorFunction<ConcreteComponent>[]
): StoryFn<Component> {
  return decorators.reduce(
    (decorated, decorator) => makeDecoration(decorated, decorator),
    ((context: StoryContext) =>
      prepare(storyFn(context))) as StoryFn<ConcreteComponent>
  );
}
