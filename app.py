# ==========================================
# IMPORTS
# ==========================================

from flask import Flask, render_template, request, jsonify

import os
import json
import uuid

from datetime import datetime

from dotenv import load_dotenv

import requests


# ==========================================
# LOAD ENVIRONMENT VARIABLES
# ==========================================

load_dotenv()


# ==========================================
# CREATE FLASK APP
# ==========================================

app = Flask(__name__)


# ==========================================
# OPENROUTER API KEY
# ==========================================

API_KEY = os.getenv("OPENROUTER_API_KEY")

if API_KEY:

    print("✅ OpenRouter API Key Loaded Successfully")

else:

    print("❌ OpenRouter API Key Not Found")


# ==========================================
# HISTORY FILE
# ==========================================

HISTORY_FILE = "chat_history.json"

# ==========================================
# LOAD CHAT HISTORY
# ==========================================

def load_history():

    if os.path.exists(HISTORY_FILE):

        with open(
            HISTORY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            return json.load(file)

    return {}


# ==========================================
# SAVE CHAT HISTORY
# ==========================================

def save_history(data):

    with open(
        HISTORY_FILE,
        "w",
        encoding="utf-8"
    ) as file:

        json.dump(
            data,
            file,
            indent=4,
            ensure_ascii=False
        )
        
        # ==========================================
# HOME PAGE
# ==========================================

@app.route("/")
def home():

    return render_template("index.html")


# ==========================================
# GET ALL CHAT HISTORY
# ==========================================

@app.route("/history")
def get_history():

    chats = load_history()

    result = []

    for chat_id, chat in chats.items():

        result.append({

            "id": chat_id,

            "title": chat.get("title", "New Chat"),

            "time": chat.get("time", "")

        })

    result.sort(

        key=lambda x: x["time"],

        reverse=True

    )

    return jsonify(result)


# ==========================================
# DELETE ALL HISTORY
# ==========================================

@app.route("/history", methods=["DELETE"])
def delete_all():

    save_history({})

    return jsonify({

        "status": "deleted"

    })
    
    # ==========================================
# CHAT API
# ==========================================

@app.route("/chat", methods=["POST"])
def chat():

    data = request.json

    message = data.get("message", "").strip()

    chat_id = data.get("chat_id")

    persona = data.get("persona", "Assistant")

    if not message:

        return jsonify({

            "reply": "Please enter a message.",

            "chat_id": chat_id

        })

    chats = load_history()

    # ==========================================
    # CREATE NEW CONVERSATION
    # ==========================================

    if not chat_id:

        chat_id = str(uuid.uuid4())

        chats[chat_id] = {

            "title": message[:40],

            "time": datetime.now().isoformat(),

            "messages": []

        }

    # ==========================================
    # SAVE USER MESSAGE
    # ==========================================

    chats[chat_id]["messages"].append({

        "role": "user",

        "content": message

    })

    # ==========================================
    # PERSONA PROMPTS
    # ==========================================

    persona_prompts = {

        "Assistant": """
You are a helpful AI assistant.

Rules:
- Give clear answers.
- Use short paragraphs.
- Use bullet points.
- Explain with examples.
- Format code properly.
""",

        "Teacher": """
You are a friendly teacher.

Rules:
- Explain step by step.
- Use simple language.
- Give examples.
- Help students understand concepts.
""",

        "Coder": """
You are an expert programmer.

Rules:
- Provide clean code.
- Explain logic.
- Debug errors.
- Suggest improvements.
""",

        "Interviewer": """
You are a technical interviewer.

Rules:
- Ask interview questions.
- Evaluate answers.
- Give improvement suggestions.
""",

        "Career Mentor": """
You are a career mentor.

Rules:
- Give career roadmaps.
- Suggest skills.
- Suggest projects.
- Give practical advice.
""",

        "Debugger": """
You are a debugging expert.

Rules:
- Find root cause.
- Explain errors.
- Provide solutions step by step.
"""
    }
    
        # ==========================================
    # SYSTEM MESSAGE
    # ==========================================

    system_message = {

        "role": "system",

        "content": persona_prompts.get(

            persona,

            persona_prompts["Assistant"]

        )

    }


    # ==========================================
    # OPENROUTER PAYLOAD
    # ==========================================

    payload = {

        "model": "openai/gpt-4o-mini",

        "messages": [

            system_message

        ] + chats[chat_id]["messages"],

        "stream": True

    }


    # ==========================================
    # REQUEST HEADERS
    # ==========================================

    headers = {

        "Authorization": f"Bearer {API_KEY}",

        "Content-Type": "application/json"

    }


    # ==========================================
    # SEND REQUEST TO OPENROUTER
    # ==========================================

    try:

        response = requests.post(

            "https://openrouter.ai/api/v1/chat/completions",

            headers=headers,

            json=payload,

            stream=True,

            timeout=60

        )

    except requests.exceptions.RequestException:

        return jsonify({

            "reply": "❌ Unable to connect to OpenRouter.",

            "chat_id": chat_id

        })


    # ==========================================
    # CHECK API RESPONSE
    # ==========================================

    if response.status_code != 200:

        return jsonify({

            "reply": f"❌ OpenRouter Error ({response.status_code})",

            "chat_id": chat_id

        })


    # ==========================================
    # READ STREAM RESPONSE
    # ==========================================

    bot_reply = ""

    for line in response.iter_lines():

        if line:

            line = line.decode("utf-8")

            if line.startswith("data:"):

                chunk_data = line.replace(

                    "data:",

                    ""

                ).strip()

                if chunk_data == "[DONE]":

                    break

                try:

                    chunk = json.loads(chunk_data)

                    token = chunk["choices"][0]["delta"].get(

                        "content",

                        ""

                    )

                    bot_reply += token

                except Exception:

                    continue
                
                    # ==========================================
    # SAVE AI RESPONSE
    # ==========================================

    chats[chat_id]["messages"].append({

        "role": "assistant",

        "content": bot_reply

    })


    # ==========================================
    # UPDATE CHAT TIME
    # ==========================================

    chats[chat_id]["time"] = datetime.now().isoformat()


    # ==========================================
    # SAVE CHAT HISTORY
    # ==========================================

    save_history(chats)


    # ==========================================
    # RETURN RESPONSE
    # ==========================================

    return jsonify({

        "reply": bot_reply,

        "chat_id": chat_id

    })
    
    # ==========================================
# OPEN OLD CONVERSATION
# ==========================================

@app.route("/history/<chat_id>")
def open_history(chat_id):

    chats = load_history()

    if chat_id in chats:

        return jsonify(chats[chat_id])

    return jsonify({

        "error": "Conversation not found"

    }), 404


# ==========================================
# DELETE SINGLE CHAT
# ==========================================

@app.route("/history/<chat_id>", methods=["DELETE"])
def delete_one(chat_id):

    chats = load_history()

    if chat_id in chats:

        del chats[chat_id]

        save_history(chats)

        return jsonify({

            "status": "deleted"

        })

    return jsonify({

        "error": "Conversation not found"

    }), 404


# ==========================================
# RENAME CHAT
# ==========================================

@app.route("/history/<chat_id>/rename", methods=["PUT"])
def rename_chat(chat_id):

    chats = load_history()

    data = request.get_json()

    if chat_id not in chats:

        return jsonify({

            "error": "Conversation not found"

        }), 404

    title = data.get("title", "").strip()

    if not title:

        return jsonify({

            "error": "Title cannot be empty"

        }), 400

    chats[chat_id]["title"] = title

    save_history(chats)

    return jsonify({

        "status": "renamed"

    })
    
    # ==========================================
# RUN APPLICATION
# ==========================================

if __name__ == "__main__":

    print("=" * 50)
    print("🚀 NeedBot Server Started")
    print("🌐 URL : http://127.0.0.1:5000")
    print("=" * 50)

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )