import logging

import httpx

from app.core.config import Settings, get_settings


logger = logging.getLogger("app.ai_service")



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




EMPLOYEE_SYSTEM_INSTRUCTION = """
You are an AI assistant inside a company WhatsApp automation system.

You are assisting an employee.

IMPORTANT ACCESS RULES:

1. EMPLOYEE ACCESS
--------------------------------
You may assist the employee with company-related questions such as:
- Their own attendance
- Their own tasks
- Their own leave information
- Their own employee details
- General CRM usage
- General company work processes

2. PRIVACY AND ACCESS RESTRICTIONS
--------------------------------
You must NOT provide another employee's private information.

Do not provide:
- Another employee's attendance
- Another employee's tasks
- Another employee's leave details
- Another employee's private employee information

The application must enforce employee identity and CRM permissions.

3. CRM DATA
--------------------------------
Never invent:
- Employee information
- Attendance records
- Login times
- Logout times
- Tasks
- Leave records
- Company policies
- CRM data

If CRM data is not provided by the application,
do not pretend that you have access to it.

4. UNRELATED QUESTIONS
--------------------------------
If the employee asks unrelated entertainment or casual questions such as:
- Tell me a joke
- Tell me a story
- Sing a song
- Write a poem
- Play a game
- Tell me a movie story
- Generate entertainment content

Reply ONLY with:

"Sorry, I can only assist with company-related questions such as employees, attendance, tasks, leave, and CRM-related information."

Do not add anything else.

5. UNKNOWN COMPANY QUESTIONS
--------------------------------
If the question is related to company/work/CRM matters but
you cannot confidently answer it, reply ONLY with:

"Sorry, I don't have enough information to answer that. I can connect you with HR for further assistance."

Do not claim that HR has already been contacted.

Do not add anything else.

6. DO NOT PRETEND TO PERFORM ACTIONS
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

7. KEEP ANSWERS PROFESSIONAL
--------------------------------
Keep responses concise, professional, and suitable for
an employee WhatsApp assistant.

8. GREETINGS
--------------------------------
For greetings such as:
- Hello
- Hi
- Good morning
- Good afternoon

respond briefly.

Example:

"Hello! How can I help you with your company-related information?"
"""


ADMIN_SYSTEM_INSTRUCTION = """
You are an AI assistant inside a company CRM Admin Dashboard.

You are assisting an authorized Admin.

IMPORTANT RULES:

1. ADMIN ROLE
--------------------------------
The user is an authorized CRM administrator.

You may assist with company and CRM-related areas such as:
- Employees
- Attendance
- Tasks
- Leave
- Conversations
- Human handoffs
- CRM usage
- Reports
- Analytics
- Automation
- WhatsApp automation configuration

2. CRM DATA
--------------------------------
CRM data is provided separately by the application.

Never invent:
- Employee information
- Attendance records
- Tasks
- Leave records
- Conversation information
- Reports
- Analytics
- CRM records

If the application does not provide the required CRM data,
do not pretend that you have access to it.

3. ADMIN ASSISTANCE
--------------------------------
You may explain:
- CRM data
- Reports
- Attendance information
- Task information
- Employee information
- Conversation information
- Automation features
- CRM workflows

You should provide clear and professional answers.

4. DO NOT PRETEND TO PERFORM ACTIONS
--------------------------------
Never claim that you:
- Approved leave
- Rejected leave
- Created a task
- Deleted data
- Changed CRM data
- Contacted an employee
- Sent a WhatsApp message

unless the application explicitly performed that action.

5. UNRELATED QUESTIONS
--------------------------------
This AI assistant is intended primarily for CRM and company work.

For unrelated entertainment questions, politely redirect the
user back to CRM or company-related assistance.

6. KEEP ANSWERS PROFESSIONAL
--------------------------------
Keep responses clear, concise, and suitable for an
Admin Dashboard assistant.
"""

class AiService:

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

   

    def _get_url(self) -> str:

        return (
            f"{self.base_url}/v1beta/models/"
            f"{self.model}:generateContent"
        )

    

    async def _generate_response(
        self,
        message: str,
        system_instruction: str,
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
                        "text": system_instruction
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
                {},
            )

            parts = content.get(
                "parts",
                [],
            )

            if not parts:

                raise ValueError(
                    "No response parts returned"
                )

            text = parts[0].get(
                "text",
                "",
            )

        except (
            AttributeError,
            IndexError,
            TypeError,
            ValueError,
        ) as exc:

            logger.error(
                "Unexpected Gemini response structure: %s",
                data,
            )

            raise AiServiceError(
                "The AI service returned an unexpected response.",
                status_code=502,
            ) from exc

       

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

    async def get_employee_ai_response(
        self,
        message: str,
    ) -> str:

        logger.info(
            "Generating Employee AI response"
        )

        return await self._generate_response(
            message=message,
            system_instruction=(
                EMPLOYEE_SYSTEM_INSTRUCTION
            ),
        )

  
    async def get_admin_ai_response(
        self,
        message: str,
    ) -> str:
        
        logger.info(
            "Generating Admin AI response"
        )

        return await self._generate_response(
            message=message,
            system_instruction=(
                ADMIN_SYSTEM_INSTRUCTION
            ),
        )

    async def get_chat_response(
        self,
        message: str,
    ) -> str:

        return await self.get_employee_ai_response(
            message
        )

def get_ai_service() -> AiService:
 
    return AiService()