import json
from pydantic import BaseModel
from mistralai import Mistral

class Lesson(BaseModel):
    title: str
    Description: str
    subject: str
    prequisites: list[str]
    Next_Lesson: list[str]
    keywords: list[str]
    Applications:list[str]
    Difficulty: str
    EstimatedCompeletionTime: int

api_key = "Vjlsaze8UNqSr0CXYwIw7Ccu8mRlwQvV"
model = "ministral-8b-latest"

client = Mistral(api_key=api_key)

from typing import Union, Dict

async def get_lessons(lesson: str) -> Union[Dict, str]:
    while True:   
        try:
            chat_response = client.chat.parse(
                model=model,
                messages=[
                    {
                        "role": "system", 
                        "content": "Provide structered output of lesson details for any lesson given"
                    },
                    {
                        "role": "user", 
                        "content": f"Details of {lesson}"
                    },
                ],
                response_format=Lesson,
                max_tokens=500,
                temperature=0.1
            )
            
            json_data=json.loads(chat_response.choices[0].message.content)

        except Exception as e:
            continue
        else:
            return json_data
    
        