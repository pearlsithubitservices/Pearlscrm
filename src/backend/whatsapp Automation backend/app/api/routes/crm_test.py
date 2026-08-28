from fastapi import APIRouter, Depends, HTTPException

from app.schemas.crm import CrmTestResponse
from app.services.crm_service import CrmService, CrmServiceError, get_crm_service

router = APIRouter(prefix="/api/v1/crm", tags=["crm"])


@router.get("/test-employees", response_model=CrmTestResponse)
async def test_employees(
    crm: CrmService = Depends(get_crm_service),
) -> CrmTestResponse:
   
    try:
        employees = await crm.get_employees()
    except CrmServiceError as exc:
        # Message is already safe (no secrets/stack traces) - see crm_service.py
        raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc

    return CrmTestResponse(
        success=True,
        source="existing CRM GET /api/employees",
        employee_count=len(employees),
        data=employees,
    )
