
import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import PlainTextResponse
from pydantic import BaseModel

from app.core.config import get_settings
from app.services.ai_service import AiService, get_ai_service
from app.services.chat_service import (
    ChatService,
    find_employee_by_phone,
)
from app.services.crm_service import (
    CrmService,
    CrmServiceError,
    get_crm_service,
)
from app.services.handoff_service import (
    HumanHandoffService,
    get_handoff_service,
)
from app.services.whatsapp_service import (
    WhatsAppService,
    WhatsAppServiceError,
    get_whatsapp_service,
)
from app.services.automation_service import automation_service


logger = logging.getLogger("app.api.whatsapp")
router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp"])

# Temporary in-memory leave sessions.
leave_flow_sessions: dict[str, dict] = {}

# Avoid processing duplicate webhook messages.
processed_message_ids: set[str] = set()


# =========================================================
# MESSAGE HELPERS
# =========================================================

def normalize_message(message: str) -> str:
    return " ".join((message or "").lower().strip().split())


def normalize_phone(phone: str) -> str:
    return (
        str(phone or "")
        .replace("+", "")
        .replace(" ", "")
        .replace("-", "")
        .replace("(", "")
        .replace(")", "")
        .strip()
    )


def parse_leave_date(value: str):
    for fmt in (
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%d %B %Y",
        "%d %b %Y",
    ):
        try:
            return datetime.strptime(value.strip(), fmt).date()
        except ValueError:
            continue
    return None


def is_leave_history_or_status_message(message: str) -> bool:
    text = normalize_message(message)

    phrases = [
        "leave history",
        "leave records",
        "show my leaves",
        "show my leave requests",
        "show my leave records",
        "view my leave records",
        "check my leave records",
        "my leave status",
        "my leave request status",
        "status of my leave",
        "status of my leave request",
        "what is my leave status",
        "what's my leave status",
        "what is the status of my leave",
        "what is the status of my leave request",
        "what's the status of my leave",
        "check my leave status",
        "track my leave request",
        "where is my leave request",
        "what happened to my leave request",
        "has my leave been approved",
        "has my leave been rejected",
        "is my leave approved",
        "is my leave request approved",
        "was my leave approved",
        "when will my leave be approved",
        "check leave approval",
        # Read-only leave status filters and questions.
        "pending leave",
        "leave pending",
        "pending leave request",
        "pending leave requests",
        "leave requests pending",
        "rejected leave",
        "leave rejected",
        "rejected leave request",
        "rejected leave requests",
        "leave requests rejected",
        "approved leave",
        "leave approved",
        "approved leaves",
        "approved leave request",
        "approved leave requests",
        "leave requests approved",
        "did my leave request get rejected",
        "did my leave get rejected",
        "was my leave request rejected",
        "has my leave request been rejected",
        "is my leave request rejected",
        "show my pending",
        "show my rejected",
        "show my approved",
        "how many pending leave",
        "how many rejected leave",
    ]

    status_words = (
        "pending",
        "approved",
        "rejected",
        "declined",
        "denied",
    )

    status_question_starts = (
        "is ",
        "are ",
        "was ",
        "were ",
        "has ",
        "have ",
        "did ",
        "show ",
        "check ",
        "what ",
        "how ",
    )

    is_natural_leave_status_query = (
        "leave" in text
        and any(word in text for word in status_words)
        and (
            "my " in text
            or text.startswith(status_question_starts)
        )
    )

    return (
        any(phrase in text for phrase in phrases)
        or is_natural_leave_status_query
    )


def is_leave_balance_message(message: str) -> bool:
    text = normalize_message(message)

    phrases = [
        "leave balance",
        "balance of my leave",
        "how many leaves do i have",
        "how many leave do i have",
        "how many days of leave",
        "remaining leaves",
        "remaining leave",
        "leave remaining",
        "my remaining leave",
        "my leave balance",
    ]

    return any(phrase in text for phrase in phrases)


def is_task_message(message: str) -> bool:
    text = normalize_message(message)

    # The word "task" is intentionally included so questions such as
    # "Which tasks am I working on?" are detected.
    phrases = [
        "task",
        "tasks",
        "my work",
        "my assigned work",
        "work assigned to me",
        "which work am i working on",
        "what work am i assigned",
        "what do i need to finish",
        "what should i finish",
    ]

    return any(phrase in text for phrase in phrases)


def is_attendance_message(message: str) -> bool:
    text = normalize_message(message)

    phrases = [
        "attendance",
        "am i present",
        "am i absent",
        "did i come to work",
        "did i come to office",
        "did i come to the office",
        "did i attend work",
        "did i attend office",
        "was i present",
        "was i absent",
        "did i check in",
        "have i checked in",
        "my check in",
        "my check-in",
        "my punch in",
        "my working hours",
        "attendance history",
        "my attendance today",
        "today's attendance",
        "todays attendance",
    ]

    return any(phrase in text for phrase in phrases)


def is_project_message(message: str) -> bool:
    text = normalize_message(message)

    phrases = [
        "project",
        "projects",
        "what am i working on",
        "what am i assigned to",
        "which project",
        "which projects",
        "my project",
        "my projects",
        "project assigned to me",
        "projects assigned to me",
    ]

    return any(phrase in text for phrase in phrases)


def is_leave_request_start(message: str) -> bool:
    text = normalize_message(message)

    phrases = [
        "apply for leave",
        "apply leave",
        "request leave",
        "request a leave",
        "i need leave",
        "i need a leave",
        "i need to take leave",
        "i want leave",
        "i want to apply for leave",
        "start leave request",
        "submit a leave request",
        "create leave request",
        "new leave request",
    ]

    return any(phrase in text for phrase in phrases)


def is_information_query(message: str) -> bool:
    return (
        is_task_message(message)
        or is_attendance_message(message)
        or is_project_message(message)
        or is_leave_history_or_status_message(message)
        or is_leave_balance_message(message)
    )


# =========================================================
# LEAVE REQUEST FLOW
# =========================================================

async def continue_leave_flow(crm, phone: str, message: str):
    session = leave_flow_sessions.get(phone)

    if not session:
        return None

    message = message.strip()
    normalized = normalize_message(message)

    if normalized in {"cancel", "cancel leave", "stop leave", "stop"}:
        leave_flow_sessions.pop(phone, None)
        return "Your leave request process has been cancelled."

    stage = session["stage"]

    if stage == "leave_type":
        # Accept only recognised leave types. Never store an arbitrary
        # message as the leave type.
        leave_type_aliases = {
            "sick": "Sick Leave",
            "sick leave": "Sick Leave",
            "casual": "Casual Leave",
            "casual leave": "Casual Leave",
            "annual": "Annual Leave",
            "annual leave": "Annual Leave",
            "personal": "Personal Leave",
            "personal leave": "Personal Leave",
        }
        selected_leave_type = leave_type_aliases.get(normalized)

        if not selected_leave_type:
            return (
                "Please choose a valid leave type: Sick Leave, "
                "Casual Leave, Annual Leave, or Personal Leave."
            )

        session["leaveType"] = selected_leave_type
        session["stage"] = "leave_from"
        return (
            "What is your leave start date?\n"
            "Use YYYY-MM-DD format. Example: 2026-10-20"
        )

    if stage == "leave_from":
        start_date = parse_leave_date(message)

        if not start_date:
            return (
                "Please enter a valid start date using "
                "YYYY-MM-DD format. Example: 2026-10-20"
            )

        session["leaveFrom"] = start_date.isoformat()
        session["stage"] = "leave_to"

        return (
            "What is your leave end date?\n"
            "Use YYYY-MM-DD format. Example: 2026-10-21"
        )

    if stage == "leave_to":
        end_date = parse_leave_date(message)

        if not end_date:
            return (
                "Please enter a valid end date using "
                "YYYY-MM-DD format. Example: 2026-10-21"
            )

        start_date = datetime.strptime(
            session["leaveFrom"], "%Y-%m-%d"
        ).date()

        if end_date < start_date:
            return (
                "The end date cannot be before the start date. "
                "Please enter the end date again."
            )

        session["leaveTo"] = end_date.isoformat()
        session["stage"] = "leave_reason"

        return "Please tell me the reason for your leave."

    if stage == "leave_reason":
        session["leaveReason"] = message

        leave_data = {
            "leaveTitle": "Leave Request",
            "leaveReason": session["leaveReason"],
            "leaveFrom": session["leaveFrom"],
            "leaveTo": session["leaveTo"],
            "employeeName": session["employeeName"],
            "employeeId": session["employeeId"],
            "department": session["department"],
            "leaveType": session["leaveType"],
        }

        try:
            result = await crm.create_leave(leave_data)
        except CrmServiceError:
            logger.exception("Failed to submit WhatsApp leave request")
            return (
                "I couldn't submit your leave request right now. "
                "Please send your reason again to retry."
            )

        if not result.get("success"):
            return (
                "Your leave request could not be submitted. "
                f"{result.get('message', 'Please try again.')}"
            )

        leave = result.get("leave") or {}
        leave_flow_sessions.pop(phone, None)

        return (
            "Your leave request has been submitted successfully!\n\n"
            f"Employee: {session['employeeName']}\n"
            f"Leave type: {session['leaveType']}\n"
            f"From: {session['leaveFrom']}\n"
            f"To: {session['leaveTo']}\n"
            f"Status: {leave.get('status', 'Pending')}\n\n"
            "Your request is awaiting approval."
        )

    leave_flow_sessions.pop(phone, None)
    return "The leave request flow was reset. Please start again."


# =========================================================
# REQUEST MODEL AND DEPENDENCIES
# =========================================================

class WhatsAppSendRequest(BaseModel):
    phone_number: str
    message: str


def get_chat_service(
    ai: AiService = Depends(get_ai_service),
    crm: CrmService = Depends(get_crm_service),
    handoff: HumanHandoffService = Depends(get_handoff_service),
) -> ChatService:
    return ChatService(
        ai=ai,
        crm=crm,
        handoff=handoff,
    )


# =========================================================
# SEND WHATSAPP MESSAGE
# =========================================================

@router.post("/send")
async def send_whatsapp_message(
    data: WhatsAppSendRequest,
    crm: CrmService = Depends(get_crm_service),
    whatsapp_service: WhatsAppService = Depends(get_whatsapp_service),
):
    phone_number = str(data.phone_number).strip()
    message = str(data.message).strip()

    if not phone_number:
        return {
            "success": False,
            "message": "Phone number is required.",
        }

    if not message:
        return {
            "success": False,
            "message": "Message is required.",
        }

    try:
        employees = await crm.get_employees()
        employee = find_employee_by_phone(employees, phone_number)

        conversation = await find_or_create_conversation(
            crm=crm,
            phone=phone_number,
            employee=employee,
        )

        conversation_id = (
            conversation.get("_id") or conversation.get("id")
        )

        if not conversation_id:
            raise WhatsAppServiceError(
                "Conversation ID could not be determined.",
                status_code=500,
            )

        result = await whatsapp_service.send_message(
            phone_number=phone_number,
            message=message,
        )

        await crm.add_conversation_message(
            conversation_id=conversation_id,
            sender="agent",
            message=message,
        )

        logger.info(
            "CRM WhatsApp message sent conversation_id=%s to=%s",
            conversation_id,
            phone_number,
        )

        return {
            "success": True,
            "conversation_id": conversation_id,
            "message": message,
            "phone_number": phone_number,
            "meta_response": result,
        }

    except WhatsAppServiceError as exc:
        logger.exception(
            "Failed to send CRM WhatsApp message to=%s",
            phone_number,
        )
        return {"success": False, "message": str(exc)}

    except CrmServiceError as exc:
        logger.exception(
            "CRM error while sending WhatsApp message to=%s",
            phone_number,
        )
        return {"success": False, "message": str(exc)}

    except Exception as exc:
        logger.exception(
            "Unexpected error while sending CRM WhatsApp message"
        )
        return {"success": False, "message": str(exc)}


# =========================================================
# META WEBHOOK VERIFICATION
# =========================================================

@router.get("/webhook")
async def verify_webhook(
    hub_mode: str | None = Query(default=None, alias="hub.mode"),
    hub_verify_token: str | None = Query(
        default=None, alias="hub.verify_token"
    ),
    hub_challenge: str | None = Query(
        default=None, alias="hub.challenge"
    ),
):
    settings = get_settings()

    if (
        hub_mode == "subscribe"
        and hub_verify_token == settings.WHATSAPP_VERIFY_TOKEN
    ):
        logger.info("WhatsApp webhook verified successfully")
        return PlainTextResponse(content=hub_challenge or "")

    logger.warning("WhatsApp webhook verification failed")
    return PlainTextResponse(
        content="Verification failed",
        status_code=403,
    )


# =========================================================
# FIND OR CREATE CONVERSATION
# =========================================================

async def find_or_create_conversation(
    crm: CrmService,
    phone: str,
    employee: dict | None,
) -> dict:
    conversations = await crm.get_conversations()
    normalized_phone = normalize_phone(phone)

    for conversation in conversations:
        conversation_phone = normalize_phone(
            conversation.get("phone", "")
        )
        status = str(conversation.get("status", "")).strip()

        if (
            conversation_phone == normalized_phone
            and status.lower() != "completed"
        ):
            logger.info(
                "Existing conversation found phone=%s conversation_id=%s",
                phone,
                conversation.get("_id") or conversation.get("id"),
            )
            return conversation

    employee_name = (
        employee.get("employeeName", "WhatsApp User")
        if employee
        else "WhatsApp User"
    )
    employee_id = (
        (employee.get("_id") or employee.get("id", ""))
        if employee
        else ""
    )

    conversation_data = {
        "contactId": employee_id or normalized_phone,
        "contactName": employee_name,
        "phone": phone,
        "email": "",
        "crmUserId": employee_id,
        "department": employee.get("department", "") if employee else "",
        "status": "In Progress",
        "intent": "General Query",
        "channel": "WhatsApp",
        "handledBy": "AI",
    }

    conversation = await crm.create_conversation(conversation_data)

    logger.info(
        "New WhatsApp conversation created phone=%s conversation_id=%s",
        phone,
        conversation.get("_id") or conversation.get("id"),
    )

    return conversation


# =========================================================
# RECEIVE WHATSAPP WEBHOOK
# =========================================================

@router.post("/webhook")
async def receive_webhook(
    request: Request,
    chat_service: ChatService = Depends(get_chat_service),
    crm: CrmService = Depends(get_crm_service),
    whatsapp_service: WhatsAppService = Depends(get_whatsapp_service),
):
    try:
        payload = await request.json()
    except Exception:
        logger.exception("Failed to parse WhatsApp webhook JSON")
        return {"status": "invalid_payload"}

    logger.info("WhatsApp webhook received")
    entries = payload.get("entry", [])

    if not entries:
        return {"status": "received"}

    for entry in entries:
        for change in entry.get("changes", []):
            value = change.get("value", {})

            statuses = value.get("statuses", [])
            if statuses:
                logger.info(
                    "WhatsApp status event received count=%d",
                    len(statuses),
                )

            messages = value.get("messages", [])
            if not messages:
                continue

            for message in messages:
                sender_phone = message.get("from")
                message_id = message.get("id")
                message_type = message.get("type")
                timestamp = message.get("timestamp")

                if message_id:
                    if message_id in processed_message_ids:
                        logger.warning(
                            "Duplicate WhatsApp message ignored message_id=%s",
                            message_id,
                        )
                        continue
                    processed_message_ids.add(message_id)

                logger.info(
                    "WhatsApp incoming message from=%s message_id=%s "
                    "type=%s timestamp=%s",
                    sender_phone,
                    message_id,
                    message_type,
                    timestamp,
                )

                if not sender_phone:
                    logger.warning("WhatsApp message has no sender phone")
                    continue

                if message_type != "text":
                    logger.info(
                        "Ignoring unsupported WhatsApp message type=%s",
                        message_type,
                    )
                    continue

                message_text = (
                    message.get("text", {}).get("body", "").strip()
                )

                logger.info(
                    "WhatsApp incoming message TEXT=%r",
                    message_text,
                )

                if not message_text:
                    logger.warning("WhatsApp message text is empty")
                    continue

                request_id = message_id or str(uuid.uuid4())

                try:
                    employees = await crm.get_employees()
                    employee = find_employee_by_phone(
                        employees,
                        sender_phone,
                    )

                    if employee:
                        logger.info(
                            "WhatsApp employee identified employee=%s",
                            employee.get("employeeName"),
                        )
                    else:
                        logger.warning(
                            "No CRM employee found phone=%s",
                            sender_phone,
                        )

                    conversation = await find_or_create_conversation(
                        crm=crm,
                        phone=sender_phone,
                        employee=employee,
                    )

                    conversation_id = (
                        conversation.get("_id")
                        or conversation.get("id")
                    )

                    if not conversation_id:
                        logger.error(
                            "Conversation has no ID phone=%s",
                            sender_phone,
                        )
                        continue

                    await crm.add_conversation_message(
                        conversation_id=conversation_id,
                        sender="customer",
                        message=message_text,
                    )

                    logger.info(
                        "Customer message saved conversation_id=%s",
                        conversation_id,
                    )

                    employee_name = (
                        employee.get("employeeName")
                        if employee
                        else "WhatsApp User"
                    )

                    # PRIORITY 1:
                    # Information queries must bypass the leave wizard.
                    if is_information_query(message_text):
                        # A read-only question must never be consumed as
                        # an answer to an unfinished leave application.
                        # Clear the old form to prevent accidental submission.
                        if sender_phone in leave_flow_sessions:
                            leave_flow_sessions.pop(sender_phone, None)
                            logger.info(
                                "Active leave form cleared because a "
                                "read-only information query was received "
                                "from=%s",
                                sender_phone,
                            )

                        logger.info(
                            "Information query routed to ChatService "
                            "conversation_id=%s message=%r",
                            conversation_id,
                            message_text,
                        )

                        answer = await chat_service.process_message(
                            message=message_text,
                            source="whatsapp",
                            conversation_id=conversation_id,
                            request_id=request_id,
                            employee_name=employee_name,
                            employee_phone=sender_phone,
                        )

                    else:
                        # PRIORITY 2:
                        # Continue a leave form only if the message
                        # was not recognized as an information query.
                        answer = await continue_leave_flow(
                            crm=crm,
                            phone=sender_phone,
                            message=message_text,
                        )

                        # PRIORITY 3:
                        # If there is no active leave form, check rules.
                        if answer is None:
                            active_rules = (
                                await crm.get_active_automation_rules()
                            )

                            if is_leave_balance_message(message_text):
                                matching_rule = next(
                                    (
                                        rule
                                        for rule in active_rules
                                        if str(
                                            rule.get("action", "")
                                        ).strip().lower()
                                        == "fetch leave balance"
                                    ),
                                    None,
                                )
                            else:
                                matching_rule = (
                                    automation_service.find_matching_rule(
                                        message=message_text,
                                        rules=active_rules,
                                    )
                                )

                            if matching_rule:
                                action = str(
                                    matching_rule.get("action", "")
                                ).strip().lower()

                                logger.info(
                                    "Automation rule matched rule=%s "
                                    "action=%s conversation_id=%s",
                                    matching_rule.get("name"),
                                    action,
                                    conversation_id,
                                )

                                if action == "start leave flow":
                                    employee_id = (
                                        (
                                            employee.get("_id")
                                            or employee.get("id")
                                        )
                                        if employee
                                        else None
                                    )
                                    department = (
                                        employee.get("department")
                                        if employee
                                        else None
                                    )

                                    if not employee_id:
                                        answer = (
                                            "I couldn't identify your "
                                            "employee record. Please contact "
                                            "HR to submit a leave request."
                                        )

                                    elif not employee_name or not department:
                                        answer = (
                                            "Some required employee details "
                                            "are missing from your CRM "
                                            "employee record. Please contact "
                                            "HR for help."
                                        )

                                    else:
                                        leave_flow_sessions[sender_phone] = {
                                            "stage": "leave_type",
                                            "employeeId": str(employee_id),
                                            "employeeName": employee_name,
                                            "department": department,
                                        }

                                        answer = (
                                            "I'll help you submit a leave "
                                            "request.\n\n"
                                            "What type of leave do you need?\n"
                                            "For example: Sick Leave, Casual "
                                            "Leave, or Annual Leave.\n\n"
                                            "Reply CANCEL at any time to stop."
                                        )

                                else:
                                    answer = (
                                        await chat_service.execute_automation_rule(
                                            rule=matching_rule,
                                            message=message_text,
                                            source="whatsapp",
                                            conversation_id=conversation_id,
                                            request_id=request_id,
                                            employee_name=employee_name,
                                            employee_phone=sender_phone,
                                        )
                                    )

                                    if not answer:
                                        answer = (
                                            await chat_service.process_message(
                                                message=message_text,
                                                source="whatsapp",
                                                conversation_id=conversation_id,
                                                request_id=request_id,
                                                employee_name=employee_name,
                                                employee_phone=sender_phone,
                                            )
                                        )

                            else:
                                logger.info(
                                    "No active automation rule matched; "
                                    "using normal chat processing "
                                    "conversation_id=%s",
                                    conversation_id,
                                )

                                answer = await chat_service.process_message(
                                    message=message_text,
                                    source="whatsapp",
                                    conversation_id=conversation_id,
                                    request_id=request_id,
                                    employee_name=employee_name,
                                    employee_phone=sender_phone,
                                )

                    logger.info(
                        "WhatsApp message processed conversation_id=%s",
                        conversation_id,
                    )

                    await crm.add_conversation_message(
                        conversation_id=conversation_id,
                        sender="ai",
                        message=answer,
                    )

                    logger.info(
                        "AI response saved conversation_id=%s",
                        conversation_id,
                    )

                    try:
                        await whatsapp_service.send_message(
                            phone_number=sender_phone,
                            message=answer,
                        )

                        logger.info(
                            "WhatsApp response sent successfully to=%s",
                            sender_phone,
                        )

                    except WhatsAppServiceError:
                        logger.exception(
                            "Failed to send WhatsApp response to=%s",
                            sender_phone,
                        )

                except CrmServiceError:
                    logger.exception(
                        "CRM error while processing WhatsApp message "
                        "from=%s",
                        sender_phone,
                    )

                except Exception:
                    logger.exception(
                        "Failed to process WhatsApp message from=%s",
                        sender_phone,
                    )

    return {"status": "received"}
