import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { Icon } from '../Icon';
import { Text } from '../../Text';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof Icon> = {
  title: 'DS.2/Icon/Icon',
  component: Icon,
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
    name: {
      control: 'select',
      options: [
        'sparkles',
        'check-circle',
        'alert-circle',
        'arrow-right',
        'x',
        'menu',
        'settings',
        'user',
        'search',
        'heart',
      ],
    },
    size: {
      control: 'number',
    },
    color: {
      control: 'select',
      options: ['text.primary', 'text.secondary', 'text.accent', 'text.error'],
    },
    strokeWidth: {
      control: 'number',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Icon>;

export const IconGallery: Story = {
  render: () => (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', gap: 16, flexWrap: 'wrap' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="sparkles" />
          <Text variant="caption">sparkles</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="check-circle" />
          <Text variant="caption">check-circle</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="alert-circle" />
          <Text variant="caption">alert-circle</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="arrow-right" />
          <Text variant="caption">arrow-right</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="x" />
          <Text variant="caption">x</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="menu" />
          <Text variant="caption">menu</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="settings" />
          <Text variant="caption">settings</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="user" />
          <Text variant="caption">user</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="search" />
          <Text variant="caption">search</Text>
        </View>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Icon name="heart" />
          <Text variant="caption">heart</Text>
        </View>
      </View>
    </View>
  ),
};

export const Sizes: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={16} />
        <Text variant="caption">16px</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={24} />
        <Text variant="caption">24px</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={32} />
        <Text variant="caption">32px</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={48} />
        <Text variant="caption">48px</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" size={64} />
        <Text variant="caption">64px</Text>
      </View>
    </View>
  ),
};

export const Colors: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" color="text.primary" />
        <Text variant="caption">primary</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" color="text.secondary" />
        <Text variant="caption">secondary</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" color="text.accent" />
        <Text variant="caption">accent</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" color="text.error" />
        <Text variant="caption">error</Text>
      </View>
    </View>
  ),
};

export const StrokeWidths: Story = {
  render: () => (
    <View style={{ gap: 16, flexDirection: 'row', alignItems: 'center' }}>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" strokeWidth={1} />
        <Text variant="caption">1</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" strokeWidth={1.5} />
        <Text variant="caption">1.5</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" strokeWidth={2} />
        <Text variant="caption">2</Text>
      </View>
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Icon name="sparkles" strokeWidth={2.5} />
        <Text variant="caption">2.5</Text>
      </View>
    </View>
  ),
};

export const Playground: Story = {
  args: {
    name: 'sparkles',
    size: 24,
    color: 'text.primary',
    strokeWidth: 2,
  },
};
