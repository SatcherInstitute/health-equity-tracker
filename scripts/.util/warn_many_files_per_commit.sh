#!/bin/sh

# Get the list of files to be committed
files=$(git diff --cached --name-only)

# Count the number of files
file_count=$(echo "$files" | wc -l)

# If the file count exceeds 100, issue a warning
if [ "$file_count" -gt 100 ]; then
  echo "Warning: More than 100 files are being committed. If you are sure, run your commit command again starting with SKIP=check-file-count"
  exit 1  # Return non-zero to indicate failure
fi

exit 0  # Return zero to indicate success
