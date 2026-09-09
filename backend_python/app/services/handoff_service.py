import logging
from typing import Any

import httpx

from app.core.config import get_settings


logger = logging.getLogger("app.handoff_service")


class HumanHandoffService:
    """
    Handles human/HR handoff requests.

    FastAPI communicates with the existing Node/Express CRM API.
    Node/Express stores handoff requests in MongoDB.

    Each handoff request is linked to an existing
    CRM conversation using conversation_id.
    """

    def __init__(self):
        self.settings = get_settings()

    # =====================================================
    # CREATE HANDOFF REQUEST
    # =====================================================

    async def create_request(
        self,
        message: str,
        conversation_id: str,
        source: str = "admin",
        employee_name: str | None = None,
    ) -> dict[str, Any]:

        # =================================================
        # VALIDATE REQUIRED CONVERSATION ID
        # =================================================

        if not conversation_id:

            raise ValueError(
                "conversation_id is required for a "
                "Human Handoff request."
            )

        # =================================================
        # HANDOFF PAYLOAD
        #
        # IMPORTANT:
        # This does NOT create a new conversation.
        # It only creates a handoff request linked to
        # the existing conversation.
        # =================================================

        payload = {
            "message": message,
            "source": source,
            "employee_name": employee_name,
            "conversation_id": conversation_id,
        }

        try:

            async with httpx.AsyncClient() as client:

                response = await client.post(
                    f"{self.settings.CRM_BASE_URL}/api/handoff",
                    json=payload,
                    timeout=(
                        self.settings
                        .CRM_REQUEST_TIMEOUT_SECONDS
                    ),
                )

        except httpx.RequestError as exc:

            logger.exception(
                "Failed to connect to Human Handoff API"
            )

            raise RuntimeError(
                "Could not connect to Human Handoff service."
            ) from exc

        # =================================================
        # HANDLE API ERROR
        # =================================================

        if response.status_code >= 400:

            logger.error(
                "Human Handoff API create failed "
                "status=%s response=%s",
                response.status_code,
                response.text,
            )

            raise RuntimeError(
                "Failed to create Human Handoff request."
            )

        handoff_request = response.json()

        logger.info(
            "Human handoff created "
            "handoff_id=%s conversation_id=%s "
            "source=%s employee=%s",
            handoff_request.get("_id"),
            conversation_id,
            source,
            employee_name,
        )

        return handoff_request

    # =====================================================
    # GET WAITING REQUESTS
    # =====================================================

    async def get_waiting_requests(
        self,
    ) -> list[dict[str, Any]]:

        try:

            async with httpx.AsyncClient() as client:

                response = await client.get(
                    f"{self.settings.CRM_BASE_URL}"
                    f"/api/handoff/waiting",
                    timeout=(
                        self.settings
                        .CRM_REQUEST_TIMEOUT_SECONDS
                    ),
                )

        except httpx.RequestError as exc:

            logger.exception(
                "Failed to connect to Human Handoff API"
            )

            raise RuntimeError(
                "Could not connect to Human Handoff service."
            ) from exc

        if response.status_code >= 400:

            logger.error(
                "Failed to get waiting Human Handoff "
                "requests status=%s response=%s",
                response.status_code,
                response.text,
            )

            raise RuntimeError(
                "Failed to get waiting Human Handoff "
                "requests."
            )

        data = response.json()

        return data.get(
            "requests",
            [],
        )

    # =====================================================
    # GET ALL REQUESTS
    # =====================================================

    async def get_all_requests(
        self,
    ) -> list[dict[str, Any]]:

        try:

            async with httpx.AsyncClient() as client:

                response = await client.get(
                    f"{self.settings.CRM_BASE_URL}"
                    f"/api/handoff",
                    timeout=(
                        self.settings
                        .CRM_REQUEST_TIMEOUT_SECONDS
                    ),
                )

        except httpx.RequestError as exc:

            logger.exception(
                "Failed to connect to Human Handoff API"
            )

            raise RuntimeError(
                "Could not connect to Human Handoff service."
            ) from exc

        if response.status_code >= 400:

            logger.error(
                "Failed to get Human Handoff requests "
                "status=%s response=%s",
                response.status_code,
                response.text,
            )

            raise RuntimeError(
                "Failed to get Human Handoff requests."
            )

        data = response.json()

        return data.get(
            "requests",
            [],
        )

    # =====================================================
    # RESOLVE REQUEST
    # =====================================================

    async def resolve_request(
        self,
        handoff_id: str,
    ) -> dict[str, Any] | None:

        try:

            async with httpx.AsyncClient() as client:

                response = await client.patch(
                    f"{self.settings.CRM_BASE_URL}"
                    f"/api/handoff/"
                    f"{handoff_id}/resolve",
                    timeout=(
                        self.settings
                        .CRM_REQUEST_TIMEOUT_SECONDS
                    ),
                )

        except httpx.RequestError as exc:

            logger.exception(
                "Failed to connect to Human Handoff API"
            )

            raise RuntimeError(
                "Could not connect to Human Handoff service."
            ) from exc

        if response.status_code == 404:

            return None

        if response.status_code >= 400:

            logger.error(
                "Human Handoff resolve failed "
                "status=%s response=%s",
                response.status_code,
                response.text,
            )

            raise RuntimeError(
                "Failed to resolve Human Handoff request."
            )

        resolved_request = response.json()

        logger.info(
            "Human handoff resolved "
            "handoff_id=%s",
            handoff_id,
        )

        return resolved_request


# =========================================================
# DEPENDENCY
# =========================================================

_handoff_service = HumanHandoffService()


def get_handoff_service() -> HumanHandoffService:

    return _handoff_service