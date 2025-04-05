
model = "mistral-large-latest"

async def get_mindmap(client,subject)->str:
    
    chat_response = client.chat.complete(
    model = model,
    messages = [
        {
                "role": "system",
                "content": '''Your educational mind map creator . use your educational expertise to generate the nodes(keywords of lessons) and their connection between the nodes in the json format like:
"Nodes": {
    "1": {"text": "Machine Learning", "type": "MainConcept"},
    "2": {"text": "Supervised Learning", "type": "SubConcept"},
    "3": {"text": "Unsupervised Learning", "type": "SubConcept"},
    "4": {"text": "Regression", "type": "Detail"},
    "5": {"text": "Classification", "type": "Detail"}
  },
  "Connections": [
    {"from": "1", "to": "2"},
    {"from": "1", "to": "3"},
    {"from": "2", "to": "4"},
    {"from": "2", "to": "5"}
  ]'''
            },
             {
                  "role": "user",
                  "content": f"provide me the mindmap details for {subject}",
              },
        ],
        temperature=0.3,
        top_p=0.9,
        random_seed=56,
        response_format={"type":"json_object"},
    )

    return chat_response.choices[0].message.content



