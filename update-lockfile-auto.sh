#!/bin/bash

# Automated script to update package-lock.json and push changes
# This fixes the CI/CD issue where package.json and package-lock.json are out of sync
# This version automatically pushes without asking

set -e  # Exit on error

echo "📦 Updating package-lock.json (auto-push mode)..."
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed or not in PATH"
    echo "   Please install Node.js and npm, then run this script again"
    exit 1
fi

# Run npm install to update package-lock.json
echo "Running: npm install"
npm install

# Check if package-lock.json was updated
if git diff --quiet package-lock.json; then
    echo ""
    echo "ℹ️  package-lock.json is already up to date"
    echo "   No changes to commit"
    exit 0
fi

echo ""
echo "✓ package-lock.json updated successfully"
echo ""

# Stage the updated file
echo "Staging package-lock.json..."
git add package-lock.json

# Commit the changes
echo "Committing changes..."
git commit -m "Update package-lock.json: Add express-rate-limit"

echo ""
echo "✓ Changes committed"
echo ""

# Push automatically
echo "Pushing to remote..."
git push

echo ""
echo "✅ Done! Your package-lock.json is now in sync and pushed to remote"

