import { combineParameters } from "@storybook/client-api";
import addons, { mockChannel } from '@storybook/addons';
import type { Story, Meta, StoryContext } from "@storybook/vue3";
import type { StoryFnVueReturnType, ContextedStory, GlobalConfig, StoriesWithPartialProps } from "./types";

import decorateStory from "./decorateStory";

let globalStorybookConfig: GlobalConfig = {};

// Some addons use the channel api to communicate between manager/preview, and this is a client only feature, therefore we must mock it.
addons.setChannel(mockChannel());

export function setGlobalConfig(config: GlobalConfig) {
  globalStorybookConfig = config;
}

export function composeStory<GenericArgs>(
  story: Story<GenericArgs>,
  meta: Meta,
  globalConfig: GlobalConfig = globalStorybookConfig
) {
  if (typeof story !== "function") {
    throw new Error(
      `Cannot compose story due to invalid format. @storybook/testing-vue expected a function but received ${typeof story} instead.`
    );
  }

  if ((story as any).story !== undefined) {
    throw new Error(
      `StoryFn.story object-style annotation is not supported. @storybook/testing-vue expects hoisted CSF stories.
           https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations`
    );
  }

  const finalStoryFn = (context: StoryContext) => {
    const { passArgsFirst = true } = context.parameters;
    if (!passArgsFirst) {
      throw new Error(
        "composeStory does not support legacy style stories (with passArgsFirst = false)."
      );
    }

    return story(context.args as GenericArgs, context) as StoryFnVueReturnType;
  };

  const combinedDecorators = [
    ...(story.decorators || []),
    ...(meta?.decorators || []),
    ...(globalConfig?.decorators || []),
  ];

  const decorated = decorateStory(
    finalStoryFn as any,
    combinedDecorators as any
  );

  const defaultGlobals = Object.entries(
    (globalConfig.globalTypes || {}) as Record<string, { defaultValue: any }>
  ).reduce((acc, [arg, { defaultValue }]) => {
    if (defaultValue) {
      acc[arg] = defaultValue;
    }
    return acc;
  }, {} as Record<string, { defaultValue: any }>);

  return ((extraArgs: Record<string, any> = {}) =>
    decorated({
      id: "",
      kind: "",
      name: "",
      argTypes: globalConfig.argTypes || {},
      globals: defaultGlobals,
      parameters: combineParameters(
        globalConfig.parameters || {},
        meta?.parameters || {},
        story.parameters || {}
      ),
      args: {
        ...(meta?.args || {}),
        ...story.args,
        ...extraArgs,
      },
    })) as ContextedStory<GenericArgs>;
}

export function composeStories<
  T extends { default: Meta; __esModule?: boolean }
>(storiesImport: T, globalConfig?: GlobalConfig): StoriesWithPartialProps<T> {
  const { default: meta, __esModule, ...stories } = storiesImport;
  // Compose an object containing all processed stories passed as parameters
  const composedStories = Object.entries(stories).reduce(
    (storiesMap, [key, story]) => {
      storiesMap[key] = composeStory(story as Story, meta, globalConfig);
      return storiesMap;
    },
    {} as { [key: string]: ContextedStory<any> }
  );
  return composedStories as StoriesWithPartialProps<T>;
}
