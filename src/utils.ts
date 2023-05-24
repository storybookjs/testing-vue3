import type { StoryFn } from '@storybook/vue3';
import { h } from "vue";
import type { TestingStory } from './types';

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);

export const globalRender: StoryFn = (args, { parameters }) => {
  if (!parameters.component) {
    throw new Error(`
      Could not render story due to missing 'component' property in Meta.
    `);
  }
  const Component = parameters.component
  return h(Component, args);
};

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
