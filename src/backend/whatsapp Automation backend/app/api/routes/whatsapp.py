import logging

from fastapi import APIRouter, Query, Request
from fastapi.responses import PlainTextResponse

from app.core.config import get_settings


logger = logging.getLogger("app.api.whatsapp")


router = APIRouter(
    prefix="/api/whatsapp",
    tags=["WhatsApp"],
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
async def receive_webhook(request: Request):
    """
    Receive events from Meta WhatsApp Cloud API.

    Currently prepares and parses incoming WhatsApp
    text messages.

    AI processing and automatic replies will be connected
    in the next step.
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

    # =====================================================
    # META WEBHOOK STRUCTURE
    #
    # entry
    #   └── changes
    #         └── value
    #               ├── messages
    #               └── statuses
    #
    # Status events such as sent/delivered/read do not
    # contain incoming employee messages.
    # =====================================================

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
            # IGNORE STATUS EVENTS
            #
            # Meta can send events for:
            # sent
            # delivered
            # read
            # failed
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
            # GET INCOMING MESSAGES
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
                # CURRENTLY SUPPORT TEXT MESSAGES ONLY
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

                # =============================================
                # SUCCESSFULLY PARSED MESSAGE
                # =============================================

                logger.info(
                    "WhatsApp text message parsed "
                    "from=%s message_id=%s "
                    "message_length=%d",
                    sender_phone,
                    message_id,
                    len(message_text),
                )

                logger.info(
                    "WhatsApp message content: %s",
                    message_text,
                )

                # =============================================
                # NEXT STEP
                #
                # message_text
                #       ↓
                # Existing AI / Intent processing
                #       ↓
                # CRM lookup if needed
                #       ↓
                # AI response
                #       ↓
                # WhatsAppService.send_message()
                #
                # We intentionally do not send a reply yet.
                # =============================================

    # =====================================================
    # META EXPECTS A SUCCESS RESPONSE
    # =====================================================

    return {
        "status": "received"
    }