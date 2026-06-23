
#!/bin/bash

# Get optional issue number argument
ISSUE_NUMBER="$1"

# Build the prompt
PROMPT=""

# If issue number provided, use it; otherwise let Claude pick
if [ -n "$ISSUE_NUMBER" ]; then
    PROMPT="$PROMPT
Implement issue #$ISSUE_NUMBER"
else
    PROMPT="$PROMPT
Pick a single most important issue to implement"
fi

PROMPT="$PROMPT

IMPORTNAT:
Use /tdd to implement the issue
Any change to file the all tests must pass
Commit the change when the task is done

Mark the issue done and print <promise>Complete</promise> if All unit test pass and automatic test pass"

# Run claude with the prompt and skip permission prompts
echo "$PROMPT" | claude --dangerously-skip-permissions
