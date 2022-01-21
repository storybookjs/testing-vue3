import type {
  ArgTypes,
  BaseDecorators,
  Parameters as SbParameters
} from "@storybook/addons";
import { Args, Story, StoryContext, VueFramework } from "@storybook/vue3";
import type { ComponentOptions, ConcreteComponent } from "vue";

export type StoryFnVueReturnType = string | ComponentOptions<any>;
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

export type Head<T extends any[]> = T extends [...infer Head, any]
  ? Head
  : any[];

/**
 * A StoryFn where the context is already curried
 * in other words no more context param at the end
 */
export type ContextedStory<GenericArgs> = ((
  ...params: Partial<Head<Parameters<Story<Partial<GenericArgs>>>>>
) => ConcreteComponent) & {
  play: TestingStoryPlayFn<GenericArgs>;
};

export type TestingStoryPlayContext<T = Args> = Partial<
  StoryContext<VueFramework, T>
> &
  Pick<StoryContext, "canvasElement">;

export type TestingStoryPlayFn<TArgs = Args> = (
  context: TestingStoryPlayContext<TArgs>
) => Promise<void> | void;

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
