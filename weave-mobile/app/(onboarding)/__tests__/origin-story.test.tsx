/**
 * Tests for Origin Story Screen
 * Story 1.7: Commitment Ritual & Origin Story
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OriginStoryScreen from '../origin-story';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-image-picker');
jest.mock('expo-av');
jest.mock('expo-haptics');
jest.mock('lottie-react-native', () => 'LottieView');
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

describe('OriginStoryScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default AsyncStorage mock
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        preferred_name: 'Test User',
        selected_painpoints: ['clarity', 'action'],
        identity_traits: ['Disciplined', 'Focused', 'Intentional'],
      })
    );
  });

  describe('Screen 1: Narrative Validation', () => {
    it('should render title and narrative content', async () => {
      const { getByText } = render(<OriginStoryScreen />);

      await waitFor(() => {
        expect(getByText('This is where your story shifts.')).toBeTruthy();
      });
    });

    it('should render continue button', async () => {
      const { getByText } = render(<OriginStoryScreen />);

      await waitFor(() => {
        const button = getByText('Take the first step →');
        expect(button).toBeTruthy();
      });
    });
  });

  describe('Screen 2: Origin Story Capture', () => {
    it('should render title after navigation', async () => {
      const { getByText } = render(<OriginStoryScreen />);

      await waitFor(() => {
        fireEvent.press(getByText('Take the first step →'));
      });

      await waitFor(() => {
        expect(getByText("Let's make this moment official.")).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible labels for buttons', async () => {
      const { getByLabelText } = render(<OriginStoryScreen />);

      await waitFor(() => {
        const button = getByLabelText('Take the first step');
        expect(button).toBeTruthy();
      });
    });
  });
});
