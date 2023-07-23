import type {
  Args,
  StoryAnnotations,
} from '@storybook/types';
import type { VueRenderer } from "@storybook/vue3";

export type TestingStory<TArgs = Args> = StoryAnnotations<VueRenderer, TArgs>;

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);


export const isInvalidStory = (story?: any) => (!story || Array.isArray(story) || invalidStoryTypes.has(typeof story))

type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T];
export function objectEntries<T extends object>(t: T): Entries<T>[] {
  return Object.entries(t) as any;
}

export const getStoryName = (story: TestingStory) => {
  if (story.storyName) {
    return story.storyName
  }

  if (typeof story !== 'function' && story.name) {
    return story.name
  }

  return undefined
}
