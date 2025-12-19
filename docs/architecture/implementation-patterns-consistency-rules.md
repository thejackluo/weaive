# Implementation Patterns & Consistency Rules

These patterns ensure AI agents and developers write compatible, consistent code.

## Naming Patterns

### Database (Supabase PostgreSQL)
```sql
-- Tables: snake_case, plural
user_profiles, subtask_completions, journal_entries

-- Columns: snake_case
user_id, created_at, local_date, scheduled_for_date

-- Foreign keys: {table}_id
user_id, goal_id, subtask_instance_id

-- Indexes: idx_{table}_{columns}
idx_subtask_completions_user_date
```

### API Endpoints (FastAPI)
```python
# REST: plural nouns, snake_case params
GET  /api/goals
POST /api/goals
GET  /api/goals/{goal_id}
POST /api/journal-entries
GET  /api/daily-aggregates/{local_date}

# Query params: snake_case
?user_id=xxx&local_date=2025-12-16
```

### TypeScript (React Native)
```typescript
// Files: PascalCase for components
GoalCard.tsx, DailyTriad.tsx, JournalEntry.tsx

// Files: camelCase for utilities/hooks
useGoals.ts, apiClient.ts, dateUtils.ts

// Components: PascalCase
function GoalCard() {}

// Variables/functions: camelCase
const userId = "..."
function fetchGoals() {}
```

### Python (FastAPI)
```python
# Files: snake_case
goal_router.py, journal_service.py, ai_models.py

# Functions/variables: snake_case
def get_user_goals():
    user_id = "..."

# Classes: PascalCase
class GoalCreate(BaseModel):
```

## Structure Patterns

### Test Locations
- **Mobile**: Co-located `*.test.tsx` files (Jest + React Native Testing Library)
- **Backend**: `api/tests/` directory (pytest convention)

### Component Organization
- `components/ui/` - Generic reusable UI (Button, Card, Input)
- `components/features/{domain}/` - Feature-specific components

## Format Patterns

### API Response Format
```typescript
// Success response
{ "data": { ... }, "meta": { "timestamp": "2025-12-16T10:00:00Z" } }

// Error response
{ "error": { "code": "GOAL_LIMIT_REACHED", "message": "Maximum 3 active goals allowed" } }

// List response
{ "data": [...], "meta": { "total": 42, "page": 1, "per_page": 20 } }
```

### Date Formats
```typescript
// API/Database: ISO 8601
"2025-12-16T10:30:00Z"  // timestamps with timezone
"2025-12-16"            // local_date (no time)
```

### JSON Field Naming
- **API ↔ Database**: `snake_case` (matches PostgreSQL)
- **TypeScript internal**: `camelCase` (transform at API boundary)

## Communication Patterns

### Event Naming
```typescript
// Pattern: domain.action (snake_case)
"journal.submitted"
"subtask.completed"
"capture.created"
"goal.activated"
```

### State Management Boundaries
```typescript
// TanStack Query: All server data
const { data: goals } = useQuery({ queryKey: ['goals'], ... })

// Zustand: Only shared UI state
const useUIStore = create<UIState>((set) => ({
  activeFilter: 'all',
  isJournalModalOpen: false,
}))

// useState: Component-local only
const [inputValue, setInputValue] = useState('')
```

## Process Patterns

### Error Handling
```typescript
// Error boundaries for crashes
<ErrorBoundary fallback={<CrashScreen />}><App /></ErrorBoundary>

// TanStack Query error states
const { error, isError } = useQuery(...)
if (isError) return <ErrorMessage error={error} />

// FastAPI: HTTPException with consistent format
raise HTTPException(status_code=400, detail={"code": "VALIDATION_ERROR", "message": "..."})
```

### Loading States
```typescript
// TanStack Query provides loading states
const { isLoading, isFetching } = useQuery(...)
if (isLoading) return <GoalCardSkeleton />  // Initial load
// isFetching shows subtle indicator without blocking
```

## Enforcement Guidelines

**All AI Agents MUST:**
1. Use `snake_case` for all database columns and API parameters
2. Use `PascalCase` for React components and their files
3. Use the `{data, error, meta}` response wrapper format
4. Place tests co-located for mobile, in `tests/` for backend
5. Never UPDATE/DELETE from `subtask_completions`
6. Transform `snake_case` ↔ `camelCase` at API boundary only

**Verification:**
- TypeScript strict mode catches naming inconsistencies
- ESLint rules enforce file naming
- Database constraints prevent invalid operations

---
