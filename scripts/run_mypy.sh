#!/bin/bash

# Get list of changed Python files from origin/main
changed_files=$(git diff --name-only origin/main | grep -E '\.py$')

# Check if there are any changed files
if [ -z "$changed_files" ]; then
  echo "No Python files have changed from origin/main."
  exit 0
fi

# Install mypy types for the changed files
for file in $changed_files; do
  yes | mypy --install-types "$file"
done

# Run mypy against the changed files and print each file being checked
for file in $changed_files; do
  echo -e "\n********\nChecking $file"
  mypy --config-file=.github/linters/mypy.ini --show-error-codes --ignore-missing-imports --follow-imports=silent --pretty "$file"
done
