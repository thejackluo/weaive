import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { Button } from '../Button';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof Button> = {
  title: 'DS.2/Button/Button',
  component: Button,
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
      options: ['primary', 'secondary', 'ghost', 'destructive', 'ai', 'unstyled'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const AllVariants: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button variant="primary">Primary Button</Button>
      <Button variant="secondary">Secondary Button</Button>
      <Button variant="ghost">Ghost Button</Button>
      <Button variant="destructive">Destructive Button</Button>
      <Button variant="ai">AI Button</Button>
      <Button variant="unstyled">Unstyled Button</Button>
    </View>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button size="sm">Small Button</Button>
      <Button size="md">Medium Button</Button>
      <Button size="lg">Large Button</Button>
    </View>
  ),
};

export const States: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button>Default State</Button>
      <Button loading>Loading State</Button>
      <Button disabled>Disabled State</Button>
    </View>
  ),
};

export const ComposableAnatomy: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button>
        <Button.Icon name="sparkles" />
        <Button.Text>With Icon</Button.Text>
      </Button>
      <Button>
        <Button.Text>Text Only</Button.Text>
      </Button>
      <Button loading>
        <Button.Spinner />
        <Button.Text>Loading</Button.Text>
      </Button>
    </View>
  ),
};

export const FullWidth: Story = {
  render: () => (
    <View style={{ gap: 16 }}>
      <Button fullWidth>Full Width Primary</Button>
      <Button variant="secondary" fullWidth>
        Full Width Secondary
      </Button>
    </View>
  ),
};

export const Playground: Story = {
  args: {
    variant: 'primary',
    size: 'md',
    children: 'Button',
  },
};
