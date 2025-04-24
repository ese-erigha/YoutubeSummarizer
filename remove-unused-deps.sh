#!/bin/bash

echo "Removing unused dependencies..."

# List of packages identified as potentially unused
UNUSED_PACKAGES=(
  "@hookform/resolvers"
  "@jridgewell/trace-mapping"
  "@neondatabase/serverless"
  "@types/connect-pg-simple"
  "@types/passport"
  "@types/passport-local"
  "connect-pg-simple"
  "date-fns"
  "drizzle-kit"
  "drizzle-orm"
  "framer-motion"
  "google-auth-library"
  "googleapis"
  "memorystore"
  "next-themes"
  "passport"
  "passport-local"
  "tw-animate-css"
)

# Keeping required type definitions and essential packages
KEEP_PACKAGES=(
  "@types/node"
  "@types/ws"
  "autoprefixer"
  "postcss"
  "bufferutil"
  "ws"
)

# Uninstall unused packages
for package in "${UNUSED_PACKAGES[@]}"; do
  echo "Removing $package..."
  npm uninstall "$package"
done

echo "Removal completed!"
echo "Note: Some packages were kept as they might be required for the build process."