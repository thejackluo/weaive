# Data Requirements

## Data Classification

**Canonical Truth (Immutable Event Logs):**
- `goals` - User goals
- `qgoals` - Quantifiable subgoals
- `subtask_templates` - Bind definitions
- `subtask_completions` - Completion events (immutable)
- `captures` - Proof and memories
- `journal_entries` - Daily reflections

**Derived Views (Recomputable):**
- `daily_aggregates` - Daily statistics
- `user_stats` - User-level statistics
- `streak calculations` - Computed from completions
- `consistency percentages` - Computed from aggregates

**Key Rule:** Never edit derived data directly. Always regenerate from source events.

## Critical Database Indexes

```sql
user_profiles(auth_user_id)
subtask_instances(user_id, scheduled_for_date)
subtask_completions(user_id, local_date)
captures(user_id, local_date)
journal_entries(user_id, local_date)
goals(user_id, status)
daily_aggregates(user_id, local_date)
ai_runs(input_hash)
```

## Data Retention

| Data Type | Retention | Policy |
|-----------|-----------|--------|
| User profile | Until account deletion | GDPR compliant |
| Goals and completions | Indefinite | Core user data |
| Journal entries | Indefinite | Core user data |
| Captures (images) | 2 years | Storage optimization |
| AI artifacts | 90 days | Cost optimization |
| Analytics events | 2 years | Analytics retention |

## Data Export

- Users can export all their data as JSON
- Export includes: profile, goals, completions, journals, captures (metadata)
- Export excludes: AI artifacts, derived stats (can be recomputed)

---
