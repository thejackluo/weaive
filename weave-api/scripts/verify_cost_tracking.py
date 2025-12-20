#!/usr/bin/env python3
"""
Cost Tracking Verification Script

Verifies that AI service cost tracking is working correctly by:
1. Checking recent AI runs in database
2. Calculating total daily costs
3. Verifying per-user costs
4. Checking budget alerts

Run: uv run python scripts/verify_cost_tracking.py
"""

import os
import sys
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY')  # Use service key for admin access

# Budget constants
DAILY_BUDGET_USD = 83.33
FREE_USER_DAILY_BUDGET_USD = 0.02
PAID_USER_DAILY_BUDGET_USD = 0.10
ALERT_THRESHOLD = 0.80


def print_header(title):
    """Print formatted header."""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_section(title):
    """Print formatted section."""
    print("\n" + "-"*70)
    print(f"  {title}")
    print("-"*70)


def check_database_connection():
    """Verify database connection works."""
    print_header("🔌 Database Connection Check")

    if not SUPABASE_URL or not SUPABASE_KEY:
        print("\n❌ ERROR: Missing Supabase credentials")
        print("   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env")
        return None

    try:
        client = create_client(SUPABASE_URL, SUPABASE_KEY)

        # Test query
        _ = client.table('ai_runs').select('id').limit(1).execute()

        print("\n✅ Connected to Supabase")
        print(f"   URL: {SUPABASE_URL}")

        return client

    except Exception as e:
        print(f"\n❌ ERROR: Database connection failed: {e}")
        return None


def check_recent_ai_runs(client):
    """Check recent AI runs (last 5 minutes)."""
    print_header("📊 Recent AI Runs (Last 5 Minutes)")

    try:
        five_min_ago = (datetime.utcnow() - timedelta(minutes=5)).isoformat()

        result = client.table('ai_runs').select(
            'id, provider, model, input_tokens, output_tokens, cost_estimate, status, created_at'
        ).gte('created_at', five_min_ago).order('created_at', desc=True).execute()

        runs = result.data

        if not runs:
            print("\n⚠️  No AI runs found in last 5 minutes")
            print("   Run the test script first: uv run python scripts/test_ai_service.py")
            return False

        print(f"\n✅ Found {len(runs)} AI run(s) in last 5 minutes:\n")

        total_cost = Decimal('0')

        for run in runs:
            provider = run['provider']
            model = run['model']
            input_tokens = run['input_tokens'] or 0
            output_tokens = run['output_tokens'] or 0
            cost = Decimal(str(run['cost_estimate'] or 0))
            status = run['status']
            created_at = run['created_at']

            total_cost += cost

            status_emoji = "✅" if status == 'success' else "❌"

            print(f"{status_emoji} {provider:12} | {model:25} | {input_tokens:4} in + {output_tokens:4} out | ${cost:.6f} | {created_at[:19]}")

        print(f"\n💵 Total cost (last 5 min): ${total_cost:.6f}")

        return True

    except Exception as e:
        print(f"\n❌ ERROR: Failed to query recent runs: {e}")
        return False


def check_daily_cost(client):
    """Check total daily cost (today)."""
    print_header("💰 Total Daily Cost (Today)")

    try:
        # Get all runs for today
        today = datetime.utcnow().date().isoformat()

        result = client.rpc('get_daily_cost_by_provider', {
            'target_date': today
        }).execute()

        # If RPC doesn't exist, fall back to direct query
        if not result.data:
            result = client.table('ai_runs').select(
                'provider, model, cost_estimate'
            ).gte('created_at', f'{today}T00:00:00').execute()

            # Manual aggregation
            provider_costs = {}
            total_cost = Decimal('0')
            total_calls = 0

            for run in result.data:
                provider = run['provider']
                cost = Decimal(str(run['cost_estimate'] or 0))

                if provider not in provider_costs:
                    provider_costs[provider] = {'cost': Decimal('0'), 'count': 0}

                provider_costs[provider]['cost'] += cost
                provider_costs[provider]['count'] += 1
                total_cost += cost
                total_calls += 1

            print(f"\n📅 Date: {today}")
            print(f"📞 Total calls: {total_calls}")
            print(f"💵 Total cost: ${total_cost:.6f}\n")

            if provider_costs:
                print("Provider breakdown:")
                for provider, data in sorted(provider_costs.items()):
                    print(f"  {provider:12} | {data['count']:3} calls | ${data['cost']:.6f}")

            # Budget check
            budget_pct = float(total_cost / Decimal(str(DAILY_BUDGET_USD)) * 100)

            if total_cost >= Decimal(str(DAILY_BUDGET_USD)):
                print(f"\n🚨 BUDGET EXCEEDED: ${total_cost:.2f} / ${DAILY_BUDGET_USD:.2f} ({budget_pct:.1f}%)")
            elif total_cost >= Decimal(str(DAILY_BUDGET_USD * ALERT_THRESHOLD)):
                print(f"\n⚠️  BUDGET ALERT (80%): ${total_cost:.2f} / ${DAILY_BUDGET_USD:.2f} ({budget_pct:.1f}%)")
            else:
                print(f"\n✅ Budget healthy: ${total_cost:.2f} / ${DAILY_BUDGET_USD:.2f} ({budget_pct:.1f}%)")

        return True

    except Exception as e:
        print(f"\n❌ ERROR: Failed to check daily cost: {e}")
        return False


def check_user_costs(client):
    """Check per-user daily costs."""
    print_header("👤 Per-User Daily Costs (Today)")

    try:
        today = datetime.utcnow().date().isoformat()

        result = client.table('ai_runs').select(
            'user_id, cost_estimate'
        ).gte('created_at', f'{today}T00:00:00').execute()

        # Aggregate by user
        user_costs = {}

        for run in result.data:
            user_id = run['user_id']
            cost = Decimal(str(run['cost_estimate'] or 0))

            if user_id not in user_costs:
                user_costs[user_id] = {'cost': Decimal('0'), 'count': 0}

            user_costs[user_id]['cost'] += cost
            user_costs[user_id]['count'] += 1

        if not user_costs:
            print("\n⚠️  No user costs found for today")
            return True

        print(f"\n📅 Date: {today}")
        print(f"👥 Total users: {len(user_costs)}\n")

        # Sort by cost descending
        sorted_users = sorted(user_costs.items(), key=lambda x: x[1]['cost'], reverse=True)

        for user_id, data in sorted_users[:10]:  # Show top 10
            cost = data['cost']
            count = data['count']

            # Check against free/paid budgets (assume free for now)
            free_pct = float(cost / Decimal(str(FREE_USER_DAILY_BUDGET_USD)) * 100)
            paid_pct = float(cost / Decimal(str(PAID_USER_DAILY_BUDGET_USD)) * 100)

            status = "✅"
            budget_info = f"{free_pct:.1f}% of free budget"

            if cost >= Decimal(str(PAID_USER_DAILY_BUDGET_USD)):
                status = "🚨"
                budget_info = f"EXCEEDS paid budget ({paid_pct:.1f}%)"
            elif cost >= Decimal(str(FREE_USER_DAILY_BUDGET_USD)):
                status = "⚠️ "
                budget_info = f"EXCEEDS free budget ({free_pct:.1f}%)"

            print(f"{status} {user_id[:16]:<16} | {count:3} calls | ${cost:.6f} | {budget_info}")

        if len(user_costs) > 10:
            print(f"\n   ... and {len(user_costs) - 10} more users")

        return True

    except Exception as e:
        print(f"\n❌ ERROR: Failed to check user costs: {e}")
        return False


def check_cost_accuracy(client):
    """Verify cost calculation accuracy."""
    print_header("🧮 Cost Calculation Accuracy")

    try:
        # Get recent runs with known pricing
        result = client.table('ai_runs').select(
            'provider, model, input_tokens, output_tokens, cost_estimate'
        ).eq('status', 'success').not_.is_('input_tokens', 'null').limit(5).execute()

        runs = result.data

        if not runs:
            print("\n⚠️  No successful runs with token counts found")
            return True

        print("\n✅ Verifying cost calculations for recent runs:\n")

        # Known pricing (as of 2025-12-19)
        pricing = {
            'openai': {
                'gpt-4o-mini': {'input': 0.15 / 1_000_000, 'output': 0.60 / 1_000_000},
                'gpt-4o': {'input': 2.50 / 1_000_000, 'output': 10.00 / 1_000_000},
            },
            'anthropic': {
                'claude-3-7-sonnet-20250219': {'input': 3.00 / 1_000_000, 'output': 15.00 / 1_000_000},
                'claude-4-5-haiku-20250514': {'input': 1.00 / 1_000_000, 'output': 5.00 / 1_000_000},
            },
            'bedrock': {
                'us.anthropic.claude-3-5-haiku-20241022-v1:0': {'input': 0.25 / 1_000_000, 'output': 1.25 / 1_000_000},
                'claude-3-5-haiku': {'input': 0.25 / 1_000_000, 'output': 1.25 / 1_000_000},
            },
        }

        all_accurate = True

        for run in runs:
            provider = run['provider']
            model = run['model']
            input_tokens = run['input_tokens']
            output_tokens = run['output_tokens']
            actual_cost = Decimal(str(run['cost_estimate']))

            # Calculate expected cost
            if provider in pricing and model in pricing[provider]:
                prices = pricing[provider][model]
                expected_cost = Decimal(str(
                    (input_tokens * prices['input']) + (output_tokens * prices['output'])
                ))

                diff = abs(actual_cost - expected_cost)

                # Allow 0.1% tolerance for rounding
                tolerance = expected_cost * Decimal('0.001')

                if diff <= tolerance or diff <= Decimal('0.000001'):
                    status = "✅"
                    accuracy = "ACCURATE"
                else:
                    status = "⚠️ "
                    accuracy = f"MISMATCH (diff: ${diff:.9f})"
                    all_accurate = False

                print(f"{status} {provider:10} | {model:25} | {input_tokens:4}+{output_tokens:4} tok | ${actual_cost:.6f} vs ${expected_cost:.6f} | {accuracy}")
            else:
                print(f"⚪ {provider:10} | {model:25} | {input_tokens:4}+{output_tokens:4} tok | ${actual_cost:.6f} | UNKNOWN PRICING")

        if all_accurate:
            print("\n✅ All cost calculations are accurate!")
        else:
            print("\n⚠️  Some cost calculations may have issues")

        return all_accurate

    except Exception as e:
        print(f"\n❌ ERROR: Failed to verify cost accuracy: {e}")
        return False


def main():
    """Run all cost tracking verification checks."""
    print("\n" + "🚀 "*20)
    print("AI COST TRACKING VERIFICATION")
    print("🚀 "*20)

    # Connect to database
    client = check_database_connection()

    if not client:
        print("\n❌ Cannot proceed without database connection")
        return

    # Run checks
    results = {
        'recent_runs': check_recent_ai_runs(client),
        'daily_cost': check_daily_cost(client),
        'user_costs': check_user_costs(client),
        'cost_accuracy': check_cost_accuracy(client),
    }

    # Summary
    print_header("📊 Verification Summary")

    passed = sum(results.values())
    total = len(results)

    for check, result in results.items():
        status = "✅" if result else "❌"
        print(f"\n{status} {check.replace('_', ' ').title()}: {'PASSED' if result else 'FAILED'}")

    print(f"\n{'='*70}")
    print(f"💵 Overall: {passed}/{total} checks passed")
    print(f"{'='*70}")

    if passed == total:
        print("\n✅ Cost tracking is working correctly!")
    else:
        print("\n⚠️  Some checks failed - review output above")

    print("\n📝 NEXT STEPS:")
    print("   1. Check Supabase dashboard for ai_runs table")
    print("   2. Run SQL queries in docs/testing/ai-service-real-api-testing.md")
    print("   3. Monitor daily costs to ensure budget compliance")
    print(f"\n{'='*70}\n")


if __name__ == '__main__':
    main()
