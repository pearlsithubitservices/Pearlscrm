import logging
import time
import uuid

from fastapi import APIRouter, Depends, Request

from app.schemas.chat import (
    ChatRequest,
    ChatResponse,
)

from app.services.ai_service import (
    AiService,
    get_ai_service,
)

from app.services.crm_service import (
    CrmService,
    get_crm_service,
)

from app.services.handoff_service import (
    HumanHandoffService,
    get_handoff_service,
)

from app.services.chat_service import (
    ChatService,
)


logger = logging.getLogger("app.chat")


router = APIRouter(
    prefix="/api/v1",
    tags=["chat"],
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



@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    payload: ChatRequest,
    request: Request,
    chat_service: ChatService = Depends(
        get_chat_service
    ),
) -> ChatResponse:

    request_id = request.headers.get(
        "x-request-id",
        str(uuid.uuid4()),
    )

    started_at = time.monotonic()

    message = payload.message.strip()

    if not message:

        return ChatResponse(
            response="Please enter a message."
        )

    logger.info(
        "employee whatsapp chat request received "
        "request_id=%s message_length=%d",
        request_id,
        len(message),
    )

    answer = await chat_service.process_message(
        message=message,
        source="admin",
        request_id=request_id,
        conversation_id=payload.conversation_id,
        employee_name=payload.employee_name,
      
    )

    elapsed_ms = (
        time.monotonic()
        - started_at
    ) * 1000

    logger.info(
        "employee whatsapp chat request completed "
        "request_id=%s elapsed_ms=%.1f",
        request_id,
        elapsed_ms,
    )

    return ChatResponse(
        response=answer
    )