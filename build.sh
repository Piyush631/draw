#!/bin/bash
set -e

# Install the correct pnpm version
echo "Installing pnpm 8.6.12..."
npm install -g pnpm@8.6.12

# Verify pnpm version
echo "Verifying pnpm version..."
pnpm --version

# Install dependencies
echo "Installing dependencies..."
pnpm install --frozen-lockfile

# Run build
echo "Building project..."
pnpm run build

echo "Build completed successfully!" 