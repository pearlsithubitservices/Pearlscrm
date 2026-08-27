import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import chat, crm, health, whatsapp
from app.core.config import get_settings


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)


settings = get_settings()


app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Python backend for the AI WhatsApp Automation feature. "
        "Talks to the existing CRM exclusively via its REST APIs."
    ),
    version="0.1.0",
)




app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)




app.include_router(health.router)

app.include_router(crm.router)

app.include_router(chat.router)
app.include_router(whatsapp.router)