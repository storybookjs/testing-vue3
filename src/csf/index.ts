import { isExportStory,  } from '@storybook/csf';
import type {
  Renderer,
  Args,
  ComponentAnnotations,
  LegacyStoryAnnotationsOrFn,
  ProjectAnnotations,
  ComposedStoryPlayFn,
  ComposeStoryFn,
  Store_CSFExports,
  StoryContext,
  Parameters,
  PreparedStoryFn,
} from '@storybook/types';

import { HooksContext , composeConfigs,prepareStory ,normalizeStory } from '@storybook/preview-api';

import { prepareContext, normalizeComponentAnnotations ,getValuesFromArgTypes , normalizeProjectAnnotations } from '@storybook/preview-api/dist/store';


let GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS = composeConfigs([]);

export function setProjectAnnotations<TRenderer extends Renderer = Renderer>(
  projectAnnotations: ProjectAnnotations<TRenderer> | ProjectAnnotations<TRenderer>[]
) {
  const annotations = Array.isArray(projectAnnotations) ? projectAnnotations : [projectAnnotations];
  GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS = composeConfigs(annotations);
}

export function composeStory<TRenderer extends Renderer = Renderer, TArgs extends Args = Args>(
  storyAnnotations: LegacyStoryAnnotationsOrFn<TRenderer>,
  componentAnnotations: ComponentAnnotations<TRenderer, TArgs>,
  projectAnnotations: ProjectAnnotations<TRenderer> = GLOBAL_STORYBOOK_PROJECT_ANNOTATIONS as ProjectAnnotations<TRenderer>,
  defaultConfig: ProjectAnnotations<TRenderer> = {},
  exportsName?: string
): PreparedStoryFn<TRenderer, Partial<TArgs>> {
  if (storyAnnotations === undefined) {
    throw new Error('Expected a story but received undefined.');
  }

  // @TODO: Support auto title
  // eslint-disable-next-line no-param-reassign
  componentAnnotations.title = componentAnnotations.title ?? 'ComposedStory';
  const normalizedComponentAnnotations =
    normalizeComponentAnnotations<TRenderer>(componentAnnotations);

  const storyName =
    exportsName ||
    storyAnnotations.storyName ||
    storyAnnotations.story?.name ||
    storyAnnotations.name ||
    'unknown';

  const normalizedStory = normalizeStory<TRenderer>(
    storyName,
    storyAnnotations,
    normalizedComponentAnnotations
  );

  const normalizedProjectAnnotations = normalizeProjectAnnotations<TRenderer>({
    ...projectAnnotations,
    ...defaultConfig,
  });

  const story = prepareStory<TRenderer>(
    normalizedStory,
    normalizedComponentAnnotations,
    normalizedProjectAnnotations
  );

  const defaultGlobals = getValuesFromArgTypes(projectAnnotations.globalTypes);

  const composedStory = (extraArgs: Partial<TArgs>) => {
    const context: Partial<StoryContext> = {
      ...story,
      hooks: new HooksContext(),
      globals: defaultGlobals,
      args: { ...story.initialArgs, ...extraArgs },
    };

    return story.unboundStoryFn(prepareContext(context as StoryContext));
  };
  console.log(' --- composedStory ', composedStory);
  composedStory.storyName = storyName;
  composedStory.args = story.initialArgs as Partial<TArgs>;
  composedStory.play = story.playFunction as ComposedStoryPlayFn<TRenderer, Partial<TArgs>>;
  composedStory.parameters = story.parameters as Parameters;
  composedStory.id = story.id;

  return composedStory;
}

export function composeStories<TModule extends Store_CSFExports>(
  storiesImport: TModule,
  globalConfig: ProjectAnnotations<Renderer>,
  composeStoryFn: ComposeStoryFn
) {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { default: meta, __esModule, __namedExportsOrder, ...stories } = storiesImport;
  const composedStories = Object.entries(stories).reduce((storiesMap, [exportsName, story]) => {
    if (!isExportStory(exportsName, meta)) {
      return storiesMap;
    }

    const result = Object.assign(storiesMap, {
      [exportsName]: composeStoryFn(
        story as LegacyStoryAnnotationsOrFn,
        meta,
        globalConfig,
        exportsName
      ),
    });
    return result;
  }, {});

  return composedStories;
}
