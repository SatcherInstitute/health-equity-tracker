#!/bin/bash

# Set your OpenAI API key here or export it in your shell
OPENAI_API_KEY="${OPENAI_API_KEY:-your_api_key_here}"

# Check if there are staged changes
if ! git diff --cached --quiet; then
    echo "Generating commit message from staged changes..."

    # Get the staged diff (including new files)
    DIFF=$(git diff --cached --diff-algorithm=default)

    # If diff is empty, try getting status of new files
    if [ -z "$DIFF" ]; then
        DIFF=$(git diff --cached --no-color)
    fi

    # Debug: Show diff length (comment out after testing)
    echo "Diff length: ${#DIFF}"

    # Create the JSON payload
    JSON_PAYLOAD=$(jq -n \
      --arg diff "$DIFF" \
      '{
        "model": "gpt-4o-mini",
        "messages": [
          {
            "role": "system",
            "content": "You are a helpful assistant that generates concise conventional commit messages. Only return the commit message, nothing else."
          },
          {
            "role": "user",
            "content": ("Generate a conventional commit message for the following git diff. Use the format: type(scope): description. Types can be: feat, fix, docs, style, refactor, test, chore. Keep it concise and under 72 characters for the first line.\n\nDiff:\n" + $diff)
          }
        ],
        "temperature": 0.7,
        "max_tokens": 100
      }')

    # Make API call to OpenAI
    RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${OPENAI_API_KEY}" \
      -d "$JSON_PAYLOAD")

    # Debug: Show raw response (comment out after testing)
    # echo "Raw API Response:"
    # echo "$RESPONSE"

    # Extract commit message from response using jq (better JSON parsing)
    if command -v jq &> /dev/null; then
        COMMIT_MSG=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')
    else
        # Fallback without jq
        COMMIT_MSG=$(echo "$RESPONSE" | sed -n 's/.*"content":"\([^"]*\)".*/\1/p' | sed 's/\\n/\n/g')
    fi

    # Display the generated message
    echo ""
    echo "Generated commit message:"
    echo "------------------------"
    echo "$COMMIT_MSG"
    echo "------------------------"
    echo ""

    # Ask user to confirm
    read -p "Use this commit message? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git commit -m "$COMMIT_MSG"
        echo "Committed!"
    else
        echo "Commit cancelled."
    fi
else
    echo "No staged changes found. Stage changes with 'git add' first."
fi