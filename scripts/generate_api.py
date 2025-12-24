#!/usr/bin/env python3
"""
API Scaffolding Script for Weave Backend
Story 1.5.2: Backend API/Model Standardization

Generates router, schema, and test files from templates for a new API resource.

Usage:
    python scripts/generate_api.py <resource_name> [resource_plural]

Examples:
    python scripts/generate_api.py goal
    python scripts/generate_api.py goal goals
    python scripts/generate_api.py journal-entry journal-entries

Generated Files:
    - weave-api/app/api/{resources}/router.py
    - weave-api/app/schemas/{resource}.py
    - weave-api/tests/test_{resource}_api.py
"""

import sys
import os
import re
from pathlib import Path
from typing import Tuple


# ============================================================================
# CONFIGURATION
# ============================================================================

# Project root (parent of scripts/)
PROJECT_ROOT = Path(__file__).parent.parent

# Template paths
TEMPLATES_DIR = PROJECT_ROOT / "scripts" / "templates"
API_ROUTER_TEMPLATE = TEMPLATES_DIR / "api_router_template.py"
PYDANTIC_SCHEMA_TEMPLATE = TEMPLATES_DIR / "pydantic_schema_template.py"
TEST_TEMPLATE = TEMPLATES_DIR / "test_template.py"

# Output paths
WEAVE_API_DIR = PROJECT_ROOT / "weave-api"
API_DIR = WEAVE_API_DIR / "app" / "api"
SCHEMAS_DIR = WEAVE_API_DIR / "app" / "schemas"
TESTS_DIR = WEAVE_API_DIR / "tests"


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def to_snake_case(name: str) -> str:
    """Convert kebab-case or PascalCase to snake_case"""
    # Convert kebab-case to snake_case
    name = name.replace("-", "_")
    # Convert PascalCase to snake_case
    name = re.sub(r'(?<!^)(?=[A-Z])', '_', name).lower()
    return name


def to_pascal_case(name: str) -> str:
    """Convert snake_case or kebab-case to PascalCase"""
    # Replace dashes and underscores with spaces, then title case, then remove spaces
    name = name.replace("-", " ").replace("_", " ")
    return "".join(word.capitalize() for word in name.split())


def to_kebab_case(name: str) -> str:
    """Convert snake_case or PascalCase to kebab-case"""
    name = to_snake_case(name)
    return name.replace("_", "-")


def get_resource_names(resource_name: str, resource_plural: str = None) -> Tuple[str, str, str]:
    """
    Get standardized resource names in different formats

    Args:
        resource_name: Resource name (singular)
        resource_plural: Optional plural form (auto-generated if not provided)

    Returns:
        Tuple of (singular snake_case, plural snake_case, PascalCase)

    Examples:
        get_resource_names("goal") → ("goal", "goals", "Goal")
        get_resource_names("journal-entry") → ("journal_entry", "journal_entries", "JournalEntry")
    """
    # Singular form
    resource_singular = to_snake_case(resource_name)

    # Plural form (auto-generate if not provided)
    if resource_plural:
        resource_plural = to_snake_case(resource_plural)
    else:
        # Simple pluralization (add 's')
        # Note: For irregular plurals, user should provide resource_plural explicitly
        if resource_singular.endswith('y') and resource_singular[-2] not in 'aeiou':
            # entry → entries, category → categories
            resource_plural = resource_singular[:-1] + "ies"
        elif resource_singular.endswith('s'):
            # status → statuses
            resource_plural = resource_singular + "es"
        else:
            # goal → goals
            resource_plural = resource_singular + "s"

    # PascalCase form (from singular)
    resource_class = to_pascal_case(resource_singular)

    return resource_singular, resource_plural, resource_class


def load_template(template_path: Path) -> str:
    """Load template file content"""
    if not template_path.exists():
        print(f"❌ Template not found: {template_path}")
        sys.exit(1)

    with open(template_path, 'r', encoding='utf-8') as f:
        return f.read()


def replace_placeholders(content: str, resource: str, resources: str, Resource: str) -> str:
    """Replace template placeholders with actual resource names"""
    replacements = {
        "{resource}": resource,
        "{resources}": resources,
        "{Resource}": Resource,
        "{TABLE}": resources.upper(),  # For SQL constraints
    }

    for placeholder, value in replacements.items():
        content = content.replace(placeholder, value)

    return content


def write_file(output_path: Path, content: str, overwrite: bool = False) -> bool:
    """
    Write content to file

    Args:
        output_path: Path to output file
        content: File content
        overwrite: If False, skip if file already exists

    Returns:
        True if file was written, False if skipped
    """
    if output_path.exists() and not overwrite:
        print(f"⏭️  Skipping (already exists): {output_path.relative_to(PROJECT_ROOT)}")
        return False

    # Create parent directory if needed
    output_path.parent.mkdir(parents=True, exist_ok=True)

    # Write file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Created: {output_path.relative_to(PROJECT_ROOT)}")
    return True


# ============================================================================
# GENERATION FUNCTIONS
# ============================================================================

def generate_router(resource: str, resources: str, Resource: str) -> Path:
    """Generate API router file"""
    # Load template
    template = load_template(API_ROUTER_TEMPLATE)

    # Replace placeholders
    content = replace_placeholders(template, resource, resources, Resource)

    # Output path: weave-api/app/api/{resources}/router.py
    output_dir = API_DIR / resources
    output_path = output_dir / "router.py"

    # Also create __init__.py in the directory
    init_path = output_dir / "__init__.py"
    if not init_path.exists():
        output_dir.mkdir(parents=True, exist_ok=True)
        with open(init_path, 'w') as f:
            f.write(f'"""API router for {resources}"""\n')
            f.write(f'from .router import router\n\n')
            f.write(f'__all__ = ["router"]\n')
        print(f"✅ Created: {init_path.relative_to(PROJECT_ROOT)}")

    # Write router file
    write_file(output_path, content)

    return output_path


def generate_schema(resource: str, resources: str, Resource: str) -> Path:
    """Generate Pydantic schema file"""
    # Load template
    template = load_template(PYDANTIC_SCHEMA_TEMPLATE)

    # Replace placeholders
    content = replace_placeholders(template, resource, resources, Resource)

    # Output path: weave-api/app/schemas/{resource}.py
    output_path = SCHEMAS_DIR / f"{resource}.py"

    # Write schema file
    write_file(output_path, content)

    return output_path


def generate_test(resource: str, resources: str, Resource: str) -> Path:
    """Generate test file"""
    # Load template
    template = load_template(TEST_TEMPLATE)

    # Replace placeholders
    content = replace_placeholders(template, resource, resources, Resource)

    # Output path: weave-api/tests/test_{resource}_api.py
    output_path = TESTS_DIR / f"test_{resource}_api.py"

    # Write test file
    write_file(output_path, content)

    return output_path


def print_next_steps(resource: str, resources: str, Resource: str):
    """Print instructions for next steps after generation"""
    print("\n" + "=" * 70)
    print("📝 NEXT STEPS")
    print("=" * 70)

    print(f"""
1. **Review Generated Files:**
   - Router:  weave-api/app/api/{resources}/router.py
   - Schemas: weave-api/app/schemas/{resource}.py
   - Tests:   weave-api/tests/test_{resource}_api.py

2. **Register Router in main.py:**
   Add to weave-api/app/main.py:

   from app.api.{resources} import router as {resources}_router
   app.include_router({resources}_router)

3. **Implement Endpoints:**
   - Replace HTTPException(501) placeholders with actual logic
   - Add database queries (Supabase)
   - Implement business logic
   - Update Epic/Story references in docstrings

4. **Customize Schemas:**
   - Add resource-specific fields
   - Update field validators
   - Adjust constraints and validation rules

5. **Write Tests:**
   - Implement test cases (currently using pytest.skip())
   - Add test fixtures as needed
   - Run: uv run pytest tests/test_{resource}_api.py -v

6. **Documentation:**
   - Update endpoint docstrings with Epic/Story references
   - Add OpenAPI examples
   - Document business rules

7. **Test Your Implementation:**
   - Run tests: uv run pytest tests/test_{resource}_api.py
   - Run linting: uv run ruff check .
   - Start server: uv run uvicorn app.main:app --reload
   - Test endpoints: curl http://localhost:8000/api/{resources}
""")


# ============================================================================
# MAIN
# ============================================================================

def main():
    """Main entry point"""
    # Parse arguments
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_api.py <resource_name> [resource_plural]")
        print("\nExamples:")
        print("  python scripts/generate_api.py goal")
        print("  python scripts/generate_api.py journal-entry journal-entries")
        sys.exit(1)

    resource_name = sys.argv[1]
    resource_plural = sys.argv[2] if len(sys.argv) > 2 else None

    # Get standardized names
    resource, resources, Resource = get_resource_names(resource_name, resource_plural)

    print("=" * 70)
    print("🚀 GENERATING API SCAFFOLDING")
    print("=" * 70)
    print(f"Resource (singular): {resource}")
    print(f"Resource (plural):   {resources}")
    print(f"Resource (class):    {Resource}")
    print("=" * 70)

    # Check if templates exist
    if not API_ROUTER_TEMPLATE.exists():
        print(f"❌ Router template not found: {API_ROUTER_TEMPLATE}")
        print("Run Story 1.5.2 implementation first to create templates.")
        sys.exit(1)

    # Generate files
    print("\n📁 Generating files...\n")

    try:
        router_path = generate_router(resource, resources, Resource)
        schema_path = generate_schema(resource, resources, Resource)
        test_path = generate_test(resource, resources, Resource)

        print("\n✅ All files generated successfully!")

        # Print next steps
        print_next_steps(resource, resources, Resource)

    except Exception as e:
        print(f"\n❌ Error during generation: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
