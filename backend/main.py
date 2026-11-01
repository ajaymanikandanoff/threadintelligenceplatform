import os
from fastapi import FastAPI, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv

from sample_data import SAMPLE_REPORTS, MITRE_ENTERPRISE_TACTICS
from gemini_service import analyze_threat_text, chat_with_copilot, call_gemini_api
import auth_service
import ip_intelligence_service
import domain_intelligence_service
import url_analysis_service
import pdf_research_service
import threat_correlation_service
import threat_graph_service

load_dotenv()

app = FastAPI(
    title="AI-Based Cyber Threat Intelligence Knowledge Platform",
    description="Automated CTI Extraction, MITRE ATT&CK Mapping, Knowledge Graph & Defense Generation powered by Gemini",
    version="1.0.0"
)

# Enable CORS for local dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
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

# --- SCAN & RESEARCH REQUEST MODELS ---
class ScanIpPayload(BaseModel):
    ip: str
    user_email: Optional[str] = "analyst@threatlens.io"

class ScanDomainPayload(BaseModel):
    domain: str
    user_email: Optional[str] = "analyst@threatlens.io"

class ScanUrlPayload(BaseModel):
    url: str
    user_email: Optional[str] = "analyst@threatlens.io"

# --- AUTH REQUEST MODELS ---
class RegisterPayload(BaseModel):
    fullName: Optional[str] = None
    name: Optional[str] = None
    email: str
    password: str

class LoginPayload(BaseModel):
    email: str
    password: str

class GoogleAuthPayload(BaseModel):
    email: str
    name: Optional[str] = None
    picture: Optional[str] = None

class GitHubAuthPayload(BaseModel):
    email: str
    name: Optional[str] = None
    username: Optional[str] = None
    picture: Optional[str] = None

class ProfileUpdatePayload(BaseModel):
    email: str
    name: Optional[str] = None
    phone: Optional[str] = None
    occupation: Optional[str] = None
    picture_url: Optional[str] = None

class ForgotOtpPayload(BaseModel):
    email: str

class ResetOtpPayload(BaseModel):
    email: str
    otp: str
    newPassword: Optional[str] = None
    new_password: Optional[str] = None

class ChangePasswordPayload(BaseModel):
    email: str
    currentPassword: str
    newPassword: str

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
        # Max file size limit: 15MB
        if len(content_bytes) > 15 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum supported upload size is 15MB.")

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
    except HTTPException:
        raise
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

# ==========================================
# AUTHENTICATION ENDPOINTS (matching AI FactChecker)
# ==========================================

@app.post("/api/auth/register")
def register(payload: RegisterPayload):
    display_name = payload.fullName or payload.name or ""
    res = auth_service.register_user(name=display_name, email=payload.email, password=payload.password)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Registration failed"))
    return res

@app.post("/api/auth/login")
def login(payload: LoginPayload):
    res = auth_service.login_user(email=payload.email, password=payload.password)
    if not res.get("success"):
        raise HTTPException(status_code=401, detail=res.get("error", "Authentication failed"))
    return res

@app.post("/api/auth/google")
def google_auth(payload: GoogleAuthPayload):
    res = auth_service.google_login(email=payload.email, name=payload.name, picture=payload.picture)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Google auth failed"))
    return res

@app.post("/api/auth/github")
def github_auth(payload: GitHubAuthPayload):
    res = auth_service.github_login(
        email=payload.email,
        name=payload.name,
        username=payload.username,
        picture=payload.picture
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "GitHub auth failed"))
    return res

@app.get("/api/auth/profile")
def get_user_profile(email: str):
    res = auth_service.get_profile(email=email)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("error", "User not found"))
    return res

@app.post("/api/auth/profile")
def update_user_profile(payload: ProfileUpdatePayload):
    res = auth_service.update_profile(
        email=payload.email,
        name=payload.name,
        phone=payload.phone,
        occupation=payload.occupation,
        picture_url=payload.picture_url
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Profile update failed"))
    return res

@app.post("/api/auth/forgot-password-otp")
def forgot_password_otp(payload: ForgotOtpPayload):
    res = auth_service.request_password_otp(email=payload.email)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to generate OTP"))
    return res

@app.post("/api/auth/reset-password-otp")
def reset_password_otp(payload: ResetOtpPayload):
    pw = payload.newPassword or payload.new_password or ""
    res = auth_service.reset_password_with_otp(email=payload.email, otp=payload.otp, new_password=pw)
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to reset password"))
    return res

@app.post("/api/auth/change-password")
def change_password(payload: ChangePasswordPayload):
    res = auth_service.change_password(
        email=payload.email,
        old_password=payload.currentPassword,
        new_password=payload.newPassword
    )
    if not res.get("success"):
        raise HTTPException(status_code=400, detail=res.get("error", "Failed to change password"))
    return res

# ==========================================
# MODULE 1-6: SCANNING, RESEARCH & UNIFIED INVESTIGATIONS
# ==========================================

@app.post("/api/scan/ip")
def scan_ip_endpoint(payload: ScanIpPayload):
    if not payload.ip or not payload.ip.strip():
        raise HTTPException(status_code=400, detail="IP address cannot be empty.")
    result = ip_intelligence_service.scan_ip_intelligence(payload.ip)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "IP scan failed."))

    # Save to persistent investigation database
    record = threat_correlation_service.save_investigation_record(
        indicator=result["indicator"],
        indicator_type="IP",
        risk_score=result["abuse_score"],
        classification=result["risk_classification"],
        severity=result["severity"],
        details=result,
        user_email=payload.user_email
    )
    graph = threat_graph_service.build_graph_for_investigation(record)
    result["investigation_id"] = record["id"]
    result["graph"] = graph
    return result

@app.post("/api/scan/domain")
def scan_domain_endpoint(payload: ScanDomainPayload):
    if not payload.domain or not payload.domain.strip():
        raise HTTPException(status_code=400, detail="Domain cannot be empty.")
    result = domain_intelligence_service.scan_domain_intelligence(payload.domain)
    if not result.get("success"):
        raise HTTPException(status_code=400, detail=result.get("error", "Domain scan failed."))

    record = threat_correlation_service.save_investigation_record(
        indicator=result["indicator"],
        indicator_type="Domain",
        risk_score=result["risk_score"],
        classification=result["classification"],
        severity=result["severity"],
        details=result,
        user_email=payload.user_email
    )
    graph = threat_graph_service.build_graph_for_investigation(record)
    result["investigation_id"] = record["id"]
    result["graph"] = graph
    return result

@app.post("/api/scan/url")
async def scan_url_endpoint(payload: ScanUrlPayload):
    if not payload.url or not payload.url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    result = await url_analysis_service.analyze_url_threat(payload.url)
    if not result.get("success"):
        status_code = 403 if result.get("is_ssrf_blocked") else 400
        raise HTTPException(status_code=status_code, detail=result.get("error", "URL analysis failed."))

    record = threat_correlation_service.save_investigation_record(
        indicator=result["indicator"],
        indicator_type="URL",
        risk_score=result["risk_score"],
        classification=result["classification"],
        severity=result["severity"],
        details=result,
        user_email=payload.user_email
    )
    graph = threat_graph_service.build_graph_for_investigation(record)
    result["investigation_id"] = record["id"]
    result["graph"] = graph
    return result

@app.post("/api/research/pdf")
async def research_pdf_endpoint(
    file: UploadFile = File(...),
    user_email: Optional[str] = Form("analyst@threatlens.io")
):
    try:
        content_bytes = await file.read()
        if len(content_bytes) > 25 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum supported upload size is 25MB.")

        result = pdf_research_service.process_pdf_threat_report(content_bytes, file.filename or "uploaded_threat_report.pdf")
        if not result.get("success"):
            raise HTTPException(status_code=400, detail=result.get("error", "PDF processing failed."))

        record = threat_correlation_service.save_investigation_record(
            indicator=result["filename"],
            indicator_type="PDF",
            risk_score=result["risk_score"],
            classification=result["classification"],
            severity=result["severity"],
            details=result,
            user_email=user_email
        )
        graph = threat_graph_service.build_graph_for_investigation(record)
        result["investigation_id"] = record["id"]
        result["graph"] = graph
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process PDF report: {str(e)}")

@app.get("/api/investigations")
def list_investigations_endpoint(
    query: Optional[str] = None,
    type: Optional[str] = None,
    severity: Optional[str] = None,
    limit: int = 50
):
    items = threat_correlation_service.get_all_investigations(query=query, ioc_type=type, severity=severity, limit=limit)
    return {"investigations": items, "count": len(items)}

@app.get("/api/investigations/{inv_id}")
def get_investigation_detail_endpoint(inv_id: str):
    item = threat_correlation_service.get_investigation_by_id(inv_id)
    if not item:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    item["graph"] = threat_graph_service.build_graph_for_investigation(item)
    return item

@app.delete("/api/investigations/{inv_id}")
def delete_investigation_endpoint(inv_id: str):
    success = threat_correlation_service.delete_investigation(inv_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    return {"success": True, "message": "Investigation record removed."}

@app.get("/api/graph/investigation/{inv_id}")
def get_investigation_graph_endpoint(inv_id: str):
    item = threat_correlation_service.get_investigation_by_id(inv_id)
    if not item:
        raise HTTPException(status_code=404, detail="Investigation record not found.")
    return threat_graph_service.build_graph_for_investigation(item)

@app.get("/api/graph/global")
def get_global_threat_graph_endpoint(limit: int = 25):
    items = threat_correlation_service.get_all_investigations(limit=limit)
    nodes = []
    edges = []
    seen_n = set()
    seen_e = set()
    for item in items:
        subg = threat_graph_service.build_graph_for_investigation(item)
        for n in subg.get("nodes", []):
            if n["id"] not in seen_n:
                seen_n.add(n["id"])
                nodes.append(n)
        for e in subg.get("edges", []):
            if e["id"] not in seen_e:
                seen_e.add(e["id"])
                edges.append(e)
    return {"nodes": nodes, "edges": edges, "summary": {"total_nodes": len(nodes), "total_edges": len(edges)}}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
