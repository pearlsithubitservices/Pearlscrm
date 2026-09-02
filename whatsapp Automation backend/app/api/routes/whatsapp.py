import logging
import uuid

from fastapi import (
    APIRouter,
    Depends,
    Query,
    Request,
)
from fastapi.responses import PlainTextResponse

from app.core.config import get_settings

from app.services.ai_service import (
    AiService,
    get_ai_service,
)

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


logger = logging.getLogger(
    "app.api.whatsapp"
)


router = APIRouter(
    prefix="/api/whatsapp",
    tags=["WhatsApp"],
)


def get_chat_service(
    ai: AiService = Depends(get_ai_service),
    crm: CrmService = Depends(get_crm_service),
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
) -> ChatService:

    return ChatService(
        ai=ai,
        crm=crm,
        handoff=handoff,
    )
@router.get("/webhook")
async def verify_webhook(
    hub_mode: str | None = Query(
        default=None,
        alias="hub.mode",
    ),
    hub_verify_token: str | None = Query(
        default=None,
        alias="hub.verify_token",
    ),
    hub_challenge: str | None = Query(
        default=None,
        alias="hub.challenge",
    ),
):

    settings = get_settings()

    if (
        hub_mode == "subscribe"
        and hub_verify_token
        == settings.WHATSAPP_VERIFY_TOKEN
    ):

        logger.info(
            "WhatsApp webhook verified successfully"
        )

        return PlainTextResponse(
            content=hub_challenge or ""
        )

    logger.warning(
        "WhatsApp webhook verification failed"
    )

    return PlainTextResponse(
        content="Verification failed",
        status_code=403,
    )


async def find_or_create_conversation(
    crm: CrmService,
    phone: str,
    employee: dict | None,
) -> dict:

    conversations = (
        await crm.get_conversations()
    )

    normalized_phone = (
        str(phone)
        .replace("+", "")
        .replace(" ", "")
        .replace("-", "")
        .strip()
    )
    for conversation in conversations:

        conversation_phone = (
            str(
                conversation.get(
                    "phone",
                    "",
                )
            )
            .replace("+", "")
            .replace(" ", "")
            .replace("-", "")
            .strip()
        )

        status = (
            conversation.get(
                "status",
                ""
            )
        )

        if (
            conversation_phone
            == normalized_phone
            and status != "Completed"
        ):

            logger.info(
                "Existing conversation found "
                "phone=%s conversation_id=%s",
                phone,
                conversation.get("_id"),
            )

            return conversation


    employee_name = "WhatsApp User"

    if employee:

        employee_name = (
            employee.get(
                "employeeName"
            )
            or "WhatsApp User"
        )

    conversation_data = {

        "contactId": (
            employee.get("_id")
            if employee
            else normalized_phone
        ),

        "contactName": employee_name,

        "phone": phone,

        "email": "",

        "crmUserId": (
            employee.get("_id")
            if employee
            else ""
        ),

        "department": (
            employee.get(
                "department",
                "",
            )
            if employee
            else ""
        ),

        "status": "In Progress",

        "intent": "General Query",

        "channel": "WhatsApp",

        "handledBy": "AI",
    }

    conversation = (
        await crm.create_conversation(
            conversation_data
        )
    )

    logger.info(
        "New WhatsApp conversation created "
        "phone=%s conversation_id=%s",
        phone,
        conversation.get("_id"),
    )

    return conversation

@router.post("/webhook")
async def receive_webhook(
    request: Request,

    chat_service: ChatService = Depends(
        get_chat_service
    ),

    crm: CrmService = Depends(
        get_crm_service
    ),

    whatsapp_service: WhatsAppService = Depends(
        get_whatsapp_service
    ),
):
    

    try:

        payload = await request.json()

    except Exception:

        logger.exception(
            "Failed to parse WhatsApp webhook JSON"
        )

        return {
            "status": "invalid_payload"
        }

    logger.info(
        "WhatsApp webhook received"
    )

    entries = payload.get(
        "entry",
        []
    )

    if not entries:

        return {
            "status": "received"
        }

    

    for entry in entries:

        changes = entry.get(
            "changes",
            []
        )

        for change in changes:

            value = change.get(
                "value",
                {}
            )

           

            statuses = value.get(
                "statuses",
                []
            )

            if statuses:

                logger.info(
                    "WhatsApp status event received "
                    "count=%d",
                    len(statuses),
                )

            

            messages = value.get(
                "messages",
                []
            )

            if not messages:

                continue


            for message in messages:

                sender_phone = message.get(
                    "from"
                )

                message_id = message.get(
                    "id"
                )

                message_type = message.get(
                    "type"
                )

                timestamp = message.get(
                    "timestamp"
                )

                logger.info(
                    "WhatsApp incoming message "
                    "from=%s message_id=%s "
                    "type=%s timestamp=%s",
                    sender_phone,
                    message_id,
                    message_type,
                    timestamp,
                )

                if not sender_phone:

                    logger.warning(
                        "WhatsApp message has no sender "
                        "phone"
                    )

                    continue

                if message_type != "text":

                    logger.info(
                        "Ignoring unsupported "
                        "WhatsApp message type=%s",
                        message_type,
                    )

                    continue


                text_data = message.get(
                    "text",
                    {}
                )

                message_text = (
                    text_data.get(
                        "body",
                        ""
                    )
                    .strip()
                )

                if not message_text:

                    logger.warning(
                        "WhatsApp message text is empty"
                    )

                    continue

    
                request_id = (
                    message_id
                    or str(uuid.uuid4())
                )

                try:

                    employees = (
                        await crm.get_employees()
                    )


                    employee = (
                        find_employee_by_phone(
                            employees,
                            sender_phone,
                        )
                    )

                    if employee:

                        logger.info(
                            "WhatsApp employee identified "
                            "employee=%s",
                            employee.get(
                                "employeeName"
                            ),
                        )

                    else:

                        logger.warning(
                            "No CRM employee found "
                            "phone=%s",
                            sender_phone,
                        )
                    conversation = (
                        await find_or_create_conversation(
                            crm=crm,
                            phone=sender_phone,
                            employee=employee,
                        )
                    )

                    conversation_id = (
                        conversation.get("_id")
                        or conversation.get("id")
                    )

                    if not conversation_id:

                        logger.error(
                            "Conversation has no ID "
                            "phone=%s",
                            sender_phone,
                        )

                        continue

                    await crm.add_conversation_message(
                        conversation_id=conversation_id,
                        sender="employee",
                        message=message_text,
                    )

                    logger.info(
                        "Employee message saved "
                        "conversation_id=%s",
                        conversation_id,
                    )

                    # =========================================
                    # PROCESS MESSAGE
                    # =========================================

                    answer = (
                        await chat_service.process_message(
                            message=message_text,
                            source="whatsapp",
                            conversation_id=conversation_id,
                            request_id=request_id,
                            employee_name=(
                                 employee.get("employeeName")
                                 if employee
                                 else "WhatsApp User"
                            ),
                            employee_phone=sender_phone,
                        )
                    )

                    logger.info(
                        "WhatsApp message processed "
                        "conversation_id=%s",
                        conversation_id,
                    )

                    
                    await crm.add_conversation_message(
                        conversation_id=conversation_id,
                        sender="ai",
                        message=answer,
                    )

                    logger.info(
                        "AI response saved "
                        "conversation_id=%s",
                        conversation_id,
                    )

                    
                    try:

                        await whatsapp_service.send_message(
                            phone_number=sender_phone,
                            message=answer,
                        )

                        logger.info(
                            "WhatsApp response sent "
                            "successfully "
                            "to=%s",
                            sender_phone,
                        )

                    except WhatsAppServiceError:

                        logger.exception(
                            "Failed to send WhatsApp "
                            "response to=%s",
                            sender_phone,
                        )

                except CrmServiceError:

                    logger.exception(
                        "CRM error while processing "
                        "WhatsApp message "
                        "from=%s",
                        sender_phone,
                    )

                except Exception:

                    logger.exception(
                        "Failed to process "
                        "WhatsApp message "
                        "from=%s",
                        sender_phone,
                    )

   

    return {
        "status": "received"
    }