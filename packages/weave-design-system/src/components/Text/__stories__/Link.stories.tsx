import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { Link } from '../Link';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof Link> = {
  title: 'DS.2/Text/Link',
  component: Link,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <View style={{ padding: 20 }}>
          <Story />
        </View>
      </ThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    children: 'Click this link',
    onPress: () => console.log('Link pressed'),
  },
};

export const External: Story = {
  args: {
    children: 'External link',
    href: 'https://example.com',
    external: true,
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled link',
    disabled: true,
    onPress: () => console.log('This should not fire'),
  },
};

export const AllStates: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Link onPress={() => console.log('Default pressed')}>Default Link</Link>
      <Link href="https://example.com" external>
        External Link
      </Link>
      <Link disabled>Disabled Link</Link>
    </View>
  ),
};
