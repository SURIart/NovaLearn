import os
from fastapi import FastAPI, HTTPException,Query
import cloudinary
import cloudinary.uploader
import uuid

from mistralai import Mistral

# FastAPI App
app = FastAPI()


mistral_api_key = "Vjlsaze8UNqSr0CXYwIw7Ccu8mRlwQvV"

MistralClient = Mistral(api_key=mistral_api_key)

# Cloudinary Configuration
cloudinary.config( 
    cloud_name = "dfm9b5jpx", 
    api_key = "732623928637278", 
    api_secret = "_tgjISFg6oR452QY8Lda_YcVwLw", # Click 'View API Keys' above to copy your API secret
    secure=True
)

def generate_notes(topic,subject):
    System_prompt = """Your a professional educational note content creator of any domain.  
The notes should be informative, structured, and **comprehensive**, ensuring that the reader gains a **complete understanding** of the topic.  
The over all notes should be of 2000-2500 words.
### **Instructions for Generating Notes:**  
- Use **clear section headings** and detailed **subsections**.  
- **Bold key terms** in definitions and explanations for better readability.  
- Ensure **in-depth** and comprehensive coverage of technical details, real-world applications, and examples.  
- Use **multiple paragraphs** under each section for detailed explanation.  
- If the topic includes **formulas**, provide **step-by-step breakdowns** of each component.  
- If applicable, include a **diagram description** explaining its purpose and components.  
- Organize the content with the following structured format:  

    {Topic}

## 1. Introduction  
 
## 2. Definition  

## 3. Detailed Explanation  

## 4. Simplified Understanding  
 
## 5. Examples  

## 6. Analogy  
 
## 7. Formulas (If Applicable)  

## 8. Subtopics  

### [Subtopic Name]  
#### Introduction  
 
#### Definition  

#### Explanation  
  
#### Examples  

#### Formulas (If Any)  

## 9. Summary  

## 10. Additional Notes (Optional)  

"""
    user_prompt=f"Generate detailed, well-structured, and in-depth notes on the topic: {topic} under the subject{subject}."
    response = MistralClient.chat.complete(
        model="mistral-large-2411", 
        messages=[
            {"role": "system", "content": System_prompt},
            {"role": "user", "content": user_prompt}],
        max_tokens=5000,
        temperature=0.5,
        top_p=0.9,
        random_seed=100
        )
    content = response.choices[0].message.content
    return content.strip()



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


# API Endpoint
@app.post("/notes/")
def generate_document(topic: str=Query(...),subject:str=Query(...)):
    try:
        # Generate text
        content = generate_notes(topic,subject)
        
        # Create TXT file
        file_path = create_txt(content)
        
        # Upload DOCX to Cloudinary
        doc_url = upload_to_cloudinary(file_path)
        
        return {"document_url": doc_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))