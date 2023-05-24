import type {
  AnnotatedStoryFn,
  Args,
  PlayFunction, PlayFunctionContext,
  Store_CSFExports,
  StoryAnnotations,
} from '@storybook/types';
import type { VueRenderer } from "@storybook/vue3";

export type TestingStory<TArgs = Args> = StoryAnnotations<VueRenderer, TArgs>;
export type StoryFile = Store_CSFExports<VueRenderer, any>;
export type TestingStoryPlayContext<TArgs = Args> = Partial<PlayFunctionContext<VueRenderer, TArgs>> & Pick<PlayFunctionContext, 'canvasElement'>
export type StoryFn<TArgs = Args> = AnnotatedStoryFn<VueRenderer, TArgs> & { play: PlayFunction<VueRenderer, TArgs> }
/**
 * T represents the whole es module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type StoriesWithPartialProps<T> = {
  [K in keyof T]: T[K] extends StoryAnnotations<VueRenderer, infer P> ? StoryFn<Partial<P>> : number
}
