import json
import re
from utils import call_gpt4_mini

def analyze_sentiment_intent(transcript):
    """Analyzes patient sentiment and intent from the transcript and returns a JSON object."""
    prompt = (
        "Analyze this physician-patient conversation to determine the patient's overall sentiment (Anxious, Neutral, Reassured) and intent (Seeking reassurance, Reporting symptoms, Expressing concern, Other). "
        "Output as a JSON object with 'Sentiment' and 'Intent'.\n"
        f"Transcript:\n{transcript}"
    )
    response = call_gpt4_mini(prompt)
    response = re.sub(r"```json\n|\n```", "", response).strip()

    try:
        return json.loads(response)
    except json.JSONDecodeError:
        return {"error": "Failed to parse JSON"}
