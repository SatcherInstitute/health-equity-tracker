#!/bin/bash

# Function to check for duplicate column names
check_duplicates() {
    awk -F',' 'NR==1 {for (i=1; i<=NF; i++) if (!seen[$i]++) columns[i]=$i}
               END {for (i in columns) if (seen[i] > 1) { print "*****", columns[i]; exit 1 }}' "$1"
}

# Function to check if the column names contain the specified groups
contains_groups() {
    awk -F',' 'NR==1 {
        for (i=1; i<=NF; i++) {
            if ($i ~ /^(BENE_N|TOTAL_N|PER_100K|BENE_YES|BENE_NO|TOTAL_BENE|BENE_YES_PCT)$/) {
                found = 1;
                break;
            }
        }
        if (!found) exit 1;
    }' "$1"
}

# Initialize variables to keep track of files with duplicates
total_duplicates=0

# Default directory to start the search
start_directory="."

# Function to display usage/help information
display_usage() {
    echo "Usage: $(basename "$0") [-d|--directory directory]"
    echo "  -d, --directory directory  Specify the directory to start the search in (default: current directory)."
    echo "  -h, --help                Display this help message."
}

# Parse command-line options
while getopts ":d:h-:" opt; do
    case "$opt" in
        d|--directory)
            start_directory="$OPTARG"
            ;;
        h|--help)
            display_usage
            exit 0
            ;;
        -)
            case "${OPTARG}" in
                help)
                    display_usage
                    exit 0
                    ;;
            esac
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            display_usage
            exit 1
            ;;
        :)
            echo "Option -$OPTARG requires an argument." >&2
            display_usage
            exit 1
            ;;
    esac
done

# Find CSV files and process them
find "$start_directory" -type f -name "*.csv" | while read -r file; do
    # Check for duplicate column names
    if check_duplicates "$file"; then
        # Check if the column names contain the specified groups
        if ! contains_groups "$file"; then
            continue
        fi

        # Extract subfolder name (if any)
        subfolder=$(dirname "$file" | sed 's|^./||')

        # Output subfolder and filename
        echo "Subfolder: $subfolder"
        echo "File: $(basename "$file")"

        # Output column names
        echo "Column Names:"
        awk -F',' 'NR==1 {for (i=1; i<=NF; i++) print $i}' "$file"

        echo "------------------"
        total_duplicates=$((total_duplicates + 1))
    fi
done

# Report files with duplicate column headers
if [ "$total_duplicates" -gt 0 ]; then
    echo "Total files with duplicate column headers or missing groups: $total_duplicates"
else
    echo "No files with duplicate column headers or missing groups found."
fi
