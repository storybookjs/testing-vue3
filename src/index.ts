import type { ComponentOptions, ConcreteComponent } from "vue";
import { combineParameters } from "@storybook/client-api";
import {
  ArgTypes,
  Parameters as SbParameters,
  BaseDecorators,
} from "@storybook/addons";
import { Story, Meta, StoryContext } from "@storybook/vue3";
import decorateStory from "./decorateStory";

type StoryFnVueReturnType = string | ComponentOptions<any>;
/**
 * Object representing the preview.ts module
 *
 * Used in storybook testing utilities.
 * @see [Unit testing with Storybook](https://storybook.js.org/docs/react/workflows/unit-testing)
 */
export type GlobalConfig = {
  decorators?: BaseDecorators<StoryFnVueReturnType>;
  parameters?: SbParameters;
  argTypes?: ArgTypes;
  [key: string]: any;
};

type Head<T extends any[]> = T extends [...infer Head, any] ? Head : any[];

/**
 * A StoryFn where the context is already curried
 * in other words no more context param at the end
 */
type ContextedStory<GenericArgs> = (
  ...params: Partial<Head<Parameters<Story<Partial<GenericArgs>>>>>
) => ConcreteComponent;

/**
 * T represents the whole es module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type StoriesWithPartialProps<T> = {
  [K in keyof T as T[K] extends Story<any> ? K : never]: T[K] extends Story<
    infer P
  >
    ? ContextedStory<P>
    : unknown;
};

let globalStorybookConfig: GlobalConfig = {};

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
