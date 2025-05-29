def combine_outputs(medical_summary, sentiment_intent, soap_note):
    """Combines outputs from the three agents into a single JSON object."""
    return {
        "Medical_Summary": medical_summary,
        "Sentiment_Intent": sentiment_intent,
        "SOAP_Note": soap_note,
    }
