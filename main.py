from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import random

# ------------------ GLOBALS ------------------

chat_memory: List[str] = []

CRISIS_WORDS = [
    "suicide", "kill myself", "end my life",
    "want to die", "hopeless", "no reason to live"
]

# ------------------ APP ------------------

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

sentiment_model = pipeline("sentiment-analysis")

# ------------------ MODELS ------------------

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    tips: Optional[str] = None
    emotion: Optional[str] = None

# ------------------ LOGIC ------------------

def generate_response(emotion: str, message: str, memory: List[str]):
    message = message.lower()

    trigger_words = [
        "stress", "anxious", "sad", "lonely",
        "overwhelmed", "panic", "tired"
    ]

    suggest_music = (
        emotion == "NEGATIVE"
        or any(word in message for word in trigger_words)
    )

    music_options = ["Lo-fi beats", "Soft piano", "Rain sounds"]

    if emotion == "NEGATIVE":
        replies = [
            "I’m really sorry you’re feeling this way 💙",
            "That sounds heavy. I’m here with you.",
            "You don’t have to go through this alone."
        ]
        tips = "Try slowing your breathing and grounding yourself."

    elif emotion == "POSITIVE":
        replies = [
            "I’m glad you shared that with me 😊",
            "That’s good to hear. Take your time."
        ]
        tips = "Let’s continue at your pace."

    else:
        replies = [
            "I’m listening. Tell me more.",
            "Go on — I’m here."
        ]
        tips = "There’s no rush."

    if suggest_music:
        tips += f" 🎵 You may try: {random.choice(music_options)}"

    return random.choice(replies), tips

# ------------------ ROUTES ------------------

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    global chat_memory

    user_message = req.message.lower()
    chat_memory.append(req.message)

    # 🚨 CRISIS CHECK (FIRST)
    if any(word in user_message for word in CRISIS_WORDS):
        return ChatResponse(
            response=(
                "I’m really glad you told me this. You’re not alone 💙\n\n"
                "If you can, please reach out to someone you trust "
                "or a mental health professional right now.\n\n"
                "🇮🇳 India: AASRA 24x7 Helpline – 91-9820466726\n"
                "If you're elsewhere, I can help find local support."
            ),
            emotion="CRISIS"
        )

    # Sentiment analysis
    result = sentiment_model(req.message)[0]
    emotion = result["label"]

    reply, tips = generate_response(emotion, req.message, chat_memory)

    return ChatResponse(
        response=reply,
        tips=tips,
        emotion=emotion
    )

@app.post("/reset")
def reset_chat():
    global chat_memory
    chat_memory.clear()
    return {"status": "cleared"}
