#!/bin/bash

# List all files that have changed since the last git commit
# Excludes: package.json, pnpm-lock.yaml, README.md, stripe_integration.md

git --no-pager status --porcelain -u | \
  grep -v "package.json\|pnpm-lock.yaml\|README.md\|stripe_integration.md" | \
  awk '{print $2}'

