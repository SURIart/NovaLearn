import json
from pydantic import BaseModel
from mistralai import Mistral
class Curriculum(BaseModel):
    curriculum: str
    description: str
    lessons: list[str]
    EstimatedCompeletionTime: int
api_key = "aZIvJpgXJMBAY5ypKXnVx1A4eqBaYDwM"
model = "mistral-large-2402"
client = Mistral(api_key=api_key)
async def get_Curriculum(curriculum:str)->json:
    System_prompt='''Your an expert in setting up curriculum for any domain based given curriculum name.
    Generate :1.title
    2.curriculum descrpition
    3.estimated completion time of that curriculum
    4.List of strings of only major 25 subjects in it .'''
    user_prompt=f"Generate curriculum details for {curriculum}."
    chat_response = client.chat.parse(
                model=model,
                messages=[
                    {
                        "role": "system", 
                        "content": System_prompt
                    },
                    {
                        "role": "user", 
                        "content": user_prompt
                    },
                ],
                response_format=Curriculum,
                max_tokens=3000,
                temperature=0.1,
                top_p=0.05,
                random_seed=24,
            )
    try:
        json_data=json.loads(chat_response.choices[0].message.content)

    except Exception as e:
        print(e)
    else:
        return json_data

            