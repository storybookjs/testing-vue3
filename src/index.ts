import { combineParameters, defaultDecorateStory } from "@storybook/client-api";
import type { Meta, Story, StoryContext, VueFramework } from "@storybook/vue3";

import type {
  ContextedStory,
  GlobalConfig,
  StoriesWithPartialProps,
  StoryFnVueReturnType,
  TestingStoryPlayContext
} from "./types";
import { isInvalidStory } from "./utils";

let globalStorybookConfig: GlobalConfig = {};

export function setGlobalConfig(config: GlobalConfig) {
  globalStorybookConfig = config;
}

export function composeStory<GenericArgs>(
  story: Story<GenericArgs>,
  meta: Meta,
  globalConfig: GlobalConfig = globalStorybookConfig
) {
  if (isInvalidStory(story)) {
    throw new Error(
      `Cannot compose story due to invalid format. @storybook/testing-vue expected a function but received ${typeof story} instead.`
    );
  }

  if (story.story !== undefined) {
    throw new Error(
      `StoryFn.story object-style annotation is not supported. @storybook/testing-vue expects hoisted CSF stories.
           https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations`
    );
  }

  const finalStoryFn = (context: StoryContext<VueFramework, GenericArgs>) => {
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
    ...(globalConfig?.decorators || [])
  ];

  const decorated = defaultDecorateStory<VueFramework>(
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

  const combinedParameters = combineParameters(
    globalConfig.parameters || {},
    meta?.parameters || {},
    story.parameters || {}
  );

  const combinedArgs = {
    ...(meta?.args || {}),
    ...story.args
  } as GenericArgs;

  const context = {
    id: "",
    kind: "",
    name: "",
    argTypes: globalConfig.argTypes || {},
    globals: defaultGlobals,
    parameters: combinedParameters
  } as StoryContext<VueFramework, GenericArgs>;

  const composedStory = (extraArgs: Partial<GenericArgs>) => {
    return decorated({
      ...context,
      args: {
        ...combinedArgs,
        ...extraArgs
      }
    });
  };

  const boundPlay = ({
    ...extraContext
  }: TestingStoryPlayContext<GenericArgs>) => {
    return story.play?.({ ...context, ...extraContext });
  };

  composedStory.play = boundPlay;

  return composedStory as ContextedStory<GenericArgs>;
}

export function composeStories<
  T extends { default: Meta; __esModule?: boolean }
>(storiesImport: T, globalConfig?: GlobalConfig): StoriesWithPartialProps<T> {
  const { default: meta, ...stories } = storiesImport;
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
