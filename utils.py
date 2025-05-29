import openai
import os
from dotenv import load_dotenv


load_dotenv()

# Set OpenAI API key from environment variable
client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def call_gpt4_mini(prompt):
    """Calls GPT-4 Mini with the given prompt and returns the response."""
    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        max_tokens=1000,
        temperature=0.3,
    )
    return response.choices[0].message.content.strip()
