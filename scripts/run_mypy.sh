#!/bin/bash

# Get list of changed Python files from origin/main
changed_files=$(git diff --name-only origin/main | grep -E '\.py$')

# Check if there are any changed files
if [ -z "$changed_files" ]; then
  echo "No Python files have changed from origin/main."
  exit 0
fi

# Install mypy types and run mypy for each changed file
for file in $changed_files; do
  echo -e "Checking $file"
  mypy --install-types --non-interactive --config-file=.github/linters/mypy.ini --show-error-codes --ignore-missing-imports --follow-imports=silent --pretty "$file"
done
