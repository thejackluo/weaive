"""
Parse Claude Code personality files (.claude/personalities/*.md)
and generate Python config data for integration into Weave AI.

This script:
1. Reads all .md files from .claude/personalities/
2. Extracts YAML frontmatter (name, description, piper_voice)
3. Extracts the full markdown content as system prompt
4. Generates Python dict entries for ai_personality_config.py
"""

import os
import re
from pathlib import Path
from typing import Dict, List

def parse_personality_file(file_path: Path) -> Dict:
    """Parse a single personality markdown file."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract YAML frontmatter
    frontmatter_match = re.search(r'^---\n(.*?)\n---', content, re.MULTILINE | re.DOTALL)
    if not frontmatter_match:
        raise ValueError(f"No frontmatter found in {file_path}")

    frontmatter = frontmatter_match.group(1)

    # Parse frontmatter fields
    name_match = re.search(r'name:\s*(\S+)', frontmatter)
    desc_match = re.search(r'description:\s*(.+)', frontmatter)
    voice_match = re.search(r'piper_voice:\s*(\S+)', frontmatter)

    name = name_match.group(1) if name_match else file_path.stem
    description = desc_match.group(1).strip() if desc_match else ""
    piper_voice = voice_match.group(1) if voice_match else ""

    # Extract emoji from content (first emoji after frontmatter)
    content_after_frontmatter = content[frontmatter_match.end():]
    emoji_match = re.search(r'([^\w\s])\s*\*\*' + re.escape(name), content_after_frontmatter)
    emoji = emoji_match.group(1) if emoji_match else "💬"

    # Extract full content after frontmatter as system prompt
    # Remove the first line (emoji + name header)
    lines = content_after_frontmatter.strip().split('\n')
    system_prompt_lines = [line for line in lines[1:] if line.strip()]
    system_prompt = '\n'.join(system_prompt_lines).strip()

    # If system prompt is empty or just examples, create a basic one
    if not system_prompt or len(system_prompt) < 50:
        system_prompt = f"You are a {description} AI assistant. Communicate in the {name} personality style."

    return {
        'name': name,
        'description': description,
        'emoji': emoji,
        'piper_voice': piper_voice,
        'system_prompt': system_prompt,
    }

def generate_python_config(personalities: List[Dict]) -> str:
    """Generate Python dict entries for ai_personality_config.py"""
    config_entries = []

    for p in personalities:
        # Escape quotes in system prompt
        system_prompt = p['system_prompt'].replace("'", "\\'").replace('"', '\\"')

        entry = f"""    '{p['name']}': {{
        'system_prompt': (
            "{p['description']}\\n\\n"
            "{system_prompt}"
        ),
        'tone_examples': [],  # Extract from original file if needed
        'max_words': 80,  # Default for new personalities
        'style_tags': ['{p['name']}'],
        'emoji': '{p['emoji']}',
        'piper_voice': '{p['piper_voice']}',
    }},
"""
        config_entries.append(entry)

    return '\n'.join(config_entries)

def generate_typescript_config(personalities: List[Dict]) -> str:
    """Generate TypeScript interface entries for frontend"""
    ts_entries = []

    for p in personalities:
        entry = f"""  {{
    id: '{p['name']}',
    emoji: '{p['emoji']}',
    name: '{p['name'].replace('_', ' ').title()}',
    description: '{p['description']}',
  }},"""
        ts_entries.append(entry)

    return '\n'.join(ts_entries)

def main():
    """Main entry point"""
    # Get project root directory
    script_dir = Path(__file__).parent
    project_root = script_dir.parent
    personalities_dir = project_root / '.claude' / 'personalities'

    if not personalities_dir.exists():
        print(f"❌ Personalities directory not found: {personalities_dir}")
        return

    print(f"📂 Reading personalities from: {personalities_dir}")

    # Parse all personality files
    personalities = []
    for md_file in sorted(personalities_dir.glob('*.md')):
        try:
            personality = parse_personality_file(md_file)
            personalities.append(personality)
            print(f"✅ Parsed: {personality['name']} - {personality['description']}")
        except Exception as e:
            print(f"❌ Failed to parse {md_file.name}: {e}")

    print(f"\n📊 Parsed {len(personalities)} personalities")

    # Generate Python config
    print("\n" + "="*80)
    print("PYTHON CONFIG (add to ai_personality_config.py PRESETS dict):")
    print("="*80)
    print(generate_python_config(personalities))

    # Generate TypeScript config
    print("\n" + "="*80)
    print("TYPESCRIPT CONFIG (for frontend constants):")
    print("="*80)
    print(generate_typescript_config(personalities))

    # Save to output files
    output_dir = script_dir / 'personality_integration_output'
    output_dir.mkdir(exist_ok=True)

    with open(output_dir / 'python_config.txt', 'w', encoding='utf-8') as f:
        f.write(generate_python_config(personalities))

    with open(output_dir / 'typescript_config.txt', 'w', encoding='utf-8') as f:
        f.write(generate_typescript_config(personalities))

    print(f"\n💾 Saved output to: {output_dir}/")
    print("✅ Done! Copy the generated config into the respective files.")

if __name__ == '__main__':
    main()
