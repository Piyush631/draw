#!/bin/bash
set -e

# Install the correct pnpm version
npm install -g pnpm@8.6.12

# Verify pnpm version
pnpm --version

# Install dependencies
pnpm install --no-frozen-lockfile

# Run build
pnpm build 