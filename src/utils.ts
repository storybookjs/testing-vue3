import type { VueRenderer } from '@storybook/vue3';
import { h, reactive } from 'vue';
import type { TestingStory } from './types';
import type { ArgsStoryFn, StoryContext, Args } from '@storybook/types';

const invalidStoryTypes = new Set(['string', 'number', 'boolean', 'symbol']);

export const globalRender: ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }

  return h(Component, props, generateSlots(context));
};
/** 
 * we should test  againt the global  render in  @storybook/vue3
 * this is  the current implementation in  @storybook/vue3 
 *   which i always disagree with because it clearly breaks  the  sematic of render function (in gerenrale)
 *  and leads to  a lot of  confusion and bugs
 */
export const render : ArgsStoryFn<VueRenderer> = (props, context) => {
  const { id, component: Component } = context;
  if (!Component) {
    throw new Error(
      `Unable to render story ${id} as the component annotation is missing from the default export`
    );
  }
  
  return () => h(Component, props, generateSlots(context));
}


/**
 * generate slots for default story without render function template
 * @param context
 */

function generateSlots(context: StoryContext<VueRenderer, Args>) {
  const { argTypes } = context;
  const slots = Object.entries(argTypes)
    .filter(([key, value]) => argTypes[key]?.table?.category === 'slots')
    .map(([key, value]) => {
      const slotValue = context.args[key];
      return [key, typeof slotValue === 'function' ? slotValue : () => slotValue];
    });

    // @ts-ignore not sure why it's failing
  return reactive(Object.fromEntries(slots));
}

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
