import { addons } from '@storybook/manager-api';

addons.setConfig({
  navSize: 230,
  bottomPanelHeight: 300,
  rightPanelWidth: 500,
  panelPosition: 'right',
  enableShortcuts: true,
  showToolbar: true,
  theme: undefined,
  selectedPanel: undefined,
  initialActive: 'sidebar',
  sidebar: {
    showRoots: false,
    collapsedRoots: [],
  },
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});