#!/bin/bash

# Get list of changed Python files from origin/main
changed_files=$(git diff --name-only origin/main | grep -E '\.py$')

# Check if there are any changed files
if [ -z "$changed_files" ]; then
  echo "No Python files have changed from origin/main."
  exit 0
fi

# Install mypy types and run mypy for each changed file that exists
for file in $changed_files; do
  if [ -f "$file" ]; then
    echo -e "Checking $file"
    mypy --install-types --non-interactive --config-file=.github/linters/mypy.ini --show-error-codes --ignore-missing-imports --incremental --follow-imports=silent --pretty "$file"
  else
    echo -e "Skipping $file (deleted)"
  fi
done