/**
 * RateLimitIndicator Component Tests - Story 6.1
 * RED Phase: Tests written BEFORE implementation
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import RateLimitIndicator from '../RateLimitIndicator';

describe('RateLimitIndicator Component', () => {
  /**
   * GIVEN: User has used some messages
   * WHEN: Component renders
   * THEN: Usage indicator displays correct counts
   */
  it('displays premium messages usage', () => {
    // GIVEN: User has used 5 premium messages
    const usage = {
      premium_today: { used: 5, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 25, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Premium usage displayed
    expect(getByText(/5\/10.*premium/i)).toBeTruthy();
  });

  it('displays free messages usage', () => {
    // GIVEN: User has used 20 free messages
    const usage = {
      premium_today: { used: 5, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 25, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Free usage displayed
    expect(getByText(/20\/40.*free/i)).toBeTruthy();
  });

  it('displays monthly usage', () => {
    // GIVEN: User has used 25 messages this month
    const usage = {
      premium_today: { used: 5, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 25, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Monthly usage displayed
    expect(getByText(/25\/500.*this month/i)).toBeTruthy();
  });

  /**
   * GIVEN: User has reached premium daily limit
   * WHEN: Component renders
   * THEN: Premium limit message shown
   */
  it('shows premium limit message when reached', () => {
    // GIVEN: User has used all 10 premium messages
    const usage = {
      premium_today: { used: 10, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 30, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Premium limit message displayed
    expect(getByText(/you've used all 10 premium messages today/i)).toBeTruthy();
  });

  /**
   * GIVEN: User has reached free daily limit
   * WHEN: Component renders
   * THEN: Free limit message shown
   */
  it('shows free limit message when reached', () => {
    // GIVEN: User has used all 40 free messages
    const usage = {
      premium_today: { used: 5, limit: 10 },
      free_today: { used: 40, limit: 40 },
      monthly: { used: 45, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Free limit message displayed
    expect(getByText(/you've used all 40 free messages today/i)).toBeTruthy();
  });

  /**
   * GIVEN: User has reached monthly limit
   * WHEN: Component renders
   * THEN: Monthly limit message shown with reset date
   */
  it('shows monthly limit message when reached', () => {
    // GIVEN: User has used all 500 messages this month
    const usage = {
      premium_today: { used: 10, limit: 10 },
      free_today: { used: 40, limit: 40 },
      monthly: { used: 500, limit: 500 },
      tier: 'free' as const,
    };

    const { getByText } = render(<RateLimitIndicator usage={usage} resetDate="2025-01-01" />);

    // THEN: Monthly limit message displayed with reset date
    expect(getByText(/you've used 500 messages this month.*resets on 2025-01-01/i)).toBeTruthy();
  });

  /**
   * GIVEN: User is rate limited
   * WHEN: Component renders
   * THEN: Countdown timer to midnight reset shown
   */
  it('shows countdown timer when daily limit reached', () => {
    // GIVEN: User is rate limited
    const usage = {
      premium_today: { used: 10, limit: 10 },
      free_today: { used: 40, limit: 40 },
      monthly: { used: 50, limit: 500 },
      tier: 'free' as const,
    };

    const { getByTestId, getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Countdown timer displayed
    expect(getByTestId('reset-countdown-timer')).toBeTruthy();
    expect(getByText(/resets in/i)).toBeTruthy();
  });

  /**
   * GIVEN: User is pro tier
   * WHEN: Component renders
   * THEN: Pro tier usage limits shown
   */
  it('displays pro tier limits correctly', () => {
    // GIVEN: Pro tier user
    const usage = {
      premium_today: { used: 50, limit: 200 },
      free_today: { used: 100, limit: 800 },
      monthly: { used: 150, limit: 5000 },
      tier: 'pro' as const,
    };

    const { getByText } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Pro limits displayed
    expect(getByText(/50\/200.*premium/i)).toBeTruthy();
    expect(getByText(/100\/800.*free/i)).toBeTruthy();
    expect(getByText(/150\/5000.*this month/i)).toBeTruthy();
  });

  /**
   * GIVEN: Usage approaching limit (90%)
   * WHEN: Component renders
   * THEN: Warning indicator shown
   */
  it('shows warning when approaching limit', () => {
    // GIVEN: User at 9/10 premium messages
    const usage = {
      premium_today: { used: 9, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 29, limit: 500 },
      tier: 'free' as const,
    };

    const { getByTestId } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Warning indicator displayed
    const indicator = getByTestId('rate-limit-indicator');
    expect(indicator.props.style).toContain('warning'); // Warning color
  });

  /**
   * GIVEN: Rate limit indicator
   * WHEN: Rendered with glassmorphism design
   * THEN: Translucent background with blur applied
   */
  it('applies glassmorphism styling', () => {
    // GIVEN: Rate limit indicator
    const usage = {
      premium_today: { used: 5, limit: 10 },
      free_today: { used: 20, limit: 40 },
      monthly: { used: 25, limit: 500 },
      tier: 'free' as const,
    };

    const { getByTestId } = render(
      <RateLimitIndicator
        premiumUsed={usage.premium_today.used}
        premiumLimit={usage.premium_today.limit}
        freeUsed={usage.free_today.used}
        freeLimit={usage.free_today.limit}
        monthlyUsed={usage.monthly.used}
        monthlyLimit={usage.monthly.limit}
        isRateLimited={false}
      />
    );

    // THEN: Glassmorphism styling applied
    const container = getByTestId('rate-limit-indicator');
    expect(container.props.style).toContain('backdrop-filter: blur');
    expect(container.props.style).toContain('opacity');
  });
});
