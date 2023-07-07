import type { Preview } from '@storybook/vue3';

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  // decorators: [(_args, { globals: { locale } }) => ({ template: `<div>Locale: ${locale}<div><story/></div></div>` })],
  globalTypes: {
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'es', right: '🇪🇸', title: 'Español' },
          { value: 'pt', right: '🇧🇷', title: 'Português' },
          { value: 'kr', right: '🇰🇷', title: '한국어' },
        ],
      },
    },
  }
};

export default preview;
