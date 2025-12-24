"""
Extensible Deterministic AI Templates

Template registry for deterministic fallback provider.
Easy to add new modules and message variants without touching provider code.

Usage:
    template = get_template('triad', 'default', task_1='Finish report', task_2='Gym', task_3='Read')
    # Returns: "Based on your progress, here's what matters most tomorrow:\n1. Finish report\n2. Gym\n3. Read..."

Adding new templates:
    1. Add module key to TEMPLATES dict
    2. Add variants (default, no_tasks, etc.)
    3. Use {variable_name} for substitution
"""

from typing import Any, Dict

# Template registry: {module: {variant: template_string}}
TEMPLATES: Dict[str, Dict[str, str]] = {
    "onboarding": {
        "default": """Let's break down your goal "{goal_title}" into actionable steps.

I'll help you create a structured plan with consistent habits that move you forward daily.

What specific milestones would indicate progress toward this goal?""",
        "followup": """Great! Let's refine those steps into daily actions you can track.

Based on "{goal_title}", here's what I recommend:
• Start with 1-2 small, consistent actions
• Build momentum before adding more
• Track your progress daily

What's the smallest first step you can take today?""",
        "breakdown": """Here's how we can structure "{goal_title}":

Phase 1: Foundation (Days 1-3)
• {step_1}

Phase 2: Building Momentum (Days 4-7)
• {step_2}

Phase 3: Consistency (Days 8-10)
• {step_3}

Does this approach resonate with you?""",
    },
    "triad": {
        "default": """Based on your progress, here's what matters most tomorrow:

1. {task_1}
2. {task_2}
3. {task_3}

Focus on these to maintain momentum toward your goals.

Remember: Consistency beats intensity. Show up tomorrow.""",
        "no_tasks": """Take a moment to review your goals and identify the next most important step.

Starting small is better than not starting at all.

What's one action you can take tomorrow to move forward?""",
        "single_goal": """Tomorrow's focus for "{goal_title}":

• {task_1}

Keep it simple. One clear action is better than scattered effort.""",
        "maintenance": """You're building great consistency! Tomorrow:

1. {task_1}
2. {task_2}
3. {task_3}

This is how lasting change happens—one day at a time.""",
    },
    "recap": {
        "default": """Today's summary:
✓ Completed {completed_count} tasks
✓ {proof_count} proof items captured

You're building consistent momentum. Keep showing up!""",
        "no_activity": """No tasks completed today.

Tomorrow is a fresh start—let's make it count!

Review your goals and pick one small action for tomorrow.""",
        "strong_day": """Impressive work today:
✓ {completed_count} tasks completed
✓ {proof_count} proof items captured
✓ {fulfillment_score}/10 fulfillment score

You're crushing it! This is the kind of day that builds real change.""",
        "streak_milestone": """🔥 {streak_days}-day streak maintained!

Today's progress:
✓ {completed_count} tasks completed

Consistency is your superpower. Keep going!""",
    },
    "dream_self": {
        "default": """That's a thoughtful question about {topic}.

Let's explore what matters most to you:
• What does success look like in this area?
• What's holding you back right now?
• What would change if you overcame that obstacle?

Take your time. The answers are already in you.""",
        "encouragement": """You're making progress—even if it doesn't always feel that way.

Remember why you started this journey:
• {original_motivation}

That reason hasn't changed. You haven't changed.

What's one thing you can do today that aligns with that vision?""",
        "reflection": """Let's pause and reflect on {topic}.

Look at where you were {timeframe} ago.
Look at where you are now.

Progress isn't always linear, but it's there.

What patterns do you notice in your journey?""",
        "challenge": """Here's a challenge to consider:

The gap between who you are and who you want to be isn't about capability—it's about consistency.

Your Dream Self isn't a distant future version. It's who you become through daily choices.

What choice can you make today that your Dream Self would be proud of?""",
    },
    "weekly_insights": {
        "default": """This week's patterns:
• {pattern_1}
• {pattern_2}
• {pattern_3}

Focus area for next week: {focus_area}

Remember: Insights without action are just observations. What will you change?""",
        "breakthrough": """Major breakthrough this week:

{breakthrough_description}

This is what consistency creates. You're not the same person you were 7 days ago.

Next week, let's build on this momentum with: {next_action}""",
        "plateau": """This week showed some plateaus in {area}.

That's normal—growth isn't linear.

Plateaus often precede breakthroughs. Keep showing up.

Next week's focus: {adjustment_suggestion}""",
        "celebration": """Week {week_number} complete! 🎉

Wins:
• {win_1}
• {win_2}
• {win_3}

You're building something real here. Week by week, day by day.

Next week: {next_milestone}""",
    },
    "factual_question": {
        "default": """I don't have access to real-time information or specific factual knowledge.

For factual questions like this, I recommend:
• Checking a reliable source (Wikipedia, official docs, etc.)
• Using a search engine for up-to-date information
• Consulting subject matter experts

However, I'm here to help you think through goals, habits, and personal development questions.

What can I help you work toward today?""",
        "math": """I can't perform complex calculations reliably.

For math problems, please use:
• A calculator or spreadsheet
• WolframAlpha for complex computations
• Math-specific tools

I'm better suited for helping you:
• Break down goals into steps
• Build consistent habits
• Track your progress

What goal-related question can I help with?""",
        "technical": """For technical questions like this, I recommend checking the official documentation or community resources.

I'm optimized for personal development coaching, not technical troubleshooting.

Can I help you with:
• Setting and tracking goals?
• Building consistent habits?
• Planning your daily actions?""",
    },
    # Fallback for unknown modules
    "generic": {
        "default": """I'm here to help with {module}.

Let's work through this together.

What specific guidance would be most useful right now?""",
        "error_recovery": """Something went wrong, but I'm still here to help.

Let's refocus on what matters:
• Your goals are still valid
• Your progress is still real
• This setback is temporary

What's one thing you can do right now to move forward?""",
    },
}


def get_template(module: str, variant: str = "default", **kwargs: Any) -> str:
    """
    Get a template by module and variant, with variable substitution.

    Args:
        module: AI module name ('onboarding', 'triad', 'recap', 'dream_self', 'weekly_insights')
        variant: Template variant ('default', 'no_tasks', 'followup', etc.)
        **kwargs: Variables for template substitution

    Returns:
        Formatted template string with variables substituted

    Examples:
        >>> get_template('triad', 'default', task_1='Finish report', task_2='Gym', task_3='Read')
        "Based on your progress, here's what matters most tomorrow:\\n1. Finish report\\n2. Gym\\n3. Read..."

        >>> get_template('recap', 'no_activity')
        "No tasks completed today.\\n\\nTomorrow is a fresh start..."

        >>> get_template('unknown_module')
        "I'm here to help with unknown_module..."
    """
    # Get module templates (fallback to generic)
    module_templates = TEMPLATES.get(module, TEMPLATES["generic"])

    # Get specific variant (fallback to default)
    template = module_templates.get(variant, module_templates.get("default", ""))

    # If template is empty, use generic fallback
    if not template:
        template = TEMPLATES["generic"]["default"]
        kwargs["module"] = module

    # Substitute variables
    try:
        return template.format(**kwargs)
    except KeyError:
        # Missing variable - return template with placeholders visible
        # This helps debugging in development
        return template


def list_modules() -> list[str]:
    """
    Get list of available template modules.

    Returns:
        List of module names
    """
    return [m for m in TEMPLATES.keys() if m != "generic"]


def list_variants(module: str) -> list[str]:
    """
    Get list of available variants for a module.

    Args:
        module: Module name

    Returns:
        List of variant names, or empty list if module not found
    """
    if module in TEMPLATES:
        return list(TEMPLATES[module].keys())
    return []


def add_template(module: str, variant: str, template: str) -> None:
    """
    Dynamically add a new template (useful for testing or runtime extensions).

    Args:
        module: Module name (will create if doesn't exist)
        variant: Variant name
        template: Template string with {variable} placeholders
    """
    if module not in TEMPLATES:
        TEMPLATES[module] = {}
    TEMPLATES[module][variant] = template
