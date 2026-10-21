import os
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from sample_data import SAMPLE_REPORTS, MITRE_ENTERPRISE_TACTICS
from gemini_service import analyze_threat_text, chat_with_copilot, call_gemini_api

load_dotenv()

app = FastAPI(
    title="AI-Based Cyber Threat Intelligence Knowledge Platform",
    description="Automated CTI Extraction, MITRE ATT&CK Mapping, Knowledge Graph & Defense Generation powered by Gemini",
    version="1.0.0"
)

# Enable CORS for local Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str
    title: Optional[str] = "Threat Advisory"
    api_key: Optional[str] = None
    model: Optional[str] = "gemini-2.5-flash"

class CopilotRequest(BaseModel):
    query: str
    context_threat: Dict[str, Any]
    chat_history: Optional[List[Dict[str, str]]] = []
    api_key: Optional[str] = None
    model: Optional[str] = "gemini-2.5-flash"

class KeyTestRequest(BaseModel):
    api_key: str
    model: Optional[str] = "gemini-2.5-flash"

class CustomDefenseRequest(BaseModel):
    threat_actor: str
    technique: str
    rule_type: str # 'sigma' or 'yara' or 'snort'
    api_key: Optional[str] = None

@app.get("/api/health")
def health_check():
    has_env_key = bool(os.environ.get("GEMINI_API_KEY", "").strip())
    return {
        "status": "healthy",
        "service": "AI Threat Intelligence Knowledge Engine",
        "has_env_gemini_key": has_env_key,
        "default_model": "gemini-2.5-flash"
    }

@app.get("/api/sample-reports")
def get_sample_reports():
    return {"reports": SAMPLE_REPORTS}

@app.get("/api/mitre-matrix")
def get_mitre_matrix():
    return {"tactics": MITRE_ENTERPRISE_TACTICS}

@app.post("/api/analyze")
async def analyze_threat(payload: AnalyzeRequest):
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Threat report text cannot be empty.")
    
    result = await analyze_threat_text(
        text=payload.text,
        api_key=payload.api_key,
        model=payload.model or "gemini-2.5-flash"
    )
    return result

@app.post("/api/upload-pdf")
async def upload_pdf_report(
    file: UploadFile = File(...),
    api_key: Optional[str] = Form(None),
    model: Optional[str] = Form("gemini-2.5-flash")
):
    try:
        content_bytes = await file.read()
        extracted_text = ""
        filename = file.filename or "uploaded_report.pdf"
        
        if filename.lower().endswith(".pdf"):
            import io
            from pypdf import PdfReader
            pdf_file = io.BytesIO(content_bytes)
            reader = PdfReader(pdf_file)
            for page_num, page in enumerate(reader.pages):
                page_text = page.extract_text() or ""
                extracted_text += f"\n--- Page {page_num + 1} ---\n" + page_text
        else:
            extracted_text = content_bytes.decode("utf-8", errors="ignore")
            
        if not extracted_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract readable text from uploaded file.")

        result = await analyze_threat_text(
            text=extracted_text,
            api_key=api_key,
            model=model or "gemini-2.5-flash"
        )
        result["filename"] = filename
        result["extracted_char_count"] = len(extracted_text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process file: {str(e)}")

@app.post("/api/copilot")
async def copilot_chat(payload: CopilotRequest):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty.")
    
    reply = await chat_with_copilot(
        context_threat=payload.context_threat,
        query=payload.query,
        chat_history=payload.chat_history or [],
        api_key=payload.api_key,
        model=payload.model or "gemini-2.5-flash"
    )
    return {"reply": reply}

@app.post("/api/test-key")
async def test_key(payload: KeyTestRequest):
    if not payload.api_key.strip():
        raise HTTPException(status_code=400, detail="API Key cannot be empty.")
    try:
        test_prompt = "Respond with JSON: {\"status\": \"ok\", \"verified\": true}"
        resp = await call_gemini_api(payload.api_key, payload.model or "gemini-2.5-flash", test_prompt)
        return {"success": True, "message": "Gemini API Key verified successfully!", "raw": resp}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
