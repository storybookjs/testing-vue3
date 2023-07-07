import { render, screen } from "@testing-library/vue";
import * as stories from "./Button.stories";
import Button from "./Button";
import { test, vi } from "vitest";
import { composeStories, composeStory, setProjectAnnotations } from "../../../dist";
import { expectTypeOf } from 'expect-type';
import { Meta } from '@storybook/vue3';

// example with composeStories, returns an object with all stories composed with args/decorators
const { CSF3Primary } = composeStories(stories);

// example with composeStory, returns a single story composed with args/decorators
const Secondary = composeStory(stories.CSF2Secondary, stories.default);

test('renders primary button', () => {
  render(CSF3Primary({ label: 'Hello world' }));
  const buttonElement = screen.getByText(/Hello world/i);
  expect(buttonElement).toBeInTheDocument();
});

test('reuses args from composed story', () => {
  render(Secondary());
  const buttonElement = screen.getByRole('button');
  expect(buttonElement.textContent).toEqual(Secondary.args.label);
});

test('onclick handler is called', async () => {
  const onClickSpy = vi.fn();
  render(Secondary({ onClick: onClickSpy }));
  const buttonElement = screen.getByRole('button');
  buttonElement.click();
  expect(onClickSpy).toHaveBeenCalled();
});

test('reuses args from composeStories', () => {
  const { getByText } = render(CSF3Primary);
  const buttonElement = getByText(/foo/i);
  expect(buttonElement).toBeInTheDocument();
});

describe('projectAnnotations', () => {
  test('renders with default projectAnnotations', () => {
    const WithEnglishText = composeStory(stories.CSF2StoryWithLocale, stories.default);
    const { getByText } = render(WithEnglishText());
    const buttonElement = getByText('Hello!');
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with custom projectAnnotations via composeStory params', () => {
    const WithPortugueseText = composeStory(stories.CSF2StoryWithLocale, stories.default, {
      globalTypes: { locale: { defaultValue: 'pt' } } as any,
    });
    const { getByText } = render(WithPortugueseText());
    const buttonElement = getByText('Olá!');
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with custom projectAnnotations via setProjectAnnotations', () => {
    setProjectAnnotations([{ parameters: { injected: true } }]);
    const Story = composeStory(stories.CSF2StoryWithLocale, stories.default);
    expect(Story.parameters?.injected).toBe(true);
  });
});

describe('CSF3', () => {
  test('renders with inferred globalRender', () => {
    const Primary = composeStory(stories.CSF3Button, stories.default);

    render(Primary({ label: 'Hello world' }));
    const buttonElement = screen.getByText(/Hello world/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders with custom render function', () => {
    const Primary = composeStory(stories.CSF3ButtonWithRender, stories.default);

    render(Primary());
    expect(screen.getByTestId('custom-render')).toBeInTheDocument();
  });

  test('renders with play function', async () => {
    const CSF3InputFieldFilled = composeStory(stories.CSF3InputFieldFilled, stories.default);

    const { container } = render(CSF3InputFieldFilled());

    await CSF3InputFieldFilled.play({ canvasElement: container });

    const input = screen.getByTestId('input') as HTMLInputElement;
    expect(input.value).toEqual('Hello world!');
  });
});

describe('ComposeStories types', () => {
  test('Should support typescript operators', () => {
    type ComposeStoriesParam = Parameters<typeof composeStories>[0];

    expectTypeOf({
      ...stories,
      default: stories.default as Meta<typeof Button>,
    }).toMatchTypeOf<ComposeStoriesParam>();

    expectTypeOf({
      ...stories,
      default: stories.default satisfies Meta<typeof Button>,
    }).toMatchTypeOf<ComposeStoriesParam>();
  });
});
