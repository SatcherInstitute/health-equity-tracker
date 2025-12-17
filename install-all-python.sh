#!/bin/bash

# because why not
pip install wheel

# Loop 1: Find requirements.txt files safely (handles spaces in paths)
find . -name "requirements.txt" -print0 | while IFS= read -r -d '' file; do
    echo "File: $file"
    pip install -r "$file"
done

# Loop 2: Find directories containing setup.py
find python -type d -print0 | while IFS= read -r -d '' dir; do
    if [ -f "$dir/setup.py" ]; then
        pip install "$dir"
    fi
done
