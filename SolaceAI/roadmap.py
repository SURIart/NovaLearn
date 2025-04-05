model = "mistral-large-latest"





async def get_roadmap(client, lessons):
    lesson_text = '\n'.join([f"- {lesson}" for lesson in lessons])

    chat_response = client.chat.complete(
        model=model,
        messages=[
            {
                "role": "system",
                "content": '''You are a professional roadmap creator. Generate a learning roadmap using the provided lessons. Represent the lessons as nodes and their relationships as connections in a JSON format like this:

"Nodes": {
    "1": {"text": "Lesson 1", "type": "MainConcept"},
    "2": {"text": "Lesson 2", "type": "SubConcept"},
    "3": {"text": "Lesson 3", "type": "Detail"}
  },
  "Connections": [
    {"from": "1", "to": "2"},
    {"from": "2", "to": "3"}
  ]

Ensure logical connections between the lessons for an effective learning path.'''
            },
            {
                "role": "user",
                "content": f"Create a roadmap using these lessons:\n{lesson_text}"
            },
        ],
        temperature=0.3,
        top_p=0.9,
        random_seed=56,
        response_format={"type": "json_object"},
    )

    return chat_response.choices[0].message.content

