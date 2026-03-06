# Clone the orchestrator repo
git clone hhttps://github.com/Jedward23/Tmux-Orchestrator

# Go into the directory
cd Tmux orchestrator"

# Make scripts executable
chmod +x schedule_with_note.sh
chmod +x send-claude-message.sh

tmux new-session -s my-first-agent

claude --dangerously-skip-permissions

-----------------------------------------------------------------

Give it this prompt: You are an AI orchestrator. First, let's test that everything works:

1. Check what tmux window you're in:
   Run: tmux display-message -p "#{session_name}:#{window_index}"

2. Test the scheduling script:
   Run: ./schedule_with_note.sh 1 "Test message" 

3. If that works, tell me "Setup successful!"

Then I'll give you a project to work on.

-----------------------------------------------------------------
# See all tmux sessions
tmux ls

# See what the developer is doing
tmux capture-pane -t my-first-agent:1 -p | tail -30

# See what the orchestrator is doing  
tmux capture-pane -t my-first-agent:0 -p | tail -30

