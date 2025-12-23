# Inline Bind Editing Implementation - 2025-12-23

**User Request:** Instead of navigating to a separate bind detail screen, edit binds inline on the needle detail page (name + frequency)

**Status:** ✅ **COMPLETE** - Ready for testing

---

## Changes Made

### Backend: New Endpoint

**File:** `weave-api/app/api/binds/router.py`

**Added:**
1. **UpdateBindRequest model** (lines 32-37):
```python
class UpdateBindRequest(BaseModel):
    """Request body for updating a bind template"""
    title: str | None = Field(None, min_length=1, max_length=200)
    recurrence_rule: str | None = Field(None, description="iCal RRULE format")
    default_estimated_minutes: int | None = Field(None, ge=0)
```

2. **PUT /api/binds/{bind_id} endpoint** (lines 487-597):
- Updates subtask_template (not instances)
- RLS enforced (user can only update own binds)
- Validates ownership before update
- Returns updated bind data

---

### Frontend: Inline Editing UI

**File:** `weave-mobile/src/hooks/useUpdateBind.ts` (NEW)

**Created:** TanStack Query mutation hook for updating binds
- Calls PUT /api/binds/{id}
- Invalidates goal queries on success
- Follows standard pattern from other hooks

---

**File:** `weave-mobile/src/screens/NeedleDetailScreen.tsx`

**Changes:**

1. **Added state for editing** (lines 46-49):
```typescript
const [editingBindId, setEditingBindId] = useState<string | null>(null);
const [editingBindTitle, setEditingBindTitle] = useState('');
const [editingBindFrequency, setEditingBindFrequency] = useState('daily');
```

2. **Added mutation hook** (line 62):
```typescript
const updateBindMutation = useUpdateBind();
```

3. **Helper functions** (lines 149-205):
- `parseFrequency(recurrenceRule)` - Convert RRULE → 'daily' | 'weekly'
- `toRecurrenceRule(frequency)` - Convert 'daily' | 'weekly' → RRULE
- `handleBindPress(bind)` - Start editing (replaces navigation)
- `handleSaveBind()` - Save changes via API
- `handleCancelBindEdit()` - Cancel and reset

4. **Updated bind card rendering** (lines 488-615):
- **View mode:** Shows bind name, frequency, pencil icon
- **Edit mode:** Shows:
  - Name input field
  - Frequency toggle buttons (Daily/Weekly)
  - Cancel/Save buttons
- Toggles between modes when bind is tapped

5. **Added styles** (lines 863-901):
- `bindEditContainer` - Edit mode container
- `bindEditField` - Field wrapper
- `bindEditInput` - Text input styling
- `frequencyButtons` - Button row
- `frequencyButton` - Individual button
- `bindEditActions` - Cancel/Save row

---

## How It Works

### User Flow:

1. **View Mode:**
   - User sees bind card with name and frequency (e.g., "Morning run - Daily")
   - Pencil icon on right side indicates editability

2. **Tap to Edit:**
   - Tapping bind card enters edit mode
   - Card expands to show:
     - Name input field (pre-filled with current name)
     - Frequency buttons (Daily/Weekly - current one selected)
     - Cancel and Save buttons

3. **Edit:**
   - User can change name in text field
   - User can tap Daily or Weekly button to change frequency
   - Changes are local (not saved yet)

4. **Save:**
   - Tapping "Save" calls PUT /api/binds/{id}
   - Shows "Saving..." while request in progress
   - On success: Exits edit mode, invalidates queries to refetch
   - On error: Shows alert with error message

5. **Cancel:**
   - Tapping "Cancel" exits edit mode without saving
   - Discards any changes made

---

## Data Flow

```
Bind Card (View Mode)
  ↓ (tap)
Edit Mode (local state)
  ↓ (save)
PUT /api/binds/{id}
  ↓
Update subtask_templates table
  ↓
Return updated bind
  ↓
Invalidate goalsQueryKeys.active()
  ↓
Refetch goal with updated binds
  ↓
UI updates automatically
```

---

## Frequency Mapping

### Database ↔ UI:

| Database (recurrence_rule) | UI (frequency) |
|----------------------------|----------------|
| `FREQ=DAILY;INTERVAL=1` | Daily |
| `FREQ=WEEKLY;INTERVAL=1` | Weekly |
| `null` or other | Daily (default) |

**Note:** Only Daily and Weekly are supported in the UI for now. More complex recurrence patterns can be added later.

---

## Technical Decisions

### Why Inline Editing?

✅ **Better UX:**
- No navigation = faster editing
- All needle info visible while editing
- Less cognitive load

✅ **Simpler Implementation:**
- No new screen to build
- No route configuration needed
- Follows same pattern as title/motivation editing

### Why Edit Template (Not Instances)?

**Decision:** PUT updates `subtask_templates`, NOT `subtask_instances`

**Reasoning:**
- Template = the reusable definition ("Run 30 min" daily)
- Instance = specific date occurrence ("Run 30 min" on 2025-12-23)
- Editing template affects future instances
- Past instances remain unchanged (historical accuracy)

**User Impact:**
- Changing "Run 30 min" to "Run 45 min" updates today AND future days
- Yesterday's completed "Run 30 min" stays as-is (it was 30 min when completed)

---

## Testing Steps

1. **Navigate to needle detail screen** (tap needle card from Dashboard)
2. **Tap a bind card** (should enter edit mode)
3. **Change bind name** (e.g., "Morning run" → "Morning jog")
4. **Change frequency** (Daily ↔ Weekly)
5. **Tap Save** (should save and exit edit mode)
6. **Verify:**
   - Bind name updated in view mode
   - Frequency updated ("Daily" or "Weekly")
   - Changes persist after refreshing screen

7. **Test Cancel:**
   - Enter edit mode again
   - Make changes
   - Tap Cancel
   - **Expected:** Changes discarded, returns to original values

---

## Schema Reference

### subtask_templates Table:

```sql
CREATE TABLE subtask_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  title TEXT NOT NULL,  -- ✅ Editable
  default_estimated_minutes INT NOT NULL,
  difficulty INT CHECK (difficulty >= 1 AND difficulty <= 15),
  recurrence_rule TEXT,  -- ✅ Editable (iCal RRULE format)
  is_archived BOOLEAN DEFAULT FALSE,
  created_by created_by_type DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Editable Fields:**
- `title` - Bind name
- `recurrence_rule` - Frequency (RRULE format)
- `default_estimated_minutes` - NOT exposed in UI yet (could be added later)

---

## Current Status

✅ Backend endpoint created (PUT /api/binds/{id})
✅ Frontend hook created (useUpdateBind)
✅ UI implemented (inline edit mode with name + frequency)
✅ Styles added
✅ Backend auto-reloaded with new endpoint
⏳ Ready for user testing

---

## Future Enhancements (Optional)

1. **Add estimated time editor** - Currently not exposed in UI
2. **More frequency options** - Monthly, every X days, weekdays only, etc.
3. **Delete bind** - Inline delete button in edit mode
4. **Reorder binds** - Drag-and-drop to change sort order
5. **Duplicate bind** - Quick way to create similar binds

---

## Notes

- This replaces the previous behavior of navigating to `/binds/${bindId}` screen
- The bind detail screen (`app/(tabs)/binds/[id].tsx`) can now be removed or repurposed
- All needle-related editing stays on the needle detail screen (cohesive UX)
