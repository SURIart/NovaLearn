from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from mistralai import Mistral
from typing import List, Dict

app = FastAPI()

# Replace with your actual OpenRouter API key
MISTRAL_API_KEY = "aZIvJpgXJMBAY5ypKXnVx1A4eqBaYDwM"

client = Mistral(api_key=MISTRAL_API_KEY)
model = "open-mixtral-8x7b"


class ChatRequest(BaseModel):
    topic: str
    conversation: List[Dict[str, str]]  # List of messages (role: user/assistant, content)

@app.post("/chat")
def chat_with_ai(request: ChatRequest):
    """
    This endpoint receives a topic and a conversation history, then fetches an AI response
    while ensuring the query remains within the given topic.
    """
    # System prompt to enforce topic restriction
    system_prompt = {
        "role": "system",
        "content": f"You are an AI assistant that ONLY answers questions related to {request.topic}. If the question is unrelated, respond with: 'I'm sorry, but I can only answer questions related to {request.topic}.'"
    }
    
    messages = [system_prompt] + request.conversation
    
    completion = client.chat.complete(
        model=model,
        messages=messages
    )
    
    response_text = completion.choices[0].message.content
    
    # Check if AI refuses to answer due to topic restriction
    if "I can only answer questions related to" in response_text:
        raise HTTPException(status_code=400, detail="Your question is not related to the specified topic.")
    
    return {"response": response_text}
