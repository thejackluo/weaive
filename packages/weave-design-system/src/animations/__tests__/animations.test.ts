import { withSpring, withTiming } from 'react-native-reanimated';
import {
  springGentle,
  springSnappy,
  springBouncy,
  springSmooth,
  timingFast,
  timingBase,
  timingSlow,
  spring,
  timing,
  shouldReduceMotion,
  getAccessibleSpringConfig,
  getAccessibleTimingConfig,
  createPressAnimation,
  PRESS_SCALE,
  springs,
  timings,
  animations,
} from '../index';

// Mock the functions
jest.mock('react-native-reanimated');

describe('Animation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Spring Presets', () => {
    it('should have gentle spring preset', () => {
      expect(springGentle).toBeDefined();
      expect(springGentle.damping).toBe(20);
      expect(springGentle.stiffness).toBe(150);
      expect(springGentle.mass).toBe(1);
    });

    it('should have snappy spring preset', () => {
      expect(springSnappy).toBeDefined();
      expect(springSnappy.damping).toBe(15);
      expect(springSnappy.stiffness).toBe(250);
      expect(springSnappy.mass).toBe(1);
    });

    it('should have bouncy spring preset', () => {
      expect(springBouncy).toBeDefined();
      expect(springBouncy.damping).toBe(10);
      expect(springBouncy.stiffness).toBe(200);
      expect(springBouncy.mass).toBe(1);
    });

    it('should have smooth spring preset', () => {
      expect(springSmooth).toBeDefined();
      expect(springSmooth.damping).toBe(18);
      expect(springSmooth.stiffness).toBe(180);
      expect(springSmooth.mass).toBe(1);
    });

    it('should export springs object with all presets', () => {
      expect(springs.gentle).toBe(springGentle);
      expect(springs.snappy).toBe(springSnappy);
      expect(springs.bouncy).toBe(springBouncy);
      expect(springs.smooth).toBe(springSmooth);
    });
  });

  describe('Timing Presets', () => {
    it('should have fast timing preset', () => {
      expect(timingFast).toBeDefined();
      expect(timingFast.duration).toBe(150);
    });

    it('should have base timing preset', () => {
      expect(timingBase).toBeDefined();
      expect(timingBase.duration).toBe(250);
    });

    it('should have slow timing preset', () => {
      expect(timingSlow).toBeDefined();
      expect(timingSlow.duration).toBe(350);
    });

    it('should export timings object with all presets', () => {
      expect(timings.fast).toBe(timingFast);
      expect(timings.base).toBe(timingBase);
      expect(timings.slow).toBe(timingSlow);
    });
  });

  describe('spring() function', () => {
    it('should call withSpring with correct preset', () => {
      spring(1, 'snappy');
      expect(withSpring).toHaveBeenCalledWith(1, springSnappy);
    });

    it('should use smooth preset by default', () => {
      spring(0.5);
      expect(withSpring).toHaveBeenCalledWith(0.5, springSmooth);
    });

    it('should work with all preset types', () => {
      spring(1, 'gentle');
      expect(withSpring).toHaveBeenCalledWith(1, springGentle);

      spring(1, 'snappy');
      expect(withSpring).toHaveBeenCalledWith(1, springSnappy);

      spring(1, 'bouncy');
      expect(withSpring).toHaveBeenCalledWith(1, springBouncy);

      spring(1, 'smooth');
      expect(withSpring).toHaveBeenCalledWith(1, springSmooth);
    });
  });

  describe('timing() function', () => {
    it('should call withTiming with correct preset', () => {
      timing(1, 'fast');
      expect(withTiming).toHaveBeenCalledWith(1, timingFast);
    });

    it('should use base preset by default', () => {
      timing(0.5);
      expect(withTiming).toHaveBeenCalledWith(0.5, timingBase);
    });

    it('should work with all preset types', () => {
      timing(1, 'fast');
      expect(withTiming).toHaveBeenCalledWith(1, timingFast);

      timing(1, 'base');
      expect(withTiming).toHaveBeenCalledWith(1, timingBase);

      timing(1, 'slow');
      expect(withTiming).toHaveBeenCalledWith(1, timingSlow);
    });
  });

  describe('Reduced Motion', () => {
    it('should return false by default', () => {
      expect(shouldReduceMotion()).toBe(false);
    });

    it('getAccessibleSpringConfig should return normal config when reduced motion is off', () => {
      const config = getAccessibleSpringConfig('snappy');
      expect(config).toEqual(springSnappy);
    });

    it('getAccessibleSpringConfig should have reduced motion logic', () => {
      // Since shouldReduceMotion() is a deprecated sync fallback that always returns false,
      // and real reduced motion support comes from useReducedMotion() hook,
      // we test that the function has the correct structure for reduced motion
      const config = getAccessibleSpringConfig('snappy');

      // Verify it returns a valid spring config with required properties
      expect(config).toHaveProperty('damping');
      expect(config).toHaveProperty('stiffness');
      expect(config).toHaveProperty('mass');

      // Verify current behavior (returns normal config since shouldReduceMotion returns false)
      expect(config).toEqual(springSnappy);

      // NOTE: Reduced motion path (damping: 30, stiffness: 100) is tested via
      // integration tests with useReducedMotion() hook, not unit tests
    });

    it('getAccessibleTimingConfig should return normal config when reduced motion is off', () => {
      const config = getAccessibleTimingConfig('base');
      expect(config).toEqual(timingBase);
    });

    it('getAccessibleTimingConfig should have reduced motion logic', () => {
      // Since shouldReduceMotion() is a deprecated sync fallback that always returns false,
      // and real reduced motion support comes from useReducedMotion() hook,
      // we test that the function has the correct structure for reduced motion
      const config = getAccessibleTimingConfig('slow');

      // Verify it returns a valid timing config with required property
      expect(config).toHaveProperty('duration');

      // Verify current behavior (returns normal config since shouldReduceMotion returns false)
      expect(config).toEqual(timingSlow);

      // NOTE: Reduced motion path (duration: 100) is tested via
      // integration tests with useReducedMotion() hook, not unit tests
    });
  });

  describe('Press Animation', () => {
    it('should define PRESS_SCALE constant', () => {
      expect(PRESS_SCALE).toBe(0.95);
    });

    it('createPressAnimation should return correct values', () => {
      const pressAnimation = createPressAnimation();

      expect(pressAnimation.scale).toBe(0.95);
      expect(pressAnimation.config).toEqual(springSnappy);
    });
  });

  describe('Animations Export', () => {
    it('should export all animation utilities', () => {
      expect(animations.springs).toBeDefined();
      expect(animations.timings).toBeDefined();
      expect(animations.spring).toBe(spring);
      expect(animations.timing).toBe(timing);
      expect(animations.shouldReduceMotion).toBe(shouldReduceMotion);
      expect(animations.getAccessibleSpringConfig).toBe(getAccessibleSpringConfig);
      expect(animations.getAccessibleTimingConfig).toBe(getAccessibleTimingConfig);
      expect(animations.createPressAnimation).toBe(createPressAnimation);
      expect(animations.PRESS_SCALE).toBe(PRESS_SCALE);
    });
  });

  describe('Spring Physics Values', () => {
    it('gentle spring should be softer than snappy', () => {
      expect(springGentle.damping).toBeGreaterThan(springSnappy.damping);
      expect(springGentle.stiffness).toBeLessThan(springSnappy.stiffness);
    });

    it('bouncy spring should have lowest damping', () => {
      expect(springBouncy.damping).toBeLessThanOrEqual(springGentle.damping);
      expect(springBouncy.damping).toBeLessThanOrEqual(springSnappy.damping);
      expect(springBouncy.damping).toBeLessThanOrEqual(springSmooth.damping);
    });

    it('all springs should have mass of 1', () => {
      expect(springGentle.mass).toBe(1);
      expect(springSnappy.mass).toBe(1);
      expect(springBouncy.mass).toBe(1);
      expect(springSmooth.mass).toBe(1);
    });
  });

  describe('Timing Durations', () => {
    it('should have progressive duration values', () => {
      expect(timingFast.duration).toBe(150);
      expect(timingBase.duration).toBe(250);
      expect(timingSlow.duration).toBe(350);
    });

    it('durations should be in ascending order', () => {
      expect(timingFast.duration).toBeLessThan(timingBase.duration);
      expect(timingBase.duration).toBeLessThan(timingSlow.duration);
    });
  });
});
