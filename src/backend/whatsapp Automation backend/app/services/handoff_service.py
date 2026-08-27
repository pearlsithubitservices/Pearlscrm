import logging
import uuid
from datetime import datetime, timezone
from typing import Any


logger = logging.getLogger("app.handoff_service")


class HumanHandoffService:
    """
    Handles requests that need human/HR assistance.

    For now this stores handoff requests in memory so we can
    test the complete flow through Swagger.

    Later this can be replaced with MongoDB persistence.
    """

    def __init__(self):
        self._requests: list[dict[str, Any]] = []

    # =====================================================
    # CREATE HANDOFF REQUEST
    # =====================================================

    async def create_request(
        self,
        message: str,
        source: str = "admin",
        employee_name: str | None = None,
        conversation_id: str | None = None,
    ) -> dict[str, Any]:

        handoff_id = str(uuid.uuid4())

        request = {
            "id": handoff_id,
            "message": message,
            "source": source,
            "employee_name": employee_name,
            "conversation_id": conversation_id,
            "status": "waiting",
            "created_at": datetime.now(
                timezone.utc
            ).isoformat(),
        }

        self._requests.append(request)

        logger.info(
            "Human handoff created "
            "handoff_id=%s source=%s employee=%s",
            handoff_id,
            source,
            employee_name,
        )

        return request

    # =====================================================
    # GET WAITING REQUESTS
    # =====================================================

    async def get_waiting_requests(
        self,
    ) -> list[dict[str, Any]]:

        return [
            request
            for request in self._requests
            if request["status"] == "waiting"
        ]

    # =====================================================
    # GET ALL REQUESTS
    # =====================================================

    async def get_all_requests(
        self,
    ) -> list[dict[str, Any]]:

        return list(self._requests)

    # =====================================================
    # RESOLVE REQUEST
    # =====================================================

    async def resolve_request(
        self,
        handoff_id: str,
    ) -> dict[str, Any] | None:

        for request in self._requests:

            if request["id"] == handoff_id:

                request["status"] = "resolved"

                request["resolved_at"] = (
                    datetime.now(
                        timezone.utc
                    ).isoformat()
                )

                logger.info(
                    "Human handoff resolved "
                    "handoff_id=%s",
                    handoff_id,
                )

                return request

        return None


# =========================================================
# DEPENDENCY
# =========================================================

_handoff_service = HumanHandoffService()


def get_handoff_service() -> HumanHandoffService:
    return _handoff_service