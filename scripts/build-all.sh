#!/bin/bash

set -e

# Ensure script runs from project root
if [ ! -f "package.json" ] || [ ! -d "backend" ]; then
  echo "❌ Run this script from the project root: bash scripts/build-all.sh"
  exit 1
fi

echo "🚀 Building vSaaS project (Vite + Backend)..."
echo ""

# Packages/types
echo "📦 Building types package..."
cd packages/types
npm install 
npm run build
cd ../..
echo "✅ Types package built"
echo ""

# Frontend (Vite)
echo "⚡ Building frontend (Vite)..."
npm install 
START_TIME=$(date +%s)
npm run build
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
echo "✅ Frontend built in ${BUILD_TIME}s → dist/"
echo ""

# Backend
echo "🔧 Building backend..."
cd backend
npm install 
npm run build
cd ..
echo "✅ Backend built"
echo ""

echo "✨ All builds completed successfully!"
echo ""
echo "Output directories:"
echo "  - Frontend: dist/"
echo "  - Backend: backend/dist/"
echo "  - Types: packages/types/dist/"