import { fn } from '@storybook/test';
import primary_select from "./primary_select.vue"

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
export default {
  title: 'docs/geleia',
  component: primary_select,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['small', 'medium', 'large'] },
    backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args

export const FirstStory = {
  render: (args) => ({
    components: { primary_select },
    setup() {
      return { args };
    },
    template: '<primary_select titleFreeSlot="Free Slot" :selectConfig="[{ freeSlot: true }]"/>',
  }),
  // args: {
  //   //👇 The args you need here will depend on your component
  //   text: 'botão',
  //   alert: 'descrição'
  // },
};
