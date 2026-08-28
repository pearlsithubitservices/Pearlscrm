import logging

import httpx

from app.core.config import get_settings


logger = logging.getLogger("app.services.whatsapp")


class WhatsAppService:

    def __init__(self):
        self.settings = get_settings()

    async def send_message(
        self,
        phone_number: str,
        message: str,
    ):
        """
        Send a text message through Meta WhatsApp Cloud API.

        This is the real production service.
        It can be tested later when Meta credentials are available.
        """

        access_token = self.settings.WHATSAPP_ACCESS_TOKEN
        phone_number_id = self.settings.WHATSAPP_PHONE_NUMBER_ID
        api_version = self.settings.WHATSAPP_API_VERSION

        if not access_token:
            raise ValueError(
                "WHATSAPP_ACCESS_TOKEN is not configured"
            )

        if not phone_number_id:
            raise ValueError(
                "WHATSAPP_PHONE_NUMBER_ID is not configured"
            )

        url = (
            f"https://graph.facebook.com/"
            f"{api_version}/"
            f"{phone_number_id}/messages"
        )

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        payload = {
            "messaging_product": "whatsapp",
            "to": phone_number,
            "type": "text",
            "text": {
                "body": message
            },
        }

        async with httpx.AsyncClient(timeout=20.0) as client:

            response = await client.post(
                url,
                headers=headers,
                json=payload,
            )

        if response.is_error:
            logger.error(
                "WhatsApp API error: status=%s",
                response.status_code,
            )

            logger.error(
                "WhatsApp API response: %s",
                response.text,
            )

            response.raise_for_status()

        return response.json()