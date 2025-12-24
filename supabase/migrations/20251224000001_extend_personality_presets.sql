-- Story 6.2 Extension: Add 23 Extended Personality Presets
--
-- Updates the weave_ai_preset CHECK constraint to include all 26 personalities
-- (3 core + 23 extended from .claude/personalities folder)
--
-- This migration extends the personality system with diverse coaching styles:
-- - Core: gen_z_default, supportive_coach, concise_mentor
-- - Supportive: abg, anime-girl, chinese-infj, flirty, funny
-- - Professional: normal, professional, robot
-- - Humorous: grandpa, pirate, rapper, sarcastic, sassy, surfer-dude
-- - Edgy: angry, annoying, crass, moody
-- - Creative: dramatic, poetic
-- - Themed: dry-humor, millennial, zen

-- ============================================================================
-- UPDATE CHECK CONSTRAINT
-- ============================================================================

-- Step 1: Drop the existing CHECK constraint
ALTER TABLE user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_weave_ai_preset_check;

-- Step 2: Add new CHECK constraint with all 26 personalities
ALTER TABLE user_profiles
  ADD CONSTRAINT user_profiles_weave_ai_preset_check
  CHECK (weave_ai_preset IN (
    -- Core presets (Story 6.1)
    'gen_z_default',
    'supportive_coach',
    'concise_mentor',
    -- Extended presets - Supportive & Friendly
    'abg',
    'anime-girl',
    'chinese-infj',
    'flirty',
    'funny',
    -- Extended presets - Professional
    'normal',
    'professional',
    'robot',
    -- Extended presets - Humorous
    'grandpa',
    'pirate',
    'rapper',
    'sarcastic',
    'sassy',
    'surfer-dude',
    -- Extended presets - Edgy & Bold
    'angry',
    'annoying',
    'crass',
    'moody',
    -- Extended presets - Creative & Artistic
    'dramatic',
    'poetic',
    -- Extended presets - Themed
    'dry-humor',
    'millennial',
    'zen'
  ));

-- Update comment to reflect extended personality system
COMMENT ON COLUMN user_profiles.weave_ai_preset IS 'Weave AI personality preset - 26 available styles: 3 core (gen_z_default, supportive_coach, concise_mentor) + 23 extended personalities organized by category (supportive, professional, humorous, edgy, creative, themed)';


-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    constraint_def TEXT;
BEGIN
    -- Verify new constraint exists and includes extended personalities
    SELECT pg_get_constraintdef(oid) INTO constraint_def
    FROM pg_constraint
    WHERE conname = 'user_profiles_weave_ai_preset_check'
      AND conrelid = 'user_profiles'::regclass;

    IF constraint_def IS NOT NULL THEN
        RAISE NOTICE '[OK] CHECK constraint updated with extended personalities';

        -- Verify key personalities are included
        IF constraint_def LIKE '%anime-girl%'
           AND constraint_def LIKE '%zen%'
           AND constraint_def LIKE '%professional%' THEN
            RAISE NOTICE '[OK] Sample personalities verified: anime-girl, zen, professional';
        ELSE
            RAISE WARNING '[WARN] Constraint may be missing some extended personalities';
        END IF;
    ELSE
        RAISE WARNING '[ERROR] CHECK constraint not found!';
    END IF;
END $$;
