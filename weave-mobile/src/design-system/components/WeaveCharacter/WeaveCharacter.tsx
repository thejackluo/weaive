/**
 * WeaveCharacter Component - Weave Design System
 *
 * A mathematically beautiful, animated curve visualization that evolves as the user progresses.
 * Uses parametric equations to create complex, intertwined paths that represent identity weaving.
 *
 * Mathematical Basis:
 * - Superellipse curves (Lamé curves)
 * - Lissajous curves for complex oscillations
 * - Bézier curves for smooth transitions
 * - Frequency and amplitude increase with level
 *
 * Features:
 * - Curves become more complex as level increases
 * - Colors shift from single to gradient (representing identity clarity)
 * - Animated breathing effect
 * - Intersection points glow (representing key moments)
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../theme/ThemeProvider';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface WeaveCharacterProps {
  level: number;          // 1-100 - determines curve complexity
  progress: number;       // 0-1 - progress to next level
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;     // Whether to animate breathing
  showLevel?: boolean;    // Show level number
}

export function WeaveCharacter({
  level,
  progress,
  size = 'medium',
  animated = true,
  showLevel = true,
}: WeaveCharacterProps) {
  const { colors } = useTheme();

  // Animation values
  const breathe = useSharedValue(1);
  const rotation = useSharedValue(0);
  const complexity = useSharedValue(level);

  useEffect(() => {
    // Breathing animation
    if (animated) {
      breathe.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    }

    // Slow rotation
    rotation.value = withRepeat(
      withTiming(360, { duration: 60000, easing: Easing.linear }),
      -1,
      false
    );

    // Complexity grows with level
    complexity.value = withTiming(level, { duration: 1000, easing: Easing.out(Easing.cubic) });
  }, [animated, level, breathe, rotation, complexity]);

  // Size dimensions
  const sizeValue = size === 'small' ? 80 : size === 'large' ? 200 : 120;
  const center = sizeValue / 2;

  // Generate path data for parametric curves
  const pathData = generateWeavePathData(level, sizeValue);

  // Animated styles
  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: breathe.value },
        { rotate: `${rotation.value}deg` },
      ],
    };
  });

  return (
    <View style={[styles.container, { width: sizeValue, height: sizeValue }]}>
      <Animated.View style={[styles.svgContainer, animatedContainerStyle]}>
        <Svg width={sizeValue} height={sizeValue} viewBox={`0 0 ${sizeValue} ${sizeValue}`}>
          {/* Gradient definitions */}
          <Defs>
            <LinearGradient id="weaveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accent[400]} stopOpacity={1} />
              <Stop offset="50%" stopColor={colors.violet[500]} stopOpacity={1} />
              <Stop offset="100%" stopColor={colors.emerald[500]} stopOpacity={1} />
            </LinearGradient>
          </Defs>

          {/* Main weave path */}
          <AnimatedPath
            d={pathData.main}
            stroke="url(#weaveGradient)"
            strokeWidth={2.5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.9}
          />

          {/* Secondary interwoven path */}
          <AnimatedPath
            d={pathData.secondary}
            stroke={colors.amber[500]}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.6}
          />

          {/* Tertiary path (appears at higher levels) */}
          {level >= 20 && (
            <AnimatedPath
              d={pathData.tertiary}
              stroke={colors.violet[400]}
              strokeWidth={1.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.4}
            />
          )}

          {/* Intersection glow points */}
          {pathData.intersections.map((point, i) => (
            <AnimatedCircle
              key={i}
              cx={point.x}
              cy={point.y}
              r={3}
              fill={colors.accent[300]}
              opacity={0.8}
            />
          ))}

          {/* Center core */}
          <AnimatedCircle
            cx={center}
            cy={center}
            r={interpolate(level, [1, 100], [4, 8])}
            fill={colors.background.elevated}
            stroke="url(#weaveGradient)"
            strokeWidth={2}
          />
        </Svg>
      </Animated.View>

      {/* Level indicator */}
      {showLevel && (
        <View style={styles.levelContainer}>
          <Animated.Text style={[styles.levelText, { color: colors.text.primary }]}>
            {level}
          </Animated.Text>
        </View>
      )}

      {/* Progress ring */}
      <View style={[styles.progressRing, { width: sizeValue, height: sizeValue }]}>
        <Svg width={sizeValue} height={sizeValue}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={colors.emerald[500]} />
              <Stop offset="100%" stopColor={colors.accent[500]} />
            </LinearGradient>
          </Defs>

          {/* Progress arc */}
          <AnimatedPath
            d={generateArcPath(center, center, center - 5, 0, progress * 360)}
            stroke="url(#progressGradient)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
      </View>
    </View>
  );
}

/**
 * Generate parametric curve path data based on level
 * Uses Lissajous curves with increasing frequency and complexity
 */
function generateWeavePathData(level: number, size: number) {
  const center = size / 2;
  const amplitude = center * 0.7;

  // Frequencies increase with level
  const freqA = 2 + Math.floor(level / 20);
  const freqB = 3 + Math.floor(level / 15);
  const freqC = 5 + Math.floor(level / 10);

  const points = 200; // Number of points in the curve

  // Main Lissajous curve
  const mainPath = [];
  for (let t = 0; t <= points; t++) {
    const theta = (t / points) * 2 * Math.PI;
    const x = center + amplitude * Math.sin(freqA * theta + level * 0.01);
    const y = center + amplitude * Math.sin(freqB * theta);
    mainPath.push(t === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  // Secondary interwoven curve (phase-shifted)
  const secondaryPath = [];
  for (let t = 0; t <= points; t++) {
    const theta = (t / points) * 2 * Math.PI;
    const x = center + amplitude * 0.8 * Math.sin(freqB * theta + Math.PI / 4);
    const y = center + amplitude * 0.8 * Math.sin(freqA * theta + Math.PI / 4);
    secondaryPath.push(t === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  // Tertiary curve (higher complexity)
  const tertiaryPath = [];
  for (let t = 0; t <= points; t++) {
    const theta = (t / points) * 2 * Math.PI;
    const x = center + amplitude * 0.6 * Math.sin(freqC * theta + Math.PI / 2);
    const y = center + amplitude * 0.6 * Math.sin((freqC - 1) * theta + Math.PI / 2);
    tertiaryPath.push(t === 0 ? `M ${x} ${y}` : `L ${x} ${y}`);
  }

  // Find intersection points (simplified - just sample points)
  const intersections = [];
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * 2 * Math.PI;
    const r = amplitude * (0.5 + 0.3 * Math.sin(level * 0.1 + angle));
    intersections.push({
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    });
  }

  return {
    main: mainPath.join(' '),
    secondary: secondaryPath.join(' '),
    tertiary: tertiaryPath.join(' '),
    intersections,
  };
}

/**
 * Generate SVG arc path
 */
function generateArcPath(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ');
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svgContainer: {
    position: 'absolute',
  },
  levelContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  progressRing: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
