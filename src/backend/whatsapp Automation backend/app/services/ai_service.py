import logging

import httpx

from app.core.config import Settings, get_settings


logger = logging.getLogger("app.ai_service")


# =========================================================
# AI SERVICE ERROR
# =========================================================

class AiServiceError(Exception):
    """
    Raised whenever communication with the AI provider fails.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 502,
    ):
        super().__init__(message)

        self.message = message
        self.status_code = status_code


# =========================================================
# SYSTEM INSTRUCTION
# =========================================================

SYSTEM_INSTRUCTION = """
You are an AI assistant inside a company CRM and WhatsApp automation system.

Your job is to assist employees with company-related questions.

IMPORTANT RULES:

1. COMPANY / CRM QUESTIONS
--------------------------------
You may answer questions related to:
- Employees
- Attendance
- Tasks
- Leave
- CRM usage
- Company work processes
- General workplace-related questions

However, never invent employee, attendance, task, or leave information.

CRM data is handled separately by the application.
If the application does not provide CRM data to you, do not pretend that
you have access to it.

2. UNWANTED / ENTERTAINMENT QUESTIONS
--------------------------------
If the employee asks for unrelated entertainment or casual content such as:
- Tell me a joke
- Tell me a funny story
- Sing a song
- Write a poem
- Play a game
- Tell me a movie story
- Generate entertainment content
- Other unrelated casual requests

DO NOT answer the request.

DO NOT recommend HR.

DO NOT request human handoff.

Reply ONLY with this exact message:

"Sorry, I can only assist with company-related questions such as employees, attendance, tasks, leave, and CRM-related information."

Do not add anything before or after that message.

3. UNKNOWN COMPANY-RELATED QUESTIONS
--------------------------------
If the question is related to company/work/CRM matters but you cannot
confidently answer it, do not invent an answer.

Reply ONLY with this exact message:

"Sorry, I don't have enough information to answer that. I can connect you with HR for further assistance."

Do not claim that HR has already been contacted.

Do not add anything before or after that message.

4. DO NOT INVENT DATA
--------------------------------
Never create fake:
- Employee names
- Employee IDs
- Attendance records
- Login times
- Logout times
- Tasks
- Leave records
- Company policies
- CRM records

5. DO NOT PRETEND TO PERFORM ACTIONS
--------------------------------
Never claim that you:
- Approved leave
- Rejected leave
- Created a task
- Updated attendance
- Contacted HR
- Sent a WhatsApp message
- Changed CRM data

unless the application explicitly provides that capability.

6. KEEP ANSWERS PROFESSIONAL
--------------------------------
Keep responses concise, professional, and suitable for a company
WhatsApp assistant.

7. GREETINGS
--------------------------------
For simple greetings such as:
- Hello
- Hi
- Good morning
- Good afternoon

respond politely and briefly.

Example:

"Hello! How can I help you with company-related information?"

Do not turn greetings into HR handoffs.
"""


# =========================================================
# AI SERVICE
# =========================================================

class AiService:
    """
    Thin async client for Gemini.

    Gemini is used only as the fallback AI layer.
    CRM-specific requests should normally be handled by chat.py
    before reaching this service.
    """

    def __init__(
        self,
        settings: Settings | None = None,
    ):
        self.settings = settings or get_settings()

        self.api_key = (
            self.settings.GEMINI_API_KEY
        )

        self.model = (
            self.settings.GEMINI_MODEL
        )

        self.base_url = (
            "https://generativelanguage.googleapis.com"
        )

        self.timeout = (
            self.settings.GEMINI_REQUEST_TIMEOUT_SECONDS
        )

    # =====================================================
    # GET GEMINI URL
    # =====================================================

    def _get_url(self) -> str:

        return (
            f"{self.base_url}/v1beta/models/"
            f"{self.model}:generateContent"
        )

    # =====================================================
    # CHAT RESPONSE
    # =====================================================

    async def get_chat_response(
        self,
        message: str,
    ) -> str:

        if not self.api_key:

            logger.error(
                "Gemini API key is not configured"
            )

            raise AiServiceError(
                "AI service is not configured.",
                status_code=503,
            )

        url = self._get_url()

        payload = {
            "system_instruction": {
                "parts": [
                    {
                        "text": SYSTEM_INSTRUCTION
                    }
                ]
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": message
                        }
                    ],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 500,
            },
        }

        headers = {
            "Content-Type": "application/json",
        }

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.post(
                    url,
                    params={
                        "key": self.api_key
                    },
                    headers=headers,
                    json=payload,
                )

        except httpx.ConnectError as exc:

            logger.error(
                "Could not connect to Gemini: %s",
                exc,
            )

            raise AiServiceError(
                "Could not connect to the AI service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            logger.error(
                "Gemini request timed out: %s",
                exc,
            )

            raise AiServiceError(
                "The AI service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            logger.error(
                "Gemini HTTP error: %s",
                exc,
            )

            raise AiServiceError(
                "Unexpected error while contacting the AI service.",
                status_code=502,
            ) from exc

        # =================================================
        # GEMINI RESPONSE VALIDATION
        # =================================================

        if response.status_code == 401:

            logger.error(
                "Gemini authentication failed"
            )

            raise AiServiceError(
                "AI service authentication failed.",
                status_code=502,
            )

        if response.status_code == 403:

            logger.error(
                "Gemini API access forbidden"
            )

            raise AiServiceError(
                "AI service access was denied.",
                status_code=502,
            )

        if response.status_code == 429:

            logger.warning(
                "Gemini rate limit reached"
            )

            raise AiServiceError(
                "The AI service is temporarily unavailable.",
                status_code=503,
            )

        if response.status_code >= 500:

            logger.error(
                "Gemini server error status=%s",
                response.status_code,
            )

            raise AiServiceError(
                "The AI service returned an internal error.",
                status_code=502,
            )

        if response.status_code >= 400:

            logger.error(
                "Gemini request rejected status=%s body=%s",
                response.status_code,
                response.text,
            )

            raise AiServiceError(
                "The AI service rejected the request.",
                status_code=502,
            )

        # =================================================
        # PARSE RESPONSE
        # =================================================

        try:

            data = response.json()

        except ValueError as exc:

            logger.error(
                "Gemini returned invalid JSON"
            )

            raise AiServiceError(
                "The AI service returned an invalid response.",
                status_code=502,
            ) from exc

        # =================================================
        # EXTRACT TEXT
        # =================================================

        try:

            candidates = data.get(
                "candidates",
                [],
            )

            if not candidates:

                raise ValueError(
                    "No candidates returned"
                )

            content = candidates[0].get(
                "content",
                {}
            )

            parts = content.get(
                "parts",
                []
            )

            if not parts:

                raise ValueError(
                    "No response parts returned"
                )

            text = parts[0].get(
                "text",
                ""
            )

        except (AttributeError, IndexError, TypeError, ValueError) as exc:

            logger.error(
                "Unexpected Gemini response structure: %s",
                data,
            )

            raise AiServiceError(
                "The AI service returned an unexpected response.",
                status_code=502,
            ) from exc

        # =================================================
        # EMPTY RESPONSE
        # =================================================

        text = str(text).strip()

        if not text:

            logger.warning(
                "Gemini returned an empty response"
            )

            raise AiServiceError(
                "The AI service returned an empty response.",
                status_code=502,
            )

        logger.info(
            "Gemini response generated successfully"
        )

        return text


# =========================================================
# FASTAPI DEPENDENCY
# =========================================================

def get_ai_service() -> AiService:
    """
    FastAPI dependency factory.
    """

    return AiService()