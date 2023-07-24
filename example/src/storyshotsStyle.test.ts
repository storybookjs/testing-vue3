import { describe, expect, test } from "vitest";
import type { Meta, StoryFn } from "@storybook/vue3";
import { render } from "@testing-library/vue";
import { composeStories } from "../../dist";

type StoryFile = {
  default: Meta;
  [name: string]: StoryFn | Meta;
};

const compose = (entry: StoryFile): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(
        entry
      )}, ${e}`
    );
  }
};

describe("Storybook Tests", async () => {
  const modules = Object.entries(
    import.meta.glob<StoryFile>("./stories/*.stories.ts(x)?", { eager: true })
  ).map(([filePath, storyFile]) => ({ filePath, storyFile }));
  describe.each(
    modules.map(({ filePath, storyFile }) => {
      return { name: storyFile.default.title, storyFile, filePath };
    })
  )("$name", ({ name, storyFile, filePath }) => {
    test.skipIf(name?.includes("NoStoryshots")).each(
      Object.entries(compose(storyFile))
        .map(([name, story]) => ({ name, story }))
        .filter(
          (env) =>
            name?.includes("NoStoryshots") || !env.name?.includes("NoSnapshot")
        )
    )("$name", async (value) => {
      const mounted = render(value.story());
      await new Promise<void>((resolve) => setTimeout(() => resolve(), 1));
      const snapshotPath = `./__snapshots__/${filePath.replace(
        /\.stories.[^/.]+$/,
        ""
      )}_snapshots_${value.name}.html`;

      expect(mounted.html()).toMatchFileSnapshot(snapshotPath);
    });
  });
});
