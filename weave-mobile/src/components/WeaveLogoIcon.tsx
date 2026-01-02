import React from 'react';
import { Image, ImageStyle } from 'react-native';

interface WeaveLogoIconProps {
  size?: number;
  color?: string;
}

/**
 * WeaveLogoIcon - The official Weave app logo
 *
 * A minimalist interlocking pattern representing the weaving concept.
 * Used consistently throughout the app to represent level progress and branding.
 */
export function WeaveLogoIcon({ size = 32, color = '#FFFFFF' }: WeaveLogoIconProps) {
  // For white color, display the image as-is
  // For other colors (like accent blue), don't use tint since the PNG has the pattern embedded
  const style: ImageStyle = {
    width: size,
    height: size,
  };

  return (
    <Image
      source={require('../../assets/images/weave-logo.png')}
      style={style}
      resizeMode="contain"
    />
  );
}
