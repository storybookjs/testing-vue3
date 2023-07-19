import {
  composeStory as originalComposeStory,
  composeStories as originalComposeStories,
  setProjectAnnotations as originalSetProjectAnnotations,
} from '@storybook/preview-api';
import type {
  Args,
  ProjectAnnotations,
  ComposedStory,
  Store_CSFExports,
  StoriesWithPartialProps,
} from '@storybook/types';
import { deprecate } from '@storybook/client-logger';
import type { VueRenderer, Meta } from "@storybook/vue3";

//import { globalRender as render } from './utils';
import { render } from './utils';  // use current implementation of render function in  @storybook/vue3

/** Function that sets the global config of your storybook. The global config is the preview module of your .storybook folder.
 *
 * It should be run a single time, so that your global config (e.g. decorators) is applied to your stories when using `composeStories` or `composeStory`.
 *
 * Example:
 *```jsx
 * // setup.js (for jest)
 * import { setProjectAnnotations } from '@storybook/vue3';
 * import * as projectAnnotations from './.storybook/preview';
 *
 * setProjectAnnotations(projectAnnotations);
 *```
 *
 * @param projectAnnotations - e.g. (import * as projectAnnotations from '../.storybook/preview')
 */
export function setProjectAnnotations(
  projectAnnotations: ProjectAnnotations<VueRenderer> | ProjectAnnotations<VueRenderer>[]
) {
  originalSetProjectAnnotations<VueRenderer>(projectAnnotations);
}

/**
 *
 * @deprecated Use setProjectAnnotations instead
 */
export function setGlobalConfig(
  projectAnnotations: ProjectAnnotations<VueRenderer> | ProjectAnnotations<VueRenderer>[]
) {
  deprecate(`setGlobalConfig is deprecated. Use setProjectAnnotations instead.`);
  setProjectAnnotations(projectAnnotations);
}

// This will not be necessary once we have auto preset loading
const defaultProjectAnnotations: ProjectAnnotations<VueRenderer> = {
  render,
};

/**
 * Function that will receive a story along with meta (e.g. a default export from a .stories file)
 * and optionally projectAnnotations e.g. (import * from '../.storybook/preview)
 * and will return a composed component that has all args/parameters/decorators/etc combined and applied to it.
 *
 *
 * It's very useful for reusing a story in scenarios outside of Storybook like unit testing.
 *
 * Example:
 *```jsx
 * import { render } from '@testing-library/vue3';
 * import { composeStory } from '@storybook/vue3';
 * import Meta, { Primary as PrimaryStory } from './Button.stories';
 *
 * const Primary = composeStory(PrimaryStory, Meta);
 *
 * test('renders primary button with Hello World', () => {
 *   const { getByText } = render(Primary({ label: 'Hello world' }));
 *   expect(getByText(/Hello world/i)).not.toBeNull();
 * });
 *```
 *
 * @param story
 * @param componentAnnotations - e.g. (import Meta from './Button.stories')
 * @param [projectAnnotations] - e.g. (import * as projectAnnotations from '../.storybook/preview') this can be applied automatically if you use `setProjectAnnotations` in your setup files.
 * @param [exportsName] - in case your story does not contain a name and you want it to have a name.
 */
export function composeStory<TArgs extends Args = Args>(
  story: ComposedStory<VueRenderer, TArgs>,
  componentAnnotations: Meta<TArgs | any>,
  projectAnnotations?: ProjectAnnotations<VueRenderer>,
  exportsName?: string
) {
  return originalComposeStory<VueRenderer, TArgs>(
    story as ComposedStory<VueRenderer, Args>,
    componentAnnotations,
    projectAnnotations,
    defaultProjectAnnotations,
    exportsName
  );
}

/**
 * Function that will receive a stories import (e.g. `import * as stories from './Button.stories'`)
 * and optionally projectAnnotations (e.g. `import * from '../.storybook/preview`)
 * and will return an object containing all the stories passed, but now as a composed component that has all args/parameters/decorators/etc combined and applied to it.
 *
 *
 * It's very useful for reusing stories in scenarios outside of Storybook like unit testing.
 *
 * Example:
 *```jsx
 * import { render } from '@testing-library/vue3';
 * import { composeStories } from '@storybook/vue3';
 * import * as stories from './Button.stories';
 *
 * const { Primary, Secondary } = composeStories(stories);
 *
 * test('renders primary button with Hello World', () => {
 *   const { getByText } = render(Primary({ label: 'Hello world' }));
 *   expect(getByText(/Hello world/i)).not.toBeNull();
 * });
 *```
 *
 * @param csfExports - e.g. (import * as stories from './Button.stories')
 * @param [projectAnnotations] - e.g. (import * as projectAnnotations from '../.storybook/preview') this can be applied automatically if you use `setProjectAnnotations` in your setup files.
 */
export function composeStories<TModule extends Store_CSFExports<VueRenderer, any>>(
  csfExports: TModule,
  projectAnnotations?: ProjectAnnotations<VueRenderer>
) {
  // @ts-expect-error (Converted from ts-ignore)
  const composedStories = originalComposeStories(csfExports, projectAnnotations, composeStory);

  return composedStories as unknown as Omit<
    StoriesWithPartialProps<VueRenderer, TModule>,
    keyof Store_CSFExports
  >;
}
