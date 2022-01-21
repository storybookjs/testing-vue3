const invalidStoryTypes = new Set(["string", "number", "boolean", "symbol"]);

export const isInvalidStory = (story?: any) =>
  !story || Array.isArray(story) || invalidStoryTypes.has(typeof story);
