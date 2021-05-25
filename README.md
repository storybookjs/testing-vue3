<p align="center">
  <img src="https://user-images.githubusercontent.com/1671563/119191947-9ba7a400-ba7f-11eb-8658-2b7056f1cd12.png" alt="Storybook Testing Vue" width="100" />
</p>

<p align="center">Testing utilities that allow you to reuse your stories in your unit tests</p>

<br/>

## Installation

This library should be installed as one of your project's `devDependencies`:

via [npm](https://www.npmjs.com/)

```
npm install --save-dev @storybook/testing-vue
```

or via [yarn](https://classic.yarnpkg.com/)

```
yarn add --dev @storybook/testing-vue
```

## Setup

### Storybook CSF

This library requires you to be using Storybook's [Component Story Format (CSF)](https://storybook.js.org/docs/react/api/csf) and [hoisted CSF annotations](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#hoisted-csf-annotations), which is the recommended way to write stories since Storybook 6.

Essentially, if your stories look similar to this, you're good to go!

```jsx
// CSF: default export (meta) + named exports (stories)
export default {
  title: 'Example/Button',
  component: Button,
};

export const Primary = () => ({
  template: '<my-button primary />',
});
```

### Global config

> This is an optional step. If you don't have [global decorators](https://storybook.js.org/docs/react/writing-stories/decorators#global-decorators), there's no need to do this. However, if you do, this is a necessary step for your global decorators to be applied.

If you have global decorators/parameters/etc and want them applied to your stories when testing them, you first need to set this up. You can do this by adding to or creating a jest [setup file](https://jestjs.io/docs/configuration#setupfiles-array):

```tsx
// setupFile.js <-- this will run before the tests in jest.
import { setGlobalConfig } from '@storybook/testing-vue';
import * as globalStorybookConfig from './.storybook/preview'; // path of your preview.js file

setGlobalConfig(globalStorybookConfig);
```

For the setup file to be picked up, you need to pass it as an option to jest in your test command:

```json
// package.json
{
  "test": "jest --setupFiles ./setupFile.js"
}
```

## Usage

### `composeStories`

`composeStories` will process all stories from the component you specify, compose args/decorators in all of them and return an object containing the composed stories.

If you use the composed story (e.g. PrimaryButton), the component will render with the args that are passed in the story. However, you are free to pass any props on top of the component, and those props will override the default values passed in the story's args.

```tsx
import { render, screen } from '@testing-library/vue';
import { composeStories } from '@storybook/testing-vue';
import * as stories from './Button.stories'; // import all stories from the stories file

// Every component that is returned maps 1:1 with the stories, but they already contain all decorators from story level, meta level and global level.
const { Primary, Secondary } = composeStories(stories);

test('renders primary button with default args', () => {
  render(Primary());
  const buttonElement = screen.getByText(
    /Text coming from args in stories file!/i
  );
  expect(buttonElement).not.toBeNull();
});

test('renders primary button with overriden props', () => {
  render(Secondary({ label: 'Hello world' })); // you can override props and they will get merged with values from the Story's args
  const buttonElement = screen.getByText(/Hello world/i);
  expect(buttonElement).not.toBeNull();
});
```

### `composeStory`

You can use `composeStory` if you wish to apply it for a single story rather than all of your stories. You need to pass the meta (default export) as well.

```tsx
import { render, screen } from '@testing-library/vue';
import { composeStory } from '@storybook/testing-vue';
import Meta, { Primary as PrimaryStory } from './Button.stories';

// Returns a component that already contain all decorators from story level, meta level and global level.
const Primary = composeStory(PrimaryStory, Meta);

test('onclick handler is called', async () => {
  const onClickSpy = jest.fn();
  render(Primary({ onClick: onClickSpy }));
  const buttonElement = screen.getByRole('button');
  buttonElement.click();
  expect(onClickSpy).toHaveBeenCalled();
});
```

## License

[MIT](./LICENSE)
