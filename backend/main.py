from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Tekrowe Case Study Generator API",
    description="API for generating professional B2B case studies using OpenAI",
    version="1.0.0"
)

# CORS configuration from environment variables
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://localhost:5173"
).split(",")

# Add CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------
# Setup: load API key from .env
# ---------------------------
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise SystemExit("OPENAI_API_KEY not set. Create a .env file with OPENAI_API_KEY=sk-...")

# initialize OpenAI client
client = OpenAI(api_key=API_KEY)

# ---------------------------
# Configuration (keep your IDs)
# ---------------------------
INTRO_MODEL_ID = os.getenv("INTRO_MODEL_ID", "gpt-4o-mini")
SOLUTION_MODEL_ID = os.getenv("SOLUTION_MODEL_ID", "gpt-4o-mini")
IMPACT_MODEL_ID = os.getenv("IMPACT_MODEL_ID", "gpt-4o-mini")

# Public fallback model
FALLBACK_MODEL = os.getenv("FALLBACK_MODEL", "gpt-4o-mini")

# ---------------------------
# Pydantic Models
# ---------------------------
class CaseStudyRequest(BaseModel):
    client_name: str
    project_details: str

class CaseStudyResponse(BaseModel):
    client_name: str
    introduction: str
    solution: str
    impact_values: str
    full_case_study: str

class HealthResponse(BaseModel):
    status: str
    message: str
    openai_configured: bool
    environment: str

# ---------------------------
# Helper: call API with fallback
# ---------------------------
def call_openai_with_fallback(prompt, model_id, system="You are an expert case study writer for Tekrowe."):
    try:
        resp = client.chat.completions.create(
            model=model_id,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        return resp.choices[0].message.content.strip()
    except Exception as e:
        err_text = str(e).lower()
        if ("model" in err_text and ("not found" in err_text or "does not exist" in err_text)) or "model_not_found" in err_text:
            if model_id != FALLBACK_MODEL:
                print(f"[WARN] model '{model_id}' unavailable to API key — falling back to '{FALLBACK_MODEL}'.")
                resp = client.chat.completions.create(
                    model=FALLBACK_MODEL,
                    messages=[
                        {"role": "system", "content": system},
                        {"role": "user", "content": prompt}
                    ],
                    temperature=0.7,
                    max_tokens=1000,
                )
                return resp.choices[0].message.content.strip()
        raise

# ---------------------------
# Section generators
# ---------------------------
def generate_intro(context_text):
    system_instructions = """
You are an expert B2B case study writer for Tekrowe.
Follow the exact Tekrowe tone — concise, professional, results-driven.
Format output in short sections and bullet points where possible.
Only write for Tekrowe projects.

Output exactly:
1. **Summary** — Max 4 lines (short sentences or bullets).
2. **About the Client** — 2-4 lines introducing the client (industry, scale, relevance).
3. **Challenge** — 3-5 bullets highlighting the main problems before Tekrowe's intervention.
Do not add any other sections or headings.
"""
    user_prompt = f"""
Background/Context:
{context_text}

Now output ONLY:
Summary (max 4 lines)
About the Client (2-4 lines)
Challenge (3-5 bullet points)
"""
    return call_openai_with_fallback(user_prompt, model_id=INTRO_MODEL_ID, system=system_instructions)

def generate_solution(context_text):
    system_instructions = """
You are an expert case study writer for Tekrowe.
Write a concise 'Solution' section describing:
- Tekrowe's approach, strategy, and implementation steps.
- Key technologies, frameworks, and tools used.
- Methodologies or best practices applied.
Use 2-3 short paragraphs or bullets.
Do not repeat the challenge — focus only on the solution delivery.
"""
    user_prompt = f"""
Background/Context:
{context_text}

Now output ONLY:
Solution (concise, structured, with sub-points or bullets where helpful)
"""
    return call_openai_with_fallback(user_prompt, model_id=SOLUTION_MODEL_ID, system=system_instructions)

def generate_impact_values(context_text):
    system_instructions = """
You are an expert B2B case study writer for Tekrowe.
Write the 'Impact & Our Values' section with:
- **Business Outcomes**: 3–5 measurable improvements (bullets).
- **Client Quote**: 1 sentence (client voice, positive impact).
- **Technical/AI Implementations**: 3 bullets (if applicable).
- **Why Tekrowe**: 4 bullets highlighting differentiators.
- **Value Badges**: 3-4 short phrases separated by commas.
Keep it concise and formatted for quick reading.
"""
    user_prompt = f"""
Background/Context:
{context_text}

Now output ONLY:
Impact & Our Values
  - Business Outcomes (3–5 bullets)
  - Client Quote (1 sentence)
  - Technical/AI Implementations (3 bullets if applicable)
  - Why Tekrowe (4 bullets)
  - Value Badges (3–4 short phrases)
"""
    return call_openai_with_fallback(user_prompt, model_id=IMPACT_MODEL_ID, system=system_instructions)

# ---------------------------
# Compose full case study
# ---------------------------
def generate_case_study(client_name, project_details):
    context_text = f"Client: {client_name}\n\n{project_details}".strip()

    intro = generate_intro(context_text)
    solution = generate_solution(context_text)
    impact_values = generate_impact_values(context_text)

    full_case_study = f"""
🔹 **Case Study: {client_name}**

📌 **Introduction**
{intro}

🛠️ **Solution**
{solution}

📈 **Impact & Our Values**
{impact_values}
"""
    
    return {
        "introduction": intro,
        "solution": solution,
        "impact_values": impact_values,
        "full_case_study": full_case_study.strip()
    }

# ---------------------------
# API Endpoints
# ---------------------------
@app.get("/", response_model=HealthResponse)
async def root():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="Tekrowe Case Study Generator API is running",
        openai_configured=bool(API_KEY),
        environment=os.getenv("ENVIRONMENT", "development")
    )

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        message="API is operational",
        openai_configured=bool(API_KEY),
        environment=os.getenv("ENVIRONMENT", "development")
    )

@app.post("/generate-case-study", response_model=CaseStudyResponse)
async def create_case_study(request: CaseStudyRequest):
    """Generate a complete case study"""
    try:
        if not request.client_name.strip() or not request.project_details.strip():
            raise HTTPException(status_code=400, detail="Client name and project details are required")
        
        result = generate_case_study(request.client_name, request.project_details)
        
        return CaseStudyResponse(
            client_name=request.client_name,
            introduction=result["introduction"],
            solution=result["solution"],
            impact_values=result["impact_values"],
            full_case_study=result["full_case_study"]
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating case study: {str(e)}")

@app.post("/generate-intro")
async def create_intro(request: CaseStudyRequest):
    """Generate only the introduction section"""
    try:
        if not request.client_name.strip() or not request.project_details.strip():
            raise HTTPException(status_code=400, detail="Client name and project details are required")
        
        context_text = f"Client: {request.client_name}\n\n{request.project_details}".strip()
        intro = generate_intro(context_text)
        
        return {"introduction": intro}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating introduction: {str(e)}")

@app.post("/generate-solution")
async def create_solution(request: CaseStudyRequest):
    """Generate only the solution section"""
    try:
        if not request.client_name.strip() or not request.project_details.strip():
            raise HTTPException(status_code=400, detail="Client name and project details are required")
        
        context_text = f"Client: {request.client_name}\n\n{request.project_details}".strip()
        solution = generate_solution(context_text)
        
        return {"solution": solution}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating solution: {str(e)}")

@app.post("/generate-impact")
async def create_impact(request: CaseStudyRequest):
    """Generate only the impact and values section"""
    try:
        if not request.client_name.strip() or not request.project_details.strip():
            raise HTTPException(status_code=400, detail="Client name and project details are required")
        
        context_text = f"Client: {request.client_name}\n\n{request.project_details}".strip()
        impact_values = generate_impact_values(context_text)
        
        return {"impact_values": impact_values}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating impact: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run(app, host=host, port=port)
