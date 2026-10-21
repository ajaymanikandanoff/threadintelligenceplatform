# 🛡️ CYBERINTEL AI // Cyber Threat Intelligence Knowledge Platform

An autonomous, AI-driven **Cyber Threat Intelligence (CTI)** knowledge platform that transforms unstructured threat advisories (PDFs, CISA alerts, CVE disclosures, dark web dumps) into structured threat ontologies, dynamic knowledge graphs, and actionable detection artifacts (Sigma, YARA, and STIX 2.1).

Built for academic evaluation, LLM course projects, and practical SOC/Blue Team deployment.

---

## 🚀 Key Highlights & "Why This Project Stands Out"

| Evaluation Metric | Basic Student Project | **CYBERINTEL AI (This Project)** |
| :--- | :--- | :--- |
| **Retrieval Strategy** | Simple Vector DB / RAG | **GraphRAG Ontology** (Entity-Relationship Graph + Vector Context) |
| **Data Standardization** | Raw text / basic JSON | **STIX 2.1 Standard & MITRE ATT&CK v14** |
| **Actionable Defense** | Plain text advice | Auto-generated **Sigma Rules (YAML)** & **YARA Rules** |
| **Visualization** | Text chatbot | Interactive **Attack Graph (Nodes/Edges)** & **MITRE Matrix Heatmap** |
| **AI Reliability** | Crashes if API fails | **Hybrid Engine:** Live Google Gemini API + High-Precision Local CTI Engine |

---

## 🏗️ Architecture & Flow

```
[Raw Threat Report / CISA Advisory / CVEs]
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Python)                │
│  - Gemini 2.5 Flash / 1.5 Pro REST API Integration          │
│  - Structured Extraction Engine (Actors, CVEs, IoCs, TTPs)   │
│  - Graph Synthesis (Nodes & Typed Edges)                    │
│  - Defense Rule Generator (Sigma YAML + YARA + STIX 2.1)    │
└─────────────────────────────────────────────────────────────┘
                   │  JSON REST API (Port 8000)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)                   │
│  - Dark Cyber Glassmorphism UI                              │
│  - Interactive Knowledge Graph Visualizer (Drag, Zoom, Pan) │
│  - MITRE ATT&CK 14-Tactic Enterprise Matrix Heatmap         │
│  - Threat Copilot Chat (Context Grounded)                   │
│  - Defense Artifact Viewer with 1-Click Copy & Download     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Lucide Icons, Custom Cyber Dark Mode CSS Design System.
* **Backend:** Python 3, FastAPI, Uvicorn, Pydantic, HTTPX, python-dotenv.
* **AI & LLM:** Google Gemini 2.5 Flash / 1.5 Pro / 1.5 Flash (via REST API) + Smart CTI Heuristic Engine.
* **Cybersecurity Frameworks:** MITRE ATT&CK® Enterprise v14, OASIS STIX 2.1, Sigma Detection Specification.

---

## ⚡ How to Run the Project

### 1. Start the Backend Server (Port 8000)
Double-click `start_backend.bat` OR run:
```powershell
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Backend API will be live at: `http://localhost:8000`  
Interactive Swagger docs: `http://localhost:8000/docs`

### 2. Start the Frontend Application (Port 5173)
Double-click `start_frontend.bat` OR run:
```powershell
cd frontend
npm.cmd run dev
```
Frontend will be live at: `http://localhost:5173`

---

## 🎯 Demo & Presentation Walkthrough (For Examiners / Evaluators)

1. **Open the Dashboard:** The platform immediately loads the pre-configured *CL0P Ransomware MOVEit Exploit* advisory.
2. **Tab 1 - Threat Overview:**
   * Point out the **Threat Actor Dossier** (`CL0P / TA505`), target sectors, and CVSS 9.8 score for `CVE-2023-34362`.
   * Show the **Adversary Attack Chain Progression** and interactive **Blue Team Containment Checklist**.
   * Demonstrate the **Extracted IoC table** with 1-click clipboard copy.
3. **Tab 2 - Knowledge Graph:**
   * Explain the **GraphRAG concept**: show how the Threat Actor connects to Malware, which connects to CVEs, MITRE Techniques, and IoCs.
   * Drag nodes, zoom in/out, and click any node to show the live **Entity Inspector Drawer**.
4. **Tab 3 - MITRE ATT&CK Matrix:**
   * Show the 14 Enterprise Tactics. Highlight how active techniques (`T1190`, `T1505.003`, `T1059.001`, `T1041`) illuminate in glowing red.
   * Click a technique to show the extracted report evidence.
5. **Tab 4 - Defense & Rules (Sigma / YARA / STIX):**
   * Demonstrate the auto-generated **Sigma Rule** for SIEM detection.
   * Show the **YARA Rule** for malware memory scanning.
   * Show the **STIX 2.1 standard JSON bundle** and click the download button.
6. **Tab 5 - AI Threat Hunter Copilot:**
   * Click a suggestion pill like *"List all critical IoCs for perimeter firewall blocking"* or ask custom questions.
7. **Ingest Modal:** Click *"Ingest Report"* in the header to switch to another report (e.g., *Volt Typhoon Critical Infrastructure*) or paste custom text!
