import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { Text } from '../Text';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof Text> = {
  title: 'DS.2/Text/Text',
  component: Text,
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
    variant: {
      control: 'select',
      options: [
        'displayLg',
        'displayMd',
        'displaySm',
        'titleLg',
        'titleMd',
        'titleSm',
        'bodyLg',
        'bodyMd',
        'bodySm',
        'caption',
        'label',
      ],
    },
    color: {
      control: 'select',
      options: ['text.primary', 'text.secondary', 'text.accent', 'text.error'],
    },
    weight: {
      control: 'select',
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Text variant="displayLg">Display Large</Text>
      <Text variant="displayMd">Display Medium</Text>
      <Text variant="displaySm">Display Small</Text>
      <Text variant="titleLg">Title Large</Text>
      <Text variant="titleMd">Title Medium</Text>
      <Text variant="titleSm">Title Small</Text>
      <Text variant="bodyLg">Body Large</Text>
      <Text variant="bodyMd">Body Medium</Text>
      <Text variant="bodySm">Body Small</Text>
      <Text variant="caption">Caption Text</Text>
      <Text variant="label">Label Text</Text>
    </View>
  ),
};

export const ColorVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Text color="text.primary">Primary Color</Text>
      <Text color="text.secondary">Secondary Color</Text>
      <Text color="text.accent">Accent Color</Text>
      <Text color="text.error">Error Color</Text>
    </View>
  ),
};

export const WeightVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Text weight="normal">Normal Weight</Text>
      <Text weight="medium">Medium Weight</Text>
      <Text weight="semibold">Semibold Weight</Text>
      <Text weight="bold">Bold Weight</Text>
    </View>
  ),
};

export const Truncation: Story = {
  render: () => (
    <View style={{ gap: 16, maxWidth: 300 }}>
      <Text numberOfLines={1}>
        This is a very long text that should be truncated after one line to demonstrate the truncation feature
      </Text>
      <Text numberOfLines={2}>
        This is a very long text that should be truncated after two lines to demonstrate the truncation feature with multiple lines
      </Text>
    </View>
  ),
};

export const Playground: Story = {
  args: {
    variant: 'bodyMd',
    children: 'Customize this text',
  },
};
