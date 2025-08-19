import os
import sys
from dotenv import load_dotenv
from openai import OpenAI

# ---------------------------
# Setup: load API key from .env
# ---------------------------
load_dotenv()
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    raise SystemExit("OPENAI_API_KEY not set. Create a .env file with OPENAI_API_KEY=sk-...")

# initialize OpenAI client
client = OpenAI(api_key=API_KEY)

# ---------------------------
# Configuration (keep your IDs)
# ---------------------------
INTRO_MODEL_ID = "gpt-4o-mini"
SOLUTION_MODEL_ID = "gpt-4o-mini"
IMPACT_MODEL_ID = "gpt-4o-mini"

# Public fallback model
FALLBACK_MODEL = "gpt-4o-mini"

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
- Tekrowe’s approach, strategy, and implementation steps.
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

    print("🔹 Generating Introduction...")
    intro = generate_intro(context_text)

    print("🛠 Generating Solution...")
    solution = generate_solution(context_text)

    print("📈 Generating Impact & Our Values...")
    impact_values = generate_impact_values(context_text)

    final = f"""
🔹 **Case Study: {client_name}**

📌 **Introduction**
{intro}

🛠️ **Solution**
{solution}

📈 **Impact & Our Values**
{impact_values}
"""
    return final.strip()

# ---------------------------
# Helper for multi-line input
# ---------------------------
def get_multiline_input(prompt):
    print(prompt)
    lines = []
    empty_count = 0
    while True:
        try:
            line = input()
        except EOFError:
            break

        if line.strip() == "":
            empty_count += 1
            if empty_count >= 2:
                break
        else:
            empty_count = 0
            lines.append(line)

    return "\n".join(lines).strip()

# ---------------------------
# Entry point
# ---------------------------
if __name__ == "__main__":
    if len(sys.argv) >= 3:
        client_name = sys.argv[1].strip()
        project_details = " ".join(sys.argv[2:]).strip()
    elif len(sys.argv) == 2:
        raw = sys.argv[1].strip()
        if " - " in raw:
            parts = raw.split(" - ", 1)
        elif "—" in raw:
            parts = raw.split("—", 1)
        elif ":" in raw:
            parts = raw.split(":", 1)
        elif "\n" in raw:
            parts = raw.split("\n", 1)
        else:
            first_line = raw.split("\n", 1)[0]
            parts = [first_line, raw]
        client_name = parts[0].strip()
        project_details = parts[1].strip() if len(parts) > 1 else raw
    else:
        client_name = input("Enter client name: ").strip()
        project_details = get_multiline_input("Enter project details (press Enter twice to finish):")

    try:
        cs = generate_case_study(client_name, project_details)
        print("\n✅ CASE STUDY GENERATED:\n")
        print(cs)
    except Exception as exc:
        print("❌ Error generating case study:", exc)
