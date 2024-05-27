/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: ["../stories/*.mdx", "../stories/*.story.js",],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-actions",
    "@storybook/blocks",
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {
      docgen: 'vue-component-meta',
    },
  },
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  async viteFinal(config, { configType }) {
    const { mergeConfig } = await import('vite')
    return mergeConfig(config, {
      assetsInclude: ['**/*.md']
    })
  },
}
export default config
