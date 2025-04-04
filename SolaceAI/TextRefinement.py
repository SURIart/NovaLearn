from mistralai import Mistral

api_key = "aZIvJpgXJMBAY5ypKXnVx1A4eqBaYDwM"
model = "open-mixtral-8x22b"
client = Mistral(api_key=api_key)

user_pref = [
    "Concise", "Step-by-Step", "In-depth", "Technical", "Simplified", "Formal", 
    "Casual", "Neutral", "Persuasive", "Descriptive", "Young Students", 
    "High school", "Expert", "Universal", "Bullet Points", "Paragraph", 
    "Code and Example", "Question and Answer", "More Engaging", "More Objective", 
    "More Visual", "More Direct", "Short Paragraphs", "Long-form Content", 
    "Dialog Format", "Table or Chart", "Real-world Comparison", "Humorous", 
    "Analytical", "Motivational", "Optimistic", "Professional", "Case Study", 
    "Historical Narrative", "Story-Telling", "Minimalist", "References"
]



System_prompt=f'''Your an expert Text Refiner who personalizes a given context of orginal text to a user preferred refined text.
The user provides:
topic of text, subject of context along with the text readability score(avg of flesch readability ease and dale chall readability in range [4.95,52.45]) and Semantic coherences of all sentences int the text with topic and subject range [-0.5,1]
and the needed readability score and semantic coherence and user preferences in list on any from {user_pref} for personalizing.
and finnaly the original text.
generate only the new refined personalzied text based on the given input from user.
'''

def text_refine(topic:str,subject:str,Oreadscore:float,Osemanticscore:float,Rreadscore:float,Rsemanticscore:float,user_preference:list[str],original_text:str):
    user_prompt=f'''Provide Personalized text alone for the given original text provided at last per given next instructions.
    no other info just generate and show refined text alone and no title ofor refined text.
    Topic:{topic}
    Subject: {subject}. 
    Original_Text Readability score:{Oreadscore} . 
    Original_text Semantic coherence: {Osemanticscore}. 
    Refined_Text Readability score:{Rreadscore} . 
    Refined_text Semantic coherence: {Rsemanticscore}. 
    Refined_tex User preference: {user_preference}. 
    Original text: {original_text}. 
    Refined:text:
    '''

    chat_response = client.chat.complete(
        model = model,
        messages = [
            {
                "role":"system",
                "content":System_prompt
            },
            {
                "role": "user",
                "content": user_prompt
            },
        ]
    )

    return (chat_response.choices[0].message.content)