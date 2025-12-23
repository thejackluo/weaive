import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { IconButton } from '../IconButton';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof IconButton> = {
  title: 'DS.2/Button/IconButton',
  component: IconButton,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
  argTypes: {
    icon: {
      control: 'select',
      options: ['sparkles', 'check-circle', 'x', 'menu', 'settings', 'user'],
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive', 'ai'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
      <IconButton icon="sparkles" variant="primary" />
      <IconButton icon="check-circle" variant="secondary" />
      <IconButton icon="x" variant="ghost" />
      <IconButton icon="menu" variant="destructive" />
      <IconButton icon="settings" variant="ai" />
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', alignItems: 'center' }}>
      <IconButton icon="sparkles" size="sm" />
      <IconButton icon="sparkles" size="md" />
      <IconButton icon="sparkles" size="lg" />
    </View>
  ),
};

export const Playground: Story = {
  args: {
    icon: 'sparkles',
    variant: 'primary',
    size: 'md',
  },
};
