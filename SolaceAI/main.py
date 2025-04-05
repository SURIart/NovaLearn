import json
import os
import re
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
import uvicorn
from mistralai import Mistral
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from CurriculumLessons import LessonData
from doubt_solving import ChatRequest, chat_ai
from TextPersonalization import Personalization,InputModel
from AI_genNotes import create_txt, generate_notes, upload_to_cloudinary
from llm_functions.memory import memory_assessment,logical_assessment,comprehension_assessment,topic_assessment
from mindmap import get_mindmap 
from pydantic import BaseModel

from roadmap import get_roadmap

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

class RoadmapModel(BaseModel):
    lessons : List[str]

mistral_api_key = "XJ8KD9syFmGxHYAeEnzFGrpsR97iaEoF"

MistralClient = Mistral(api_key=mistral_api_key)

@app.get("/hello")
def hello_world():
    return {'message':'hello'}

@app.get("/memory")
async def memory_assessment_endpoint():
    response = await memory_assessment(MistralClient)
    data_dict = json.loads(extract_json(response))
    return data_dict

@app.get("/logical")
async def logical_assessment_endpoint():
    response = await logical_assessment(MistralClient)
    data_dict = json.loads(extract_json(response))
    return data_dict

@app.get("/comprehension")
async def comprehension_assessment_endpoint():
    response = await comprehension_assessment(MistralClient)
    data_dict = json.loads(extract_json(response))
    return data_dict

@app.get("/topic/{topic}")
async def comprehension_assessment_endpoint(topic:str):
    response = await topic_assessment(MistralClient,topic)
    data_dict = json.loads(extract_json(response))
    return data_dict

@app.get("/mindmap/{subject}")
async def getting_mindmap(subject:str):
    response = await get_mindmap(MistralClient,subject)
    data_dict = json.loads(extract_json(response))
    return data_dict


@app.get("/notes/")
def generate_document(topic: str=Query(...),subject:str=Query(...)):
    try:
        # Generate text
        content = generate_notes(MistralClient,topic,subject)
        
        # Create TXT file
        file_path = create_txt(content)
        
        # Upload DOCX to Cloudinary
        doc_url = upload_to_cloudinary(file_path)
        
        return {"document_url": doc_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post('/roadmap')
async def get_roadmap_endpoint(request:RoadmapModel):
    response = await get_roadmap(MistralClient,request.lessons)
    data_dict = json.loads(extract_json(response))
    return data_dict 


@app.post("/chat")
async def chat_with_ai(request: ChatRequest):
    return chat_ai(request)

@app.post("/PersonalizeNotes/")
async def Text_Personalization(request:InputModel):
    return await Personalization(request)

@app.get("/get_allLessons")
async def send_lessons(curriculum: str = Query(..., description="Enter The curriculum to Generate the lessons")):
    lesson_data = LessonData()
    await lesson_data.get_Lessons(curriculum)
    return StreamingResponse(await lesson_data.get_lesson_details(), media_type="application/json")


def extract_json(response: str) -> str:
    
    match = re.search(r'\{.*\}', response, re.DOTALL)  # Match anything between the first and last curly braces
    if match:
        json_str = match.group(0)  # Extract the matched JSON string
        return json_str.strip()  # Remove leading/trailing spaces
    else:
        raise ValueError("No valid JSON found in the response.")

if __name__ == "__main__":
    port = int("7000")
    uvicorn.run(app, host="0.0.0.0", port=port)