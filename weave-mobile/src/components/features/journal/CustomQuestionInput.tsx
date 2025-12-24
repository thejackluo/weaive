/**
 * Story 4.1b: Custom Question Input Component
 *
 * Renders different input types for custom reflection questions:
 * - Text: Single-line text input (100 char max)
 * - Numeric: Slider 1-10
 * - Yes/No: Toggle switch
 *
 * AC #10: Dynamic custom question rendering
 */

import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export type CustomQuestionType = 'text' | 'numeric' | 'yes_no';

export interface CustomQuestion {
  id: string;
  question: string;
  type: CustomQuestionType;
  created_at: string;
}

interface CustomQuestionInputProps {
  question: CustomQuestion;
  value: string | number | boolean | undefined;
  onChange: (value: string | number | boolean) => void;
}

export default function CustomQuestionInput({
  question,
  value,
  onChange,
}: CustomQuestionInputProps) {
  const renderInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <View>
            <TextInput
              style={styles.textInput}
              maxLength={100}
              value={(value as string) || ''}
              onChangeText={onChange}
              placeholder="Your answer..."
              placeholderTextColor="#999"
            />
            <RNText style={styles.characterCount}>{((value as string) || '').length} / 100</RNText>
          </View>
        );

      case 'numeric': {
        const numValue = typeof value === 'number' ? value : 5;
        return (
          <View>
            <RNText style={styles.scoreDisplay}>{numValue}</RNText>
            <View style={styles.sliderTrack}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[styles.sliderDot, num <= numValue && styles.sliderDotActive]}
                  onPress={() => onChange(num)}
                >
                  <RNText style={styles.sliderDotText}>{num}</RNText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      }

      case 'yes_no': {
        const boolValue = typeof value === 'boolean' ? value : false;
        return (
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, !boolValue && styles.toggleButtonActive]}
              onPress={() => onChange(false)}
            >
              <RNText style={[styles.toggleButtonText, !boolValue && styles.toggleButtonTextActive]}>
                No
              </RNText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, boolValue && styles.toggleButtonActive]}
              onPress={() => onChange(true)}
            >
              <RNText style={[styles.toggleButtonText, boolValue && styles.toggleButtonTextActive]}>
                Yes
              </RNText>
            </TouchableOpacity>
          </View>
        );
      }

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <RNText style={styles.questionLabel}>{question.question}</RNText>
      {renderInput()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  questionLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'right',
    marginTop: 8,
  },
  scoreDisplay: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  sliderTrack: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderDotActive: {
    backgroundColor: '#10b981',
  },
  sliderDotText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  toggleButtonTextActive: {
    color: '#fff',
  },
});
