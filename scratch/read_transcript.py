import json
import os

def read_transcript():
    log_path = r"C:\Users\Degnon\.gemini\antigravity-ide\brain\7cd223db-09d4-4d6d-b877-ad294933360a\.system_generated\logs\transcript.jsonl"
    if not os.path.exists(log_path):
        print("Transcript log does not exist!")
        return
        
    print("Reading transcript from:", log_path)
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                step = json.loads(line)
                if step.get("type") == "USER_INPUT":
                    print(f"Step {step.get('step_index')}: {step.get('content')}")
                    # check for image attachments
                    tool_calls = step.get("tool_calls", [])
                    # Let's see if there are images or other metadata in step
                    for k, v in step.items():
                        if k not in ["content", "type", "step_index", "source", "status"]:
                            print(f"  {k}: {str(v)[:100]}")
            except Exception as e:
                pass

if __name__ == "__main__":
    read_transcript()
