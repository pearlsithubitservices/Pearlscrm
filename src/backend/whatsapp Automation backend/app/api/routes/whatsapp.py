import logging

from fastapi import APIRouter, Query, Request
from fastapi.responses import PlainTextResponse

from app.core.config import get_settings


logger = logging.getLogger("app.api.whatsapp")

router = APIRouter(
    prefix="/api/whatsapp",
    tags=["WhatsApp"],
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
        logger.info("WhatsApp webhook verified successfully")

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



@router.post("/webhook")
async def receive_webhook(request: Request):
    """
    Meta sends incoming WhatsApp messages here.
    """

    payload = await request.json()

    logger.info(
        "WhatsApp webhook received"
    )

    logger.debug(
        "WhatsApp payload: %s",
        payload,
    )

    

    return {
        "status": "received"
    }