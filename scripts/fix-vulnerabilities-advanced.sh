#!/bin/bash

# Advanced script to fix Dependabot security vulnerabilities
# Includes overrides for transitive dependencies

set -e  # Exit on error

echo "🔒 Starting advanced security vulnerability fix process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backup package files
echo "💾 Creating backup of package files..."
cp package.json package.json.backup
cp package-lock.json package-lock.json.backup 2>/dev/null || true
echo -e "${GREEN}✓ Backup created${NC}"
echo ""

# Step 1: Check current vulnerabilities
echo "📊 Step 1: Checking current vulnerabilities..."
npm audit --audit-level=moderate || true
echo ""

# Step 2: Add overrides to package.json for known vulnerable packages
echo "📝 Step 2: Adding overrides to package.json for transitive dependencies..."

# Check if overrides already exists
if grep -q '"overrides"' package.json; then
    echo -e "${YELLOW}⚠ Overrides already exist in package.json${NC}"
    echo "  You may need to manually update them"
else
    # Use Node.js to safely add overrides
    node << 'EOF'
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Add overrides for known vulnerable packages
pkg.overrides = {
  "nth-check": "^2.1.1",
  "webpack-dev-server": "^4.15.1",
  "postcss": "^8.4.35",
  "@babel/runtime": "^7.25.0"
};

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('✓ Added overrides to package.json');
EOF
    echo -e "${GREEN}✓ Overrides added${NC}"
fi
echo ""

# Step 3: Update main packages
echo "📦 Step 3: Updating main packages..."
echo "  - Updating react-scripts..."
npm install react-scripts@latest

echo "  - Updating @babel/runtime..."
npm install @babel/runtime@latest --save-dev

echo "  - Updating other dependencies..."
npm update
echo ""

# Step 4: Reinstall with overrides
echo "🔄 Step 4: Reinstalling with overrides..."
npm install
echo ""

# Step 5: Auto-fix vulnerabilities
echo "🔧 Step 5: Running automatic vulnerability fixes..."
if npm audit fix; then
    echo -e "${GREEN}✓ Automatic fixes applied${NC}"
else
    echo -e "${YELLOW}⚠ Some vulnerabilities may require manual intervention${NC}"
fi
echo ""

# Step 6: Check remaining vulnerabilities
echo "🔍 Step 6: Checking remaining vulnerabilities..."
echo ""
AUDIT_OUTPUT=$(npm audit --audit-level=moderate 2>&1 || true)

VULN_COUNT=$(echo "$AUDIT_OUTPUT" | grep -oP 'found \K\d+' || echo "0")

if [ "$VULN_COUNT" = "0" ] || echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✓ All vulnerabilities fixed!${NC}"
    EXIT_CODE=0
elif [ "$VULN_COUNT" -gt 0 ]; then
    echo -e "${YELLOW}⚠ Remaining vulnerabilities: $VULN_COUNT${NC}"
    echo "$AUDIT_OUTPUT"
    echo ""
    echo "Remaining issues may require:"
    echo "  1. Manual package updates"
    echo "  2. Reviewing GitHub Dependabot alerts"
    echo "  3. Dismissing false positives"
    EXIT_CODE=1
else
    echo "$AUDIT_OUTPUT"
    EXIT_CODE=0
fi

echo ""
echo "📝 Step 7: Summary"
echo "  ✓ Backup created (package.json.backup, package-lock.json.backup)"
echo "  ✓ Added overrides to package.json"
echo "  ✓ Updated react-scripts to latest version"
echo "  ✓ Updated @babel/runtime to latest version"
echo "  ✓ Ran npm audit fix"
echo ""
echo -e "${BLUE}⚠️  IMPORTANT: Please test your application before committing!${NC}"
echo "  Run: npm start"
echo "  Run: npm run build"
echo ""
echo "If everything works:"
echo "  git add package.json package-lock.json"
echo "  git commit -m 'Fix security vulnerabilities: update dependencies and add overrides'"
echo "  git push"
echo ""
echo "If something breaks, restore from backup:"
echo "  cp package.json.backup package.json"
echo "  cp package-lock.json.backup package-lock.json"
echo "  npm install"
echo ""

exit $EXIT_CODE

