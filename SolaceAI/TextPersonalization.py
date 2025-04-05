from Readability import Readability
from mistralai import Mistral
from SematicAnalysis import semantic_coherence_score
from fastapi import HTTPException
import cloudinary
import cloudinary.uploader
import uuid
import os
from typing import List 
import re
import requests
from pydantic import BaseModel

class InputModel(BaseModel):
    topic:str
    subject:str
    Readscore:float
    Semanticscore:float
    user_preference: List[str]
    url:str



api_key = "aZIvJpgXJMBAY5ypKXnVx1A4eqBaYDwM"
model = "open-mixtral-8x22b"
client = Mistral(api_key=api_key)
# Cloudinary Configuration
cloudinary.config( 
    cloud_name = "dfm9b5jpx", 
    api_key = "732623928637278", 
    api_secret = "_tgjISFg6oR452QY8Lda_YcVwLw", # Click 'View API Keys' above to copy your API secret
    secure=True
)
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

def create_txt(content):
    file_name = f"{uuid.uuid4()}.txt"
    file_path = os.path.join("generated_files", file_name)
    os.makedirs("generated_files", exist_ok=True)
    
    with open(file_path, "w", encoding="utf-8") as file:
        file.write(content)
    
    return file_path

# Function to upload DOCX to Cloudinary
def upload_to_cloudinary(file_path):
    upload_result = cloudinary.uploader.upload(file_path, resource_type="raw")
    os.remove(file_path)
    return upload_result.get("secure_url")

def extract_headers_and_text(text):
    headers = []
    texts = []
    
    pattern = re.compile(r'(?P<header>#+\s[\d\.\s\w]+)\n(?P<content>(?:[^#]+(?:\n|$))*)')
    
    for match in pattern.finditer(text):
        header = match.group('header').strip()
        content = match.group('content').strip()
        headers.append(header)
        texts.append(content)
    
    return headers, texts
def combine_markdown(headers, texts):
    if len(headers) != len(texts):
        raise ValueError("Headers and texts lists must have the same length")
    
    markdown_doc = ""
    for header, text in zip(headers, texts):
        markdown_doc += f"{header}\n\n{text}\n\n"
    
    return markdown_doc.strip()

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




async def Personalization(request:InputModel):

    response = requests.get(request.url)
    text_data = response.text 
    headers,paras=extract_headers_and_text(text_data)    
    for i in range(len(paras)):
        if paras[i]=='':
            continue
        original_text=paras[i]
        read=Readability(original_text)
        Oreadscore=read.Readability_score()
        Osemanticscore=semantic_coherence_score(original_text,request.topic)
        paras[i]=text_refine(request.topic,request.subject,Oreadscore,Osemanticscore,request.Readscore,request.Semanticscore,request.user_preference,original_text)
    markdown_content = combine_markdown(headers, paras)
    try:
        # Create TXT file
        file_path = create_txt(markdown_content)
        
        # Upload DOCX to Cloudinary
        doc_url = upload_to_cloudinary(file_path)
        
        return {"document_url": doc_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))






























# headers, texts = extract_headers_and_text(text)
# print("Headers:", headers)
# print("\n\n\n")
# print("Texts:", texts)
# print("\n\n\n")
# markdown_content = combine_markdown(headers, texts)
# print(markdown_content)
