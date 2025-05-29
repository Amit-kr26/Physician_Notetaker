import json
import re
from utils import call_gpt4_mini

def generate_soap_note(transcript):
    """Generates a SOAP note from the transcript and returns it as a JSON object."""
    prompt = (
        "Generate a SOAP note from this physician-patient conversation with sections:\n"
        "- Subjective\n"
        "- Objective\n"
        "- Assessment\n"
        "- Plan\n"
        "Set any missing section to 'Not specified'. Output as a JSON object.\n"
        f"Transcript:\n{transcript}"
    )
    response = call_gpt4_mini(prompt)
    response = re.sub(r"```json\n|\n```", "", response).strip()

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON"}
