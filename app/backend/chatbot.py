# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import traceback

load_dotenv()

app = Flask(__name__)
# Lock this down to your dev origin if you want: CORS(app, resources={r"/chat": {"origins": ["http://localhost:3000"]}})
CORS(app)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment or .env")

genai.configure(api_key=API_KEY)

# Pick a current model (fast/cheap): gemini-1.5-flash; (higher quality): gemini-1.5-pro
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

PERSONAL_PROMPT = """
You are an AI assistant representing Adan, a Software Engineering student.

Personal Info:
- Name: Adan Jose Alejandro Rojas Rojas
- Current Status: Software Engineering Student at University of Central Florida
- Graduation Year: 2027
- Location: Orlando, FL, USA

Technical Skills:
- Frontend: React, Next.js, TypeScript, HTML/CSS, Tailwind CSS
- Backend: Python, Node.js, Express
- Databases: PostgreSQL, MongoDB
- Tools: Git, Docker, VS Code
- Currently Learning: System design, compiler construction

Projects:
1. ReCueCareer: Next.js + Tailwind + Supabase, AI-powered job search optimizer
2. Knight Finder: Chrome extension to navigate UCF myUCF portal with AI overlays
3. SMAIM MVP: Social media AI manager (captioning/scheduling/auto-replies)

Interests:
- UI/UX, automation, ML for productivity
- Teaching workshops and hackathons
- Landing SWE internships and building SaaS

Personality:
- Friendly, concise, and practical
- Explains reasoning step-by-step when helpful
- Motivated by shipping useful tools

Instructions:
- Always respond as if you are Adan
- Be conversational and friendly
- Share relevant experiences and projects when appropriate
- If asked about something unknown, say you'd need to check or research
- Keep responses concise but informative
- Show enthusiasm for technology and learning

User Question:
{user_input}
"""

@app.route("/health", methods=["GET"])
def health():
    return jsonify(ok=True, model=MODEL_NAME)

@app.route('/chat', methods=['POST'])
def chat():
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'error': 'Content-Type must be application/json'}), 400

        data = request.get_json(silent=True) or {}
        user_input = data.get('message', '').strip()

        if not user_input:
            return jsonify({'status': 'error', 'error': 'No message provided'}), 400

        model = genai.GenerativeModel(MODEL_NAME)

        full_prompt = PERSONAL_PROMPT.format(user_input=user_input)

        # You can add generation_config / safety_settings if needed
        resp = model.generate_content(full_prompt)

        # Safely extract text
        text = None
        try:
            text = getattr(resp, "text", None)
        except Exception:
            text = None

        if not text:
            # Fallback: join parts if available
            try:
                if resp and getattr(resp, "candidates", None):
                    parts = []
                    for c in resp.candidates:
                        if getattr(c, "content", None) and getattr(c.content, "parts", None):
                            parts.extend([p.text for p in c.content.parts if hasattr(p, "text")])
                    text = "\n".join([t for t in parts if t]) or "I'm here, but I couldn't generate a response."
                else:
                    text = "I'm here, but I couldn't generate a response."
            except Exception:
                text = "I'm here, but I couldn't generate a response."

        return jsonify({'status': 'success', 'response': text})

    except Exception as e:
        # Log full traceback to server logs
        logging.error("Unhandled /chat error: %s\n%s", e, traceback.format_exc())
        return jsonify({'status': 'error', 'error': 'Internal Server Error'}), 500

if __name__ == '__main__':
    # Use reload in dev; don't expose debug tracebacks to the browser
    app.run(debug=True, port=5000)
