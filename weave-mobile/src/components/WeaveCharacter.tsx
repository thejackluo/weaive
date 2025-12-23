import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface WeaveCharacterProps {
  characterState: 'strand' | 'thread' | 'weave';
  size?: number;
}

/**
 * WeaveCharacter - Visualizes user progress with evolving character states
 *
 * Character evolution:
 * - Level 1-3: "strand" - Simple single line
 * - Level 4-7: "thread" - Multiple woven lines
 * - Level 8+: "weave" - Complex interlocking pattern
 *
 * US-5.1: Weave Character Visualization
 */
export function WeaveCharacter({ characterState, size = 64 }: WeaveCharacterProps) {
  const renderStrand = () => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Simple strand - single curved line */}
      <Circle
        cx="32"
        cy="32"
        r="28"
        stroke="#3b82f6"
        strokeWidth="3"
        fill="none"
        opacity={0.3}
      />
      <Path
        d="M 32 10 Q 40 20 32 30 Q 24 40 32 50"
        stroke="#3b82f6"
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );

  const renderThread = () => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Thread - interwoven lines */}
      <Circle
        cx="32"
        cy="32"
        r="28"
        stroke="#8b5cf6"
        strokeWidth="3"
        fill="none"
        opacity={0.2}
      />
      <Path
        d="M 20 12 Q 28 20 20 28 Q 12 36 20 44 Q 28 52 20 60"
        stroke="#8b5cf6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <Path
        d="M 32 8 Q 40 18 32 28 Q 24 38 32 48 Q 40 58 32 64"
        stroke="#3b82f6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 44 12 Q 36 20 44 28 Q 52 36 44 44 Q 36 52 44 60"
        stroke="#10b981"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
    </Svg>
  );

  const renderWeave = () => (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* Weave - complex interlocking pattern */}
      <Circle
        cx="32"
        cy="32"
        r="28"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        opacity={0.15}
      />

      {/* Horizontal weave lines */}
      <Path
        d="M 8 16 Q 20 18 32 16 Q 44 14 56 16"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity={0.9}
      />
      <Path
        d="M 8 32 Q 20 34 32 32 Q 44 30 56 32"
        stroke="#3b82f6"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M 8 48 Q 20 50 32 48 Q 44 46 56 48"
        stroke="#10b981"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity={0.9}
      />

      {/* Vertical weave lines */}
      <Path
        d="M 16 8 Q 18 20 16 32 Q 14 44 16 56"
        stroke="#10b981"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />
      <Path
        d="M 32 8 Q 34 20 32 32 Q 30 44 32 56"
        stroke="#8b5cf6"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity={0.8}
      />
      <Path
        d="M 48 8 Q 50 20 48 32 Q 46 44 48 56"
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity={0.7}
      />

      {/* Diagonal accents */}
      <Line
        x1="12"
        y1="12"
        x2="20"
        y2="20"
        stroke="#3b82f6"
        strokeWidth="2"
        opacity={0.5}
      />
      <Line
        x1="44"
        y1="44"
        x2="52"
        y2="52"
        stroke="#8b5cf6"
        strokeWidth="2"
        opacity={0.5}
      />
    </Svg>
  );

  return (
    <View className="items-center justify-center" style={{ width: size, height: size }}>
      {characterState === 'strand' && renderStrand()}
      {characterState === 'thread' && renderThread()}
      {characterState === 'weave' && renderWeave()}
    </View>
  );
}
