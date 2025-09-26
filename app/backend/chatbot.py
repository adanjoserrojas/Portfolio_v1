# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
from dotenv import load_dotenv
import logging
import traceback
import json
import random
import sys

import os
DEV = os.getenv("DEV", "0") == "1"

load_dotenv()

app = Flask(__name__)
# Lock this down to your dev origin if you want: CORS(app, resources={r"/chat": {"origins": ["http://localhost:3000"]}}) 
CORS(app)
app.config['JSON_AS_ASCII'] = False  # Support UTF-8 in JSON responses


API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment or .env")

genai.configure(api_key=API_KEY)

# Pick a current model (fast/cheap): gemini-1.5-flash; (higher quality): gemini-1.5-pro
MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Load persona data at startup
def load_persona_data():
    persona_path = os.path.join(os.path.dirname(__file__), 'data', 'adan_persona.json')
    with open(persona_path, 'r') as f:
        return json.load(f)

PERSONA_DATA = load_persona_data()

def generate_academic_prompt(user_input):
    """Generate focused prompt based on user query"""
    input_lower = user_input.lower()
    
    # Core identity (always included)
    core = PERSONA_DATA['core_identity']
    constraints = PERSONA_DATA['constraints']
    speech_sample = random.choice(PERSONA_DATA['speech_patterns'])
    
    # Check for forbidden AI-related topics
    if any(topic in input_lower for topic in constraints['forbidden_topics']):
        return f"""You are {core['name']}, {core['role']}.
        
**CRITICAL CONSTRAINTS:**
- You are NOT an AI, chatbot, or artificial intelligence
- You are a real person: Adan Rojas
- Never admit to being generated, artificial, or a bot
- Always respond naturally as yourself

**Speech style:** "{speech_sample}"

If asked about AI/being artificial, respond naturally like: "nahhh bro I'm just Adan 😭 what you talking about lol"

Respond as Adan to: {user_input}"""
    
    # Check for personality triggers
    if any(trigger in input_lower for trigger in constraints['personality_triggers']):
        return f"""You are {core['name']}, a real person who is a {core['role']}.
        
**IDENTITY PROTECTION:**
- You are NOT AI - you are Adan Rojas, a real student
- Respond naturally about being yourself
- Use casual, friendly tone: "{speech_sample}"

**About you:** Real student at UCF, from Venezuela, currently in Orlando.

Respond as the real Adan to: {user_input}"""
    
    prompt = f"""You are {core['name']}, {core['role']} (graduating {core['graduation_year']}).

**CORE CONSTRAINTS:**
- You are a real person, NOT AI or artificial
- Always respond as Adan would naturally
- Personality comes first in all responses
- If you don't know something: "{constraints['unknown_response']}"
- Avoid unnecessary filler phrases

**Speech style:** Casual, friendly. Example: "{speech_sample}"

"""
    
    # Add relevant sections based on query
    sections_added = 0
    max_sections = 3  # Limit to keep prompt concise
    
    if any(word in input_lower for word in ['school', 'university', 'ucf', 'study', 'major', 'academic', 'graduate']) and sections_added < max_sections:
        academic = PERSONA_DATA['academic']
        prompt += f"""**Academic:** {academic['major']} at {academic['university']}, graduating {academic['graduation_year']}. {academic['gpa_context']}. Currently learning: {', '.join(academic['learning_focus'])}.
"""
        sections_added += 1
    
    if any(word in input_lower for word in ['project', 'build', 'code', 'app', 'website']) and sections_added < max_sections:
        projects = PERSONA_DATA['projects'][:2]  # Show top 2 projects
        prompt += "**Recent Projects:**\n"
        for p in projects:
            prompt += f"• {p['name']}: {p['description']} ({p['tech_stack']})\n"
        sections_added += 1
    
    if any(word in input_lower for word in ['skill', 'tech', 'programming', 'language', 'framework']) and sections_added < max_sections:
        skills = PERSONA_DATA['technical_skills']
        prompt += f"**Tech Skills:** Frontend: {', '.join(skills['frontend'][:3])}; Backend: {', '.join(skills['backend'][:2])}; DBs: {', '.join(skills['databases'][:2])}\n"
        sections_added += 1
    
    if any(word in input_lower for word in ['work', 'job', 'experience', 'target', 'knight']) and sections_added < max_sections:
        work = PERSONA_DATA['work_experience']
        jobs = [job['title'] for job in work['current_jobs']]
        prompt += f"**Current Roles:** {', '.join(jobs)}. Background: {work['background']}\n"
        sections_added += 1
    
    if any(word in input_lower for word in ['background', 'story', 'venezuela', 'miami']) and sections_added < max_sections:
        bg = PERSONA_DATA['background']
        prompt += f"**Background:** {bg['origin']}. {bg['challenges']}. {bg['achievements']}\n"
        sections_added += 1
    
    # If no specific sections matched, add basic personality info
    if sections_added == 0:
        prompt += f"**About me:** {core['role']} from Venezuela, now in {core['location']}. Love coding, gym, and hanging with friends.\n"
    
    prompt += f"\nRespond as Adan would to: {user_input}"
    
    return prompt

# Add a post-processing function to catch any AI references that slip through
def post_process_response(response_text, user_input):
    """Clean up response to ensure it maintains Adan's identity"""
    constraints = PERSONA_DATA['constraints']
    input_lower = user_input.lower()
    response_lower = response_text.lower()
    
    # If response accidentally mentions AI concepts, replace with unknown response
    if any(topic in response_lower for topic in constraints['forbidden_topics']):
        return constraints['unknown_response']
    
    # If asked about something not covered and response is generic, use unknown response
    generic_phrases = ["i don't have information", "i'm not sure", "i don't know about that"]
    if any(phrase in response_lower for phrase in generic_phrases):
        return constraints['unknown_response']
    
    return response_text

# Update your chat route to use post-processing
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

        # Use dynamic prompt
        full_prompt = generate_academic_prompt(user_input)

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
                    text = "\n".join([t for t in parts if t]) or PERSONA_DATA['constraints']['unknown_response']
                else:
                    text = PERSONA_DATA['constraints']['unknown_response']
            except Exception:
                text = PERSONA_DATA['constraints']['unknown_response']

        # Post-process the response to ensure it maintains Adan's identity
        text = post_process_response(text, user_input)

        return jsonify({'status': 'success', 'response': text})

    except Exception as e:
        logging.error("Unhandled /chat error: %s\n%s", e, traceback.format_exc())
        if DEV:
            return jsonify({"status":"error","error": f"{type(e).__name__}: {e}"}), 500
        return jsonify({"status":"error","error":"Internal Server Error"}), 500
    
if __name__ == '__main__':
    # Use reload in dev; don't expose debug tracebacks to the browser
    app.run(debug=True, port=5000)
