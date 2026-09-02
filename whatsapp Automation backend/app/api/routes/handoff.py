from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.handoff_service import (
    HumanHandoffService,
    get_handoff_service,
)


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/api/v1/handoff",
    tags=["human-handoff"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class CreateHandoffRequest(BaseModel):

    conversation_id: str
    message: str
    employee_name: str | None = None
    source: str = "conversation"


# =========================================================
# CREATE HANDOFF REQUEST
# =========================================================

@router.post("/")
async def create_handoff_request(
    payload: CreateHandoffRequest,
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
):

    try:

        request = await handoff.create_request(
            message=payload.message,
            conversation_id=payload.conversation_id,
            source=payload.source,
            employee_name=payload.employee_name,
        )

        return request

    except ValueError as exc:

        raise HTTPException(
            status_code=400,
            detail=str(exc),
        )

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )


# =========================================================
# GET WAITING REQUESTS
# =========================================================

@router.get("/waiting")
async def get_waiting_requests(
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
):

    try:

        requests = await handoff.get_waiting_requests()

        return {
            "count": len(requests),
            "requests": requests,
        }

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )


# =========================================================
# GET ALL REQUESTS
# =========================================================

@router.get("/")
async def get_all_requests(
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
):

    try:

        requests = await handoff.get_all_requests()

        return {
            "count": len(requests),
            "requests": requests,
        }

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )


# =========================================================
# RESOLVE REQUEST
# =========================================================

@router.patch("/{handoff_id}/resolve")
async def resolve_request(
    handoff_id: str,
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
):

    try:

        request = await handoff.resolve_request(
            handoff_id
        )

        if request is None:

            raise HTTPException(
                status_code=404,
                detail="Human handoff request not found.",
            )

        return request

    except HTTPException:

        raise

    except RuntimeError as exc:

        raise HTTPException(
            status_code=502,
            detail=str(exc),
        )