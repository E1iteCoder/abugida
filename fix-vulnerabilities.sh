#!/bin/bash

# Script to fix Dependabot security vulnerabilities
# This script updates dependencies and fixes security issues

set -e  # Exit on error

echo "🔒 Starting security vulnerability fix process..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check current vulnerabilities
echo "📊 Step 1: Checking current vulnerabilities..."
npm audit --audit-level=moderate || true
echo ""

# Step 2: Update main packages
echo "📦 Step 2: Updating main packages..."
echo "  - Updating react-scripts..."
npm install react-scripts@latest

echo "  - Updating @babel/runtime..."
npm install @babel/runtime@latest --save-dev

echo "  - Updating other dependencies..."
npm update
echo ""

# Step 3: Auto-fix vulnerabilities
echo "🔧 Step 3: Running automatic vulnerability fixes..."
if npm audit fix; then
    echo -e "${GREEN}✓ Automatic fixes applied${NC}"
else
    echo -e "${YELLOW}⚠ Some vulnerabilities may require manual intervention${NC}"
fi
echo ""

# Step 4: Check remaining vulnerabilities
echo "🔍 Step 4: Checking remaining vulnerabilities..."
echo ""
AUDIT_OUTPUT=$(npm audit --audit-level=moderate 2>&1 || true)

if echo "$AUDIT_OUTPUT" | grep -q "found 0 vulnerabilities"; then
    echo -e "${GREEN}✓ All vulnerabilities fixed!${NC}"
    EXIT_CODE=0
elif echo "$AUDIT_OUTPUT" | grep -q "found"; then
    echo -e "${YELLOW}⚠ Some vulnerabilities may remain:${NC}"
    echo "$AUDIT_OUTPUT"
    echo ""
    echo "You may need to:"
    echo "  1. Add 'overrides' to package.json for transitive dependencies"
    echo "  2. Update packages manually"
    echo "  3. Review and dismiss false positives in GitHub"
    EXIT_CODE=1
else
    echo "$AUDIT_OUTPUT"
    EXIT_CODE=0
fi

echo ""
echo "📝 Step 5: Summary"
echo "  - Updated react-scripts to latest version"
echo "  - Updated @babel/runtime to latest version"
echo "  - Ran npm audit fix"
echo ""
echo "⚠️  IMPORTANT: Please test your application before committing!"
echo "  Run: npm start"
echo "  Run: npm run build"
echo ""
echo "To commit changes:"
echo "  git add package.json package-lock.json"
echo "  git commit -m 'Fix security vulnerabilities: update dependencies'"
echo "  git push"
echo ""

exit $EXIT_CODE

