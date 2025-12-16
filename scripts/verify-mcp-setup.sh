#!/bin/bash
# WeaveLight MCP Setup Verification Script
# Run this to check if your MCP servers are configured correctly

echo "========================================"
echo "  WeaveLight MCP Setup Verification"
echo "========================================"
echo ""

errors=0
warnings=0

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "[1/8] Checking Node.js..."
if command -v node &> /dev/null; then
    nodeVersion=$(node --version)
    echo -e " ${GREEN}✓ Installed ($nodeVersion)${NC}"
else
    echo -e " ${RED}✗ Not found${NC}"
    echo -e "      ${YELLOW}Install from: https://nodejs.org/${NC}"
    ((errors++))
fi

# Check npx
echo -n "[2/8] Checking npx..."
if command -v npx &> /dev/null; then
    npxVersion=$(npx --version)
    echo -e " ${GREEN}✓ Available ($npxVersion)${NC}"
else
    echo -e " ${RED}✗ Not found${NC}"
    ((errors++))
fi

# Check .mcp.json
echo -n "[3/8] Checking .mcp.json..."
if [ -f ".mcp.json" ]; then
    if python3 -m json.tool .mcp.json > /dev/null 2>&1; then
        echo -e " ${GREEN}✓ Found${NC}"
        serverCount=$(python3 -c "import json; print(len(json.load(open('.mcp.json'))['mcpServers']))" 2>/dev/null)
        echo -e "      ${CYAN}Configured servers: $serverCount${NC}"
    else
        echo -e " ${RED}✗ Invalid JSON${NC}"
        echo -e "      ${YELLOW}Fix JSON syntax errors${NC}"
        ((errors++))
    fi
else
    echo -e " ${RED}✗ Not found${NC}"
    echo -e "      ${YELLOW}Create .mcp.json in project root${NC}"
    ((errors++))
fi

# Check .env file
echo -n "[4/8] Checking .env file..."
if [ -f ".env" ]; then
    echo -e " ${GREEN}✓ Found${NC}"

    # Check for API keys
    if grep -q "CONTEXT7_API_KEY=.\+" .env; then
        echo -e "      ${GREEN}✓ Context7 API key configured${NC}"
    else
        echo -e "      ${YELLOW}⚠ Context7 API key not set${NC}"
        ((warnings++))
    fi

    if grep -q "GITHUB_PERSONAL_ACCESS_TOKEN=.\+" .env; then
        echo -e "      ${GREEN}✓ GitHub token configured${NC}"
    else
        echo -e "      ${YELLOW}⚠ GitHub token not set${NC}"
        ((warnings++))
    fi
else
    echo -e " ${YELLOW}⚠ Not found${NC}"
    echo -e "      ${YELLOW}Create .env file for API keys (recommended)${NC}"
    ((warnings++))
fi

# Check .gitignore
echo -n "[5/8] Checking .gitignore..."
if [ -f ".gitignore" ]; then
    hasEnv=$(grep -c "\.env" .gitignore || true)
    hasMcp=$(grep -c "\.mcp\.json" .gitignore || true)

    if [ "$hasEnv" -gt 0 ] && [ "$hasMcp" -gt 0 ]; then
        echo -e " ${GREEN}✓ API keys protected${NC}"
    elif [ "$hasEnv" -gt 0 ]; then
        echo -e " ${YELLOW}⚠ .mcp.json not in .gitignore${NC}"
        ((warnings++))
    elif [ "$hasMcp" -gt 0 ]; then
        echo -e " ${YELLOW}⚠ .env not in .gitignore${NC}"
        ((warnings++))
    else
        echo -e " ${RED}✗ Sensitive files not protected${NC}"
        echo -e "      ${YELLOW}Add .env and .mcp.json to .gitignore${NC}"
        ((errors++))
    fi
else
    echo -e " ${YELLOW}⚠ .gitignore not found${NC}"
    ((warnings++))
fi

# Check project path
echo -n "[6/8] Checking project path..."
currentPath=$(pwd)
expectedPath="/mnt/c/Users/Jack Luo/Desktop/(local) github software/weavelight"
if [ "$currentPath" == "$expectedPath" ]; then
    echo -e " ${GREEN}✓ Correct location${NC}"
else
    echo -e " ${YELLOW}⚠ Running from: $currentPath${NC}"
    echo -e "      ${YELLOW}Expected: $expectedPath${NC}"
    ((warnings++))
fi

# Check docs folder
echo -n "[7/8] Checking docs folder..."
if [ -d "docs" ]; then
    echo -e " ${GREEN}✓ Found${NC}"
else
    echo -e " ${RED}✗ Not found${NC}"
    ((errors++))
fi

# Check for setup guide
echo -n "[8/8] Checking setup guide..."
if [ -f "docs/setup/mcp-setup-guide.md" ]; then
    echo -e " ${GREEN}✓ Found${NC}"
else
    echo -e " ${YELLOW}⚠ Setup guide not found${NC}"
    ((warnings++))
fi

# Summary
echo ""
echo "========================================"
echo "  Summary"
echo "========================================"

if [ "$errors" -eq 0 ] && [ "$warnings" -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo -e "${CYAN}Next steps:${NC}"
    echo "1. Add API keys to .env file"
    echo "2. Restart Claude Code"
    echo "3. Test with MCP servers"
elif [ "$errors" -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup is functional with $warnings warning(s)${NC}"
    echo ""
    echo "You can proceed, but consider fixing warnings for best experience."
else
    echo -e "${RED}✗ Found $errors error(s) and $warnings warning(s)${NC}"
    echo ""
    echo "Fix errors above before proceeding."
fi

echo ""
echo -e "${CYAN}For detailed setup instructions:${NC}"
echo "  docs/setup/mcp-setup-guide.md"
echo ""
