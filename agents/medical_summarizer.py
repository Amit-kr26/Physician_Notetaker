import json
import re
from utils import call_gpt4_mini

def medical_summarize(transcript):
    """Extracts medical details from the transcript and returns a JSON summary."""
    prompt = (
        "Extract key medical details from this physician-patient conversation and output as a JSON object with:\n"
        "- Patient_Name\n"
        "- Symptoms (list)\n"
        "- Diagnosis\n"
        "- Treatment\n"
        "- Current_Status\n"
        "- Prognosis\n"
        "Set any missing field to 'Not specified'.\n"
        f"Transcript:\n{transcript}"
    )
    response = call_gpt4_mini(prompt)
    response = re.sub(r"```json\n|\n```", "", response).strip()

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON"}
