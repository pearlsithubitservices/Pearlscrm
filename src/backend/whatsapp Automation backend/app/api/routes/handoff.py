from fastapi import APIRouter, Depends, HTTPException

from app.services.handoff_service import (
    HumanHandoffService,
    get_handoff_service,
)


router = APIRouter(
    prefix="/api/v1/handoff",
    tags=["human-handoff"],
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

    requests = await handoff.get_waiting_requests()

    return {
        "count": len(requests),
        "requests": requests,
    }


# =========================================================
# GET ALL REQUESTS
# =========================================================

@router.get("/")
async def get_all_requests(
    handoff: HumanHandoffService = Depends(
        get_handoff_service
    ),
):

    requests = await handoff.get_all_requests()

    return {
        "count": len(requests),
        "requests": requests,
    }


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

    request = await handoff.resolve_request(
        handoff_id
    )

    if request is None:

        raise HTTPException(
            status_code=404,
            detail="Human handoff request not found.",
        )

    return request