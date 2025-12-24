#!/bin/bash
#
# Frontend Hard Reset Script
# Clears ALL caches and reinstalls dependencies from scratch
#
# Usage: ./scripts/hard-reset.sh
#

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "🧹 FRONTEND HARD RESET"
echo "======================"
echo ""
echo "This will:"
echo "  • Stop watchman"
echo "  • Delete .expo cache"
echo "  • Delete node_modules"
echo "  • Delete Metro cache"
echo "  • Delete Expo cache"
echo "  • Delete Haste map cache"
echo "  • Clear npm cache"
echo "  • Reinstall dependencies"
echo "  • Start clean dev server"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborted"
    exit 1
fi

echo ""
echo "🛑 Step 1: Stop watchman..."
watchman watch-del-all 2>/dev/null || echo "   (watchman not running or not installed)"

echo ""
echo "🗑️  Step 2: Delete .expo cache..."
rm -rf .expo
echo "   ✓ Deleted .expo/"

echo ""
echo "🗑️  Step 3: Delete node_modules..."
rm -rf node_modules
echo "   ✓ Deleted node_modules/"

echo ""
echo "🗑️  Step 4: Delete package-lock.json..."
rm -f package-lock.json
echo "   ✓ Deleted package-lock.json"

echo ""
echo "🗑️  Step 5: Delete Metro cache..."
rm -rf /tmp/metro-* 2>/dev/null || true
rm -rf /tmp/react-* 2>/dev/null || true
echo "   ✓ Deleted /tmp/metro-*"

echo ""
echo "🗑️  Step 6: Delete Haste map cache..."
rm -rf /tmp/haste-map-* 2>/dev/null || true
echo "   ✓ Deleted /tmp/haste-map-*"

echo ""
echo "🗑️  Step 7: Delete Expo cache (~/.expo)..."
rm -rf ~/.expo/cache 2>/dev/null || true
echo "   ✓ Deleted ~/.expo/cache"

echo ""
echo "🧼 Step 8: Clear npm cache..."
npm cache clean --force
echo "   ✓ Cleared npm cache"

echo ""
echo "📦 Step 9: Reinstall dependencies..."
npm install
echo "   ✓ Dependencies installed"

echo ""
echo "✅ HARD RESET COMPLETE!"
echo ""
echo "🚀 Starting clean dev server..."
echo "   (Metro will rebuild the entire bundle)"
echo ""

# Start with full cache clear
npm start -- --reset-cache --clear
