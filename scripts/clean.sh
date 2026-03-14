#!/bin/bash

set -e

# Ensure script runs from project root
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
  echo "❌ Run this script from the project root: bash scripts/clean.sh"
  exit 1
fi

echo "🧹 Cleaning vSaaS build outputs..."
echo ""

# Frontend
if [ -d "dist" ]; then
    echo "🗑️  Removing dist/"
    rm -rf dist
    echo "✅ Frontend output cleaned"
else
    echo "ℹ️  dist/ not found"
fi
echo ""

# Backend
if [ -d "backend/dist" ]; then
    echo "🗑️  Removing backend/dist/"
    rm -rf backend/dist
    echo "✅ Backend output cleaned"
else
    echo "ℹ️  backend/dist/ not found"
fi
echo ""

# Types
if [ -d "packages/types/dist" ]; then
    echo "🗑️  Removing packages/types/dist/"
    rm -rf packages/types/dist
    echo "✅ Types output cleaned"
else
    echo "ℹ️  packages/types/dist/ not found"
fi
echo ""

# Node modules 
if [ "$1" = "--all" ]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules backend/node_modules packages/types/node_modules
    echo "✅ All node_modules cleaned"
fi

echo "✨ Clean completed!"
