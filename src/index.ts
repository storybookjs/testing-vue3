import { defaultDecorateStory, combineParameters, addons, applyHooks, HooksContext, mockChannel, composeConfigs } from '@storybook/preview-api';
import type { StoryContext, VueRenderer } from "@storybook/vue3";
import type { ComponentAnnotations, StoryAnnotations, ProjectAnnotations } from '@storybook/types'
import { isExportStory } from '@storybook/csf';
import { deprecate } from '@storybook/client-logger';

import type { StoriesWithPartialProps, StoryFile, TestingStory, TestingStoryPlayContext } from "./types";
import { getStoryName, globalRender, isInvalidStory, objectEntries } from './utils';

// Some addons use the channel api to communicate between manager/preview, and this is a client only feature, therefore we must mock it.
addons.setChannel(mockChannel());

const decorateStory = applyHooks(defaultDecorateStory);

const isValidStoryExport = (storyName: string, nonStoryExportsConfig = {}) => isExportStory(storyName, nonStoryExportsConfig) && storyName !== '__namedExportsOrder'

let GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS = {};

export function setProjectAnnotations(
  projectAnnotations: ProjectAnnotations<VueRenderer> | ProjectAnnotations<VueRenderer>[]
) {
  const annotations = Array.isArray(projectAnnotations) ? projectAnnotations : [projectAnnotations];
  GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS = composeConfigs(annotations);
}

/**
 * @deprecated Use setProjectAnnotations instead
 */
export function setGlobalConfig(
  projectAnnotations: ProjectAnnotations<VueRenderer> | ProjectAnnotations<VueRenderer>[]
) {
  deprecate(`[@storybook/testing-react] setGlobalConfig is deprecated. Use setProjectAnnotations instead.`);
  setProjectAnnotations(projectAnnotations);
}

export function composeStory<GenericArgs>(
  story: TestingStory<GenericArgs>,
  meta: ComponentAnnotations<VueRenderer>,
  globalConfig: ProjectAnnotations<VueRenderer> = GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS
) {

  if (isInvalidStory(story)) {
    throw new Error(
      `Cannot compose story due to invalid format. @storybook/testing-react expected a function/object but received ${typeof story} instead.`
    );
  }

  if (story.story !== undefined) {
    throw new Error(
      `StoryFn.story object-style annotation is not supported. @storybook/testing-react expects hoisted CSF stories.
       https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations`
    );
  }
  const renderFn = typeof story === 'function' ? story : story.render ?? meta.render ?? globalRender;
  const finalStoryFn = (context: StoryContext<GenericArgs>) => {
    const { passArgsFirst = true } = context.parameters;
    if (!passArgsFirst) {
      throw new Error(
        'composeStory does not support legacy style stories (with passArgsFirst = false).'
      );
    }
    return renderFn(context.args, context);
  };

  const combinedDecorators = [
    ...(story.decorators || []),
    ...(meta?.decorators || []),
    ...(globalConfig?.decorators || []),
  ];

  const decorated = decorateStory<VueRenderer>(
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
    story.parameters || {},
    { component: meta?.component }
  )

  const combinedArgs = {
    ...meta?.args,
    ...story.args
  } as GenericArgs

  const context = {
    tags: [],
    componentId: '',
    kind: '',
    title: '',
    id: '',
    name: '',
    story: '',
    argTypes: globalConfig.argTypes || {},
    globals: defaultGlobals,
    parameters: combinedParameters,
    initialArgs: combinedArgs,
    args: combinedArgs,
    viewMode: 'story',
    originalStoryFn: renderFn,
    hooks: new HooksContext(),
  } as StoryContext<GenericArgs>;

  const composedStory = (extraArgs: Partial<GenericArgs>) => {
    return decorated({
      ...context,
      args: {
        ...combinedArgs, ...extraArgs
      }
    })
  }

  const boundPlay = ({ ...extraContext }: TestingStoryPlayContext<GenericArgs>) => {
    const playFn = meta.play ?? story.play ?? (() => { });
    // @ts-expect-error (just trying to get this to build)
    return playFn({ ...context, ...extraContext });
  }

  composedStory.storyName = story.storyName || story.name
  composedStory.args = combinedArgs
  composedStory.play = boundPlay;
  composedStory.decorators = combinedDecorators
  composedStory.parameters = combinedParameters

  return composedStory
}

export function composeStories<TModule extends StoryFile>(storiesImport: TModule, globalConfig?: ProjectAnnotations<VueRenderer>) {
  const { default: meta, __esModule, ...stories } = storiesImport;

  // Compose an object containing all processed stories passed as parameters
  const composedStories = objectEntries(stories).reduce<Partial<StoriesWithPartialProps<TModule>>>(
    (storiesMap, [key, _story]) => {
      const storyName = String(key)
      // filter out non-story exports
      if (!isValidStoryExport(storyName, meta)) {
        return storiesMap;
      }

      const story = _story as StoryAnnotations
      story.storyName = getStoryName(story) || storyName
      const result = Object.assign(storiesMap, {
        [key]: composeStory(story, meta, globalConfig)
      });
      return result;
    },
    {}
  );
  return composedStories;
}
