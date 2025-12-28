#!/bin/bash

# Complete fix for package-lock.json sync issues
# This script ensures package-lock.json is fully in sync with package.json

set -e  # Exit on error

echo "🔧 Complete package-lock.json fix..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    echo "   Please install Node.js and npm, then run this script again"
    exit 1
fi

# Backup current lock file
if [ -f package-lock.json ]; then
    echo "📋 Backing up current package-lock.json..."
    cp package-lock.json package-lock.json.backup
    echo "✓ Backup created"
    echo ""
fi

# Remove node_modules to ensure clean state (optional but recommended)
read -p "Remove node_modules for clean install? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
    echo "✓ Removed"
    echo ""
fi

# Run npm install to regenerate package-lock.json
echo "📦 Running: npm install (this will regenerate package-lock.json)..."
npm install

echo ""
echo "✓ package-lock.json regenerated"
echo ""

# Verify the lock file exists and has content
if [ ! -f package-lock.json ]; then
    echo "❌ Error: package-lock.json was not created"
    exit 1
fi

# Check if there are changes
if git diff --quiet package-lock.json 2>/dev/null; then
    echo "ℹ️  package-lock.json is already up to date"
    echo "   No changes to commit"
    exit 0
fi

echo "✓ Changes detected in package-lock.json"
echo ""

# Stage the updated file
echo "Staging package-lock.json..."
git add package-lock.json

# Commit the changes
echo "Committing changes..."
git commit -m "Update package-lock.json: Sync all dependencies"

echo ""
echo "✓ Changes committed"
echo ""

# Push automatically
echo "Pushing to remote..."
git push

echo ""
echo "✅ Done! Your package-lock.json is now fully synced and pushed to remote"
echo ""
echo "💡 Tip: If CI still fails, try running 'npm ci' locally to verify it works"

