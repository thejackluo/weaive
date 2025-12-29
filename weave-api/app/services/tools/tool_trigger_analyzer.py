"""
Tool Trigger Analyzer (Story 6.2 - AI Tool Use System)

Deterministic system that analyzes user messages to determine which tools
should be executed. This replaces the unreliable approach of asking the AI
to decide when to use tools.

Architecture:
1. User message → Tool Trigger Analyzer (pattern matching)
2. If matched → Execute tool immediately
3. Send tool results + original message → AI
4. AI generates natural response with personality
"""

import logging
import re
from typing import Any, Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)


class ToolTrigger:
    """
    Represents a trigger pattern for a specific tool.

    Attributes:
        tool_name: Name of tool to execute
        patterns: List of regex patterns that trigger this tool
        parameter_extractors: Functions to extract parameters from matched text
    """

    def __init__(
        self,
        tool_name: str,
        patterns: List[str],
        parameter_extractor: Optional[callable] = None
    ):
        self.tool_name = tool_name
        self.patterns = [re.compile(pattern, re.IGNORECASE) for pattern in patterns]
        self.parameter_extractor = parameter_extractor or self._default_extractor

    def _default_extractor(self, message: str, match: re.Match) -> Dict[str, Any]:
        """Default parameter extractor (returns empty dict)."""
        return {}

    def matches(self, message: str) -> Optional[Tuple[re.Match, Dict[str, Any]]]:
        """
        Check if message matches any patterns and extract parameters.

        Args:
            message: User message to check

        Returns:
            Tuple of (match, parameters) if matched, None otherwise
        """
        for pattern in self.patterns:
            match = pattern.search(message)
            if match:
                parameters = self.parameter_extractor(message, match)
                logger.info(f"✅ [ToolTrigger] Matched '{self.tool_name}' with pattern: {pattern.pattern}")
                logger.info(f"📦 [ToolTrigger] Extracted parameters: {parameters}")
                return (match, parameters)
        return None


class ToolTriggerAnalyzer:
    """
    Analyzes user messages to determine which tools should be executed.

    Usage:
        analyzer = ToolTriggerAnalyzer()

        # Check if message triggers any tools
        triggers = analyzer.analyze_message("Update my identity document...")

        if triggers:
            for tool_name, parameters in triggers:
                result = await tool_registry.execute_tool(tool_name, user_id, parameters)
    """

    def __init__(self):
        """Initialize with default triggers."""
        self.triggers: List[ToolTrigger] = []
        self._register_default_triggers()
        logger.info(f"🔍 [ToolTriggerAnalyzer] Initialized with {len(self.triggers)} triggers")

    def _register_default_triggers(self):
        """Register default tool triggers."""

        # ========================================
        # IDENTITY DOCUMENT MODIFICATION
        # ========================================
        def extract_identity_params(message: str, match: re.Match) -> Dict[str, Any]:
            """Extract identity document parameters from message."""
            params = {}

            # Extract dream_self / name
            name_patterns = [
                r'I am ([^,.]+)',
                r'my name is ([^,.]+)',
                r'call me ([^,.]+)',
            ]
            for pattern in name_patterns:
                name_match = re.search(pattern, message, re.IGNORECASE)
                if name_match:
                    params['dream_self'] = name_match.group(1).strip()
                    break

            # Extract traits
            traits_patterns = [
                r'traits are:?\s*([^.]+)',
                r'traits:?\s*([^.]+)',
                r'my traits are:?\s*([^.]+)',
            ]
            for pattern in traits_patterns:
                traits_match = re.search(pattern, message, re.IGNORECASE)
                if traits_match:
                    traits_text = traits_match.group(1).strip()
                    # Split by comma, 'and', or semicolon
                    traits = re.split(r'[,;]\s*|\s+and\s+', traits_text)
                    params['traits'] = [t.strip() for t in traits if t.strip()]
                    break

            # Extract archetype
            archetype_patterns = [
                r'archetype is:?\s*([^.]+)',
                r'archetype:?\s*([^.]+)',
                r'my archetype is:?\s*([^.]+)',
            ]
            for pattern in archetype_patterns:
                archetype_match = re.search(pattern, message, re.IGNORECASE)
                if archetype_match:
                    params['archetype'] = archetype_match.group(1).strip()
                    break

            # Extract motivations
            motivation_patterns = [
                r'motivations are:?\s*([^.]+)',
                r'motivations:?\s*([^.]+)',
                r'my motivations are:?\s*([^.]+)',
                r'motivated by:?\s*([^.]+)',
            ]
            for pattern in motivation_patterns:
                motivation_match = re.search(pattern, message, re.IGNORECASE)
                if motivation_match:
                    motivations_text = motivation_match.group(1).strip()
                    motivations = re.split(r'[,;]\s*|\s+and\s+', motivations_text)
                    params['motivations'] = [m.strip() for m in motivations if m.strip()]
                    break

            return params

        identity_trigger = ToolTrigger(
            tool_name='modify_identity_document',
            patterns=[
                # Explicit identity document mentions
                r'(?:update|change|modify|edit|set)\s+(?:my\s+)?identity',

                # Name/dream self updates (very broad)
                r'(?:I\s+am|I\'m|my\s+name\s+is|call\s+me)\s+[A-Z]\w+',  # "I am Jack", "I'm Jack", "My name is Jack"
                r'(?:I\s+want\s+to\s+be|make\s+me)\s+[A-Z]\w+',  # "I want to be Jack"
                r'(?:set|change|update)\s+(?:my\s+)?name\s+to\s+\w+',  # "Set my name to Jack"

                # Traits mentions (catches any sentence with "trait" or "traits")
                r'trait[s]?',  # "My traits are...", "I have these traits", "traits: ambitious"
                r'(?:I\s+am|I\'m)\s+(?:\w+\s+)?(?:and\s+)?\w+(?:\s+and\s+\w+)?',  # "I am ambitious", "I'm ambitious and innovative"

                # Archetype mentions (catches any sentence with "archetype")
                r'archetype',  # "My archetype is...", "archetype: creator"

                # Motivation mentions
                r'motivat(?:ion|ed)',  # "My motivations are...", "I'm motivated by..."

                # Dream self mentions
                r'dream\s+self',  # Any mention of "dream self"
            ],
            parameter_extractor=extract_identity_params
        )
        self.triggers.append(identity_trigger)

        # ========================================
        # PERSONALITY SWITCHING
        # ========================================
        def extract_personality_params(message: str, match: re.Match) -> Dict[str, Any]:
            """Extract personality switching parameters."""
            params = {}

            # Check for Dream Self
            if re.search(r'dream\s+self', message, re.IGNORECASE):
                params['active_personality'] = 'dream_self'
            # Check for Weave AI
            elif re.search(r'weave', message, re.IGNORECASE):
                params['active_personality'] = 'weave_ai'
            # Check for style/preset changes (implies Weave AI if not dream self)
            elif re.search(r'gen\s*z|casual|chill', message, re.IGNORECASE):
                params['active_personality'] = 'weave_ai'
                params['weave_preset'] = 'gen_z_default'
            elif re.search(r'supportive|encourage|coach', message, re.IGNORECASE):
                params['active_personality'] = 'weave_ai'
                params['weave_preset'] = 'supportive_coach'
            elif re.search(r'concise|brief|short', message, re.IGNORECASE):
                params['active_personality'] = 'weave_ai'
                params['weave_preset'] = 'concise_mentor'

            # If we have Weave AI but no preset specified yet, check for preset keywords
            if params.get('active_personality') == 'weave_ai' and 'weave_preset' not in params:
                if re.search(r'gen\s*z|casual|chill', message, re.IGNORECASE):
                    params['weave_preset'] = 'gen_z_default'
                elif re.search(r'supportive|encourage|coach', message, re.IGNORECASE):
                    params['weave_preset'] = 'supportive_coach'
                elif re.search(r'concise|brief|short', message, re.IGNORECASE):
                    params['weave_preset'] = 'concise_mentor'

            return params

        personality_trigger = ToolTrigger(
            tool_name='modify_personality',
            patterns=[
                # Explicit personality switching (must include dream self or weave)
                r'(?:switch|change|set|use)\s+(?:to\s+)?(?:my\s+)?(?:dream\s+self|weave)',
                r'activate\s+(?:dream\s+self|weave)',

                # Personality mentions with dream self or weave
                r'personality.*(?:dream\s+self|weave)',
                r'(?:dream\s+self|weave).*personality',

                # Style/tone requests (these imply Weave AI presets)
                r'(?:be|talk|speak)\s+(?:more\s+)?(?:casual|chill|gen\s*z)',  # Gen Z preset
                r'(?:be|talk|speak)\s+(?:more\s+)?(?:supportive|encouraging|coach)',  # Supportive coach
                r'(?:be|talk|speak)\s+(?:more\s+)?(?:concise|brief|short)',  # Concise mentor
            ],
            parameter_extractor=extract_personality_params
        )
        self.triggers.append(personality_trigger)

    def analyze_message(self, message: str) -> List[Tuple[str, Dict[str, Any]]]:
        """
        Analyze user message and return list of triggered tools with parameters.

        Args:
            message: User message to analyze

        Returns:
            List of (tool_name, parameters) tuples for matched tools
        """
        triggered_tools = []

        logger.info(f"🔍 [ToolTriggerAnalyzer] Analyzing message: {message[:100]}...")

        for trigger in self.triggers:
            match_result = trigger.matches(message)
            if match_result:
                match, parameters = match_result
                triggered_tools.append((trigger.tool_name, parameters))
                logger.info(f"🎯 [ToolTriggerAnalyzer] Tool '{trigger.tool_name}' triggered")

        if not triggered_tools:
            logger.info("❌ [ToolTriggerAnalyzer] No tools triggered")

        return triggered_tools

    def register_trigger(self, trigger: ToolTrigger):
        """Register a custom trigger."""
        self.triggers.append(trigger)
        logger.info(f"✅ [ToolTriggerAnalyzer] Registered custom trigger for '{trigger.tool_name}'")


# Global singleton instance
_global_analyzer: Optional[ToolTriggerAnalyzer] = None


def get_tool_trigger_analyzer() -> ToolTriggerAnalyzer:
    """Get the global ToolTriggerAnalyzer instance (singleton)."""
    global _global_analyzer

    if _global_analyzer is None:
        _global_analyzer = ToolTriggerAnalyzer()
        logger.info("Created global ToolTriggerAnalyzer instance")

    return _global_analyzer
