
import json
import logging
import re

from app.services.ai_service import get_ai_service
from app.services.intent_service import Intent


logger = logging.getLogger(__name__)


NLU_SYSTEM_INSTRUCTION = """
You are the Natural Language Understanding engine for Pearls IT Hub CRM.

Your job is to understand an employee's message and identify the
correct intent from the allowed intent list.

IMPORTANT RULES:

1. Select ONLY an intent from the allowed list.
2. Never create a new intent.
3. Understand normal English, informal English, spelling mistakes,
   WhatsApp shortcuts, and different ways of asking the same question.
4. Identify useful entities such as:
   - employee_name
   - task_name
   - project_name
   - status
   - date
   - month
   - leave_type
5. If an entity is not mentioned, return null.
6. Do not guess employee identity, employee ID, or permissions.
7. Do not convert a read-only question into a create, update,
   or delete action.
8. If the message is unclear, set needs_clarification to true.
9. Return ONLY valid JSON. Do not include Markdown or explanations.
INTENT UNDERSTANDING EXAMPLES:

- Questions about my assigned work, responsibilities,
  pending work, or all my tasks should use the appropriate
  task-reading intent from the allowed list.

- Questions about a particular task should use the
  appropriate single-task reading intent.

- Questions about my projects should use the appropriate
  project-reading intent.

- Questions about attendance, check-in, check-out,
  working hours, or attendance history should use
  the appropriate attendance-reading intent.

- Questions about leave records, approved leaves,
  pending leaves, or rejected leaves should use
  the appropriate leave-reading intent.

- Questions about salary, payroll, payment status,
  or payslips should use the appropriate payroll-reading intent.

- Questions about an employee's details should use
  the appropriate employee-reading intent.

Always select the exact intent value from the allowed list.
Never invent an intent value.
Required JSON format:

{
    "intent": "general_chat",
    "entities": {
        "employee_name": null,
        "task_name": null,
        "project_name": null,
        "status": null,
        "date": null,
        "month": null,
        "leave_type": null
    },
    "confidence": 0.0,
    "needs_clarification": false,
    "clarification_question": null
}
"""


class NLUService:

    def __init__(self, ai_service=None):
        self.ai = ai_service or get_ai_service()

        self.allowed_intents = {
            Intent.GET_EMPLOYEES.value,
            Intent.GET_EMPLOYEE_DETAILS.value,
            Intent.GET_EMPLOYEE_FIELD.value,
            Intent.GET_EMPLOYEE_FIELD_LIST.value,
            Intent.GET_MY_DETAILS.value,

            Intent.GET_ATTENDANCE.value,
            Intent.GET_ATTENDANCE_FIELD.value,
            Intent.GET_ACTIVE_ATTENDANCE.value,
            Intent.GET_ATTENDANCE_HISTORY.value,

            Intent.GET_TASKS.value,
            Intent.GET_TASKS_BY_EMPLOYEE.value,
            Intent.GET_TASK.value,
            Intent.GET_TASK_COUNT.value,

            Intent.GET_LEAVES.value,
            Intent.GET_LEAVES_BY_EMPLOYEE.value,
            Intent.GET_APPROVED_LEAVES.value,
            Intent.GET_PENDING_LEAVES.value,
            Intent.GET_REJECTED_LEAVES.value,

            Intent.GET_PAYROLL.value,
            Intent.GET_PAYROLL_BY_EMPLOYEE.value,
            Intent.GET_PAYROLL_DETAILS.value,
            Intent.GET_PAYROLL_STATUS.value,
            Intent.GET_PAID_PAYROLL.value,
            Intent.GET_PENDING_PAYROLL.value,
            Intent.GET_PAYSLIP_BY_EMPLOYEE_AND_MONTH.value,

            Intent.GET_PROJECTS.value,
            Intent.GET_PROJECT_PROGRESS.value,
            Intent.GET_PROJECT_DEADLINES.value,
            Intent.GET_PROJECT_TEAM.value,
            Intent.GET_PROJECT_MILESTONES.value,
            Intent.GET_PROJECT_NOTES.value,

            Intent.GET_FOLLOWUPS.value,
            Intent.GET_MEETINGS.value,

            Intent.GENERAL_CHAT.value,
        }


    async def understand_message(self, message: str):
        """
        Understand an employee message using Gemini.

        Returns a validated dictionary when successful.
        Returns None when the message cannot be understood safely.
        """

        if not message or not message.strip():
            return None

        allowed_intents_text = ", ".join(
            sorted(self.allowed_intents)
        )

        system_instruction = (
            NLU_SYSTEM_INSTRUCTION
            + "\n\nALLOWED INTENTS:\n"
            + allowed_intents_text
        )

        try:
            response = await self.ai._generate_response(
                 message=message,
                 system_instruction=system_instruction,
                 response_mime_type="application/json",
            )

            # TEMPORARY DEBUG: inspect Gemini's actual response
            logger.warning(
                 "NLU DEBUG response_type=%s response_preview=%r",
                  type(response).__name__,
                  str(response)[:1200],
            )

            result = self._parse_response(response)

            if not result:
                return None

            intent_value = result.get("intent")

            if intent_value not in self.allowed_intents:
                logger.warning(
                    "NLU returned unsupported intent: %s",
                    intent_value,
                )
                return None

            confidence = result.get("confidence", 0)

            try:
                confidence = float(confidence)
            except (TypeError, ValueError):
                return None

            if not 0 <= confidence <= 1:
                return None

            # Do not use uncertain AI predictions.
            if confidence < 0.75:
                logger.info(
                    "NLU confidence too low: %s",
                    confidence,
                )
                return None

            entities = result.get("entities", {})

            if not isinstance(entities, dict):
                entities = {}

            return {
                "intent": Intent(intent_value),
                "entities": entities,
                "confidence": confidence,
                "needs_clarification": bool(
                    result.get("needs_clarification", False)
                ),
                "clarification_question": result.get(
                    "clarification_question"
                ),
            }

        except Exception:
            logger.exception(
                "NLU processing failed. Existing intent detection "
                "should be used as fallback."
            )

            return None

    @staticmethod
    def _parse_response(response):
        """
        Extract a JSON object from Gemini's response.
        Supports dictionaries, plain JSON, Markdown fences,
        and additional text surrounding JSON.
        """

        if not response:
            return None

        # Gemini may already return a dictionary.
        if isinstance(response, dict):
            return response

        if not isinstance(response, str):
            logger.warning(
                "NLU received unsupported response type: %s",
                type(response).__name__,
            )
            return None

        response = response.strip()

        if not response:
            return None

        # Remove Markdown code fences.
        response = re.sub(
            r"```(?:json)?",
            "",
            response,
            flags=re.IGNORECASE,
        ).replace("```", "").strip()

        # First, try parsing the complete response.
        try:
            result = json.loads(response)

            if isinstance(result, dict):
                return result

        except json.JSONDecodeError:
            pass

        # Search for a valid JSON object inside the response.
        decoder = json.JSONDecoder()

        for match in re.finditer(r"\{", response):
            try:
                result, _ = decoder.raw_decode(
                    response[match.start():]
                )

                if isinstance(result, dict):
                    logger.info("NLU JSON extracted successfully")
                    return result

            except json.JSONDecodeError:
                continue

        logger.warning(
            "NLU could not extract valid JSON. Response preview: %r",
            response[:500],
        )

        return None


def get_nlu_service():
    return NLUService()
