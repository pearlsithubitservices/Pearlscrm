import logging
from typing import Any

import httpx

from app.core.config import get_settings


logger = logging.getLogger(
    "app.services.whatsapp"
)


# =========================================================
# WHATSAPP SERVICE ERROR
# =========================================================

class WhatsAppServiceError(Exception):
    """
    Raised when communication with the Meta WhatsApp
    Cloud API fails.
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
# WHATSAPP SERVICE
# =========================================================

class WhatsAppService:
    """
    Service responsible for sending WhatsApp messages
    through Meta WhatsApp Cloud API.
    """

    def __init__(self):

        self.settings = get_settings()


    # =====================================================
    # SEND TEXT MESSAGE
    # =====================================================

    async def send_message(
        self,
        phone_number: str,
        message: str,
    ) -> dict[str, Any]:

        """
        Send a text message through Meta WhatsApp Cloud API.
        """

        access_token = (
            self.settings.WHATSAPP_ACCESS_TOKEN
        )

        phone_number_id = (
            self.settings.WHATSAPP_PHONE_NUMBER_ID
        )

        api_version = (
            self.settings.WHATSAPP_API_VERSION
        )

        # =================================================
        # VALIDATE CONFIGURATION
        # =================================================

        if not access_token:

            logger.error(
                "WHATSAPP_ACCESS_TOKEN is not configured"
            )

            raise WhatsAppServiceError(
                "WhatsApp access token is not configured.",
                status_code=503,
            )

        if not phone_number_id:

            logger.error(
                "WHATSAPP_PHONE_NUMBER_ID is not configured"
            )

            raise WhatsAppServiceError(
                "WhatsApp phone number ID is not configured.",
                status_code=503,
            )

        # =================================================
        # VALIDATE MESSAGE
        # =================================================

        phone_number = (
            str(phone_number)
            .strip()
        )

        message = (
            str(message)
            .strip()
        )

        if not phone_number:

            raise WhatsAppServiceError(
                "Recipient phone number is required.",
                status_code=400,
            )

        if not message:

            raise WhatsAppServiceError(
                "WhatsApp message cannot be empty.",
                status_code=400,
            )

        # =================================================
        # NORMALIZE PHONE NUMBER
        # =================================================

        phone_number = (
            phone_number
            .replace("+", "")
            .replace(" ", "")
            .replace("-", "")
        )

        # =================================================
        # BUILD META API URL
        # =================================================

        url = (
            f"https://graph.facebook.com/"
            f"{api_version}/"
            f"{phone_number_id}/messages"
        )

        # =================================================
        # REQUEST HEADERS
        # =================================================

        headers = {
            "Authorization": (
                f"Bearer {access_token}"
            ),
            "Content-Type": (
                "application/json"
            ),
        }

        # =================================================
        # WHATSAPP MESSAGE PAYLOAD
        # =================================================

        payload = {
            "messaging_product": "whatsapp",

            "to": phone_number,

            "type": "text",

            "text": {
                "body": message,
            },
        }

        logger.info(
            "Sending WhatsApp message "
            "to=%s message_length=%d",
            phone_number,
            len(message),
        )

        # =================================================
        # SEND MESSAGE TO META
        # =================================================

        try:

            async with httpx.AsyncClient(
                timeout=20.0
            ) as client:

                response = await client.post(
                    url,
                    headers=headers,
                    json=payload,
                )

        except httpx.ConnectError as exc:

            logger.exception(
                "Could not connect to "
                "Meta WhatsApp API"
            )

            raise WhatsAppServiceError(
                "Could not connect to WhatsApp service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            logger.exception(
                "WhatsApp API request timed out"
            )

            raise WhatsAppServiceError(
                "WhatsApp service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            logger.exception(
                "HTTP error while calling "
                "WhatsApp API"
            )

            raise WhatsAppServiceError(
                "Unexpected error while "
                "contacting WhatsApp.",
                status_code=502,
            ) from exc

        # =================================================
        # HANDLE META API ERRORS
        # =================================================

        if response.is_error:

            logger.error(
                "WhatsApp API error "
                "status=%s response=%s",
                response.status_code,
                response.text,
            )

            raise WhatsAppServiceError(
                "Meta WhatsApp API rejected "
                "the message.",
                status_code=response.status_code,
            )

        # =================================================
        # PARSE RESPONSE
        # =================================================

        try:

            result = response.json()

        except ValueError as exc:

            logger.exception(
                "Meta WhatsApp API returned "
                "invalid JSON"
            )

            raise WhatsAppServiceError(
                "WhatsApp service returned "
                "an invalid response.",
                status_code=502,
            ) from exc

        logger.info(
            "WhatsApp message sent successfully "
            "to=%s",
            phone_number,
        )

        return result


# =========================================================
# FASTAPI DEPENDENCY
# =========================================================

def get_whatsapp_service() -> WhatsAppService:

    """
    FastAPI dependency factory.
    """

    return WhatsAppService()