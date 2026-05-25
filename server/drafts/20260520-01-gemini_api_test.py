import os
from google import genai
from dotenv import load_dotenv


load_dotenv()
API_KEY = os.getenv("GOOGLE_API_KEY")

client = genai.Client(
    api_key=API_KEY
)

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Hello! Can you give me an explanation of your capabilities as a model?",
    config={
        "temperature": 0.7,
        "top_p": 0.1
    }
)

print(response.text)