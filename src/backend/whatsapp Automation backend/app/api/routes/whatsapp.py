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
)

from app.services.crm_service import (
    CrmService,
    get_crm_service,
)

from app.services.handoff_service import (
    HumanHandoffService,
    get_handoff_service,
)


logger = logging.getLogger("app.api.whatsapp")


router = APIRouter(
    prefix="/api/whatsapp",
    tags=["WhatsApp"],
)


# =========================================================
# CHAT SERVICE DEPENDENCY
# =========================================================

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


# =========================================================
# WEBHOOK VERIFICATION
# =========================================================

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


# =========================================================
# RECEIVE WEBHOOK EVENTS
# =========================================================

@router.post("/webhook")
async def receive_webhook(
    request: Request,
    chat_service: ChatService = Depends(
        get_chat_service
    ),
):
    """
    Receive events from Meta WhatsApp Cloud API.

    Incoming employee text messages are processed through
    the existing ChatService.

    Meta sending is not enabled yet because the real Meta
    credentials are not configured.
    """

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

    logger.debug(
        "WhatsApp payload: %s",
        payload,
    )

    entries = payload.get(
        "entry",
        []
    )

    if not entries:

        logger.info(
            "WhatsApp webhook contains no entries"
        )

        return {
            "status": "received"
        }

    # =====================================================
    # LOOP THROUGH ENTRIES
    # =====================================================

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

            # =================================================
            # STATUS EVENTS
            # =================================================

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

            # =================================================
            # INCOMING MESSAGES
            # =================================================

            messages = value.get(
                "messages",
                []
            )

            if not messages:

                continue

            # =================================================
            # PROCESS EACH MESSAGE
            # =================================================

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

                # =============================================
                # SUPPORT TEXT MESSAGES ONLY
                # =============================================

                if message_type != "text":

                    logger.info(
                        "Ignoring unsupported WhatsApp "
                        "message type=%s "
                        "message_id=%s",
                        message_type,
                        message_id,
                    )

                    continue

                # =============================================
                # EXTRACT TEXT MESSAGE
                # =============================================

                text_data = message.get(
                    "text",
                    {}
                )

                message_text = text_data.get(
                    "body",
                    ""
                ).strip()

                if not message_text:

                    logger.warning(
                        "WhatsApp text message is empty "
                        "message_id=%s",
                        message_id,
                    )

                    continue

                logger.info(
                    "WhatsApp text message parsed "
                    "from=%s message_id=%s "
                    "message_length=%d",
                    sender_phone,
                    message_id,
                    len(message_text),
                )

                # =============================================
                # PROCESS MESSAGE USING EXISTING CHAT SERVICE
                # =============================================

                request_id = (
                    message_id
                    or str(uuid.uuid4())
                )

                try:

                    answer = (
                        await chat_service.process_message(
                            message=message_text,
                            source="whatsapp",
                            request_id=request_id,
                            employee_phone=sender_phone,
                        )
                    )

                    logger.info(
                        "WhatsApp message processed "
                        "successfully "
                        "from=%s message_id=%s",
                        sender_phone,
                        message_id,
                    )

                    # =========================================
                    # TEMPORARY LOCAL OUTPUT
                    #
                    # Meta credentials are not ready yet.
                    # Therefore we log the response instead
                    # of sending it to WhatsApp.
                    # =========================================

                    logger.info(
                        "WhatsApp AI/CRM response "
                        "to=%s message_id=%s "
                        "response=%s",
                        sender_phone,
                        message_id,
                        answer,
                    )

                except Exception:

                    logger.exception(
                        "Failed to process WhatsApp "
                        "message from=%s message_id=%s",
                        sender_phone,
                        message_id,
                    )

    # =====================================================
    # META EXPECTS A SUCCESS RESPONSE
    # =====================================================

    return {
        "status": "received"
    }