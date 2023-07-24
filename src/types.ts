// The types are recreated here because the original types are not 100% correct.
// This will be fixed once this logic is moved into @storybook/vue3.

import type {
    Args,
    Renderer,
    ComposedStoryPlayFn,
    StoryId,
    Parameters,
    StoryFn,
    StoryAnnotations,
  } from '@storybook/types';

type LooseAnnotatedStoryFn<TRenderer extends Renderer = Renderer, TArgs = Args> = (
args?: TArgs
) => (TRenderer & {
T: TArgs;
})['storyResult'];

export type PreparedStoryFn<
  TRenderer extends Renderer = Renderer,
  TArgs = Args
> = LooseAnnotatedStoryFn<TRenderer, TArgs> & {
  play: ComposedStoryPlayFn<TRenderer, TArgs>;
  args: TArgs;
  id: StoryId;
  storyName: string;
  parameters: Parameters;
};

type ComposedStory<TRenderer extends Renderer = Renderer, TArgs = Args> = StoryFn<TRenderer, TArgs> | StoryAnnotations<TRenderer, TArgs>;
/**
 * T represents the whole ES module of a stories file. K of T means named exports (basically the Story type)
 * 1. pick the keys K of T that have properties that are Story<AnyProps>
 * 2. infer the actual prop type for each Story
 * 3. reconstruct Story with Partial. Story<Props> -> Story<Partial<Props>>
 */
export type StoriesWithPartialProps<TRenderer extends Renderer, TModule> = {
    [K in keyof TModule]: TModule[K] extends ComposedStory<infer _, infer TProps> ? PreparedStoryFn<TRenderer, Partial<TProps>> : unknown;
};