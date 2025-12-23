import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { View } from 'react-native';
import { AnimatedText } from '../AnimatedText';
import { ThemeProvider } from '../../../theme';

const meta: Meta<typeof AnimatedText> = {
  title: 'DS.2/Text/AnimatedText',
  component: AnimatedText,
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
    animation: {
      control: 'select',
      options: ['fadeIn', 'slideUp', 'typewriter'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedText>;

export const FadeIn: Story = {
  args: {
    animation: 'fadeIn',
    children: 'This text fades in',
  },
};

export const SlideUp: Story = {
  args: {
    animation: 'slideUp',
    children: 'This text slides up',
  },
};

export const Typewriter: Story = {
  args: {
    animation: 'typewriter',
    children: 'This text types out',
  },
};

export const AllAnimations: Story = {
  render: () => (
    <View style={{ gap: 32 }}>
      <AnimatedText animation="fadeIn" variant="titleLg">
        Fade In Animation
      </AnimatedText>
      <AnimatedText animation="slideUp" variant="titleLg">
        Slide Up Animation
      </AnimatedText>
      <AnimatedText animation="typewriter" variant="titleLg">
        Typewriter Animation
      </AnimatedText>
    </View>
  ),
};
