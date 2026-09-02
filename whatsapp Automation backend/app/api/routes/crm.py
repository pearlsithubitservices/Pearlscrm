from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.services.crm_service import (
    CrmService,
    CrmServiceError,
    get_crm_service,
)


router = APIRouter(
    prefix="/crm",
    tags=["CRM Integration"],
)




class CrmTestResponse(BaseModel):
    

    success: bool
    source: str
    employee_count: int | None = None
    data: Any = None




@router.get(
    "/test-employees",
    response_model=CrmTestResponse,
)
async def test_employees(
    crm: CrmService = Depends(get_crm_service),
):
    

    try:
        employees = await crm.get_employees()

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            employee_count=len(employees),
            data=employees,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )



@router.get(
    "/test-attendance",
    response_model=CrmTestResponse,
)
async def test_active_attendance(
    crm: CrmService = Depends(get_crm_service),
):
    """
    Get currently active attendance records.

    CRM:
        GET /api/attendance/active
    """

    try:
        attendance = await crm.get_active_attendance()

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            employee_count=len(attendance),
            data=attendance,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )




@router.get(
    "/test-attendance-history",
    response_model=CrmTestResponse,
)
async def test_attendance_history(
    crm: CrmService = Depends(get_crm_service),
):
    

    try:
        history = await crm.get_attendance_history()

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=history,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )


# =========================================================
# ATTENDANCE - LOGIN
# =========================================================

@router.post(
    "/attendance-login",
    response_model=CrmTestResponse,
)
async def attendance_login(
    employee_uid: str | None = None,
    employee_name: str | None = None,
    crm: CrmService = Depends(get_crm_service),
):
  

    try:
        result = await crm.attendance_login(
            employee_uid=employee_uid,
            employee_name=employee_name,
        )

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=result,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )




@router.get(
    "/test-tasks",
    response_model=CrmTestResponse,
)
async def test_tasks(
    crm: CrmService = Depends(get_crm_service),
):
    

    try:
        tasks = await crm.get_tasks()

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=tasks,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )

# =========================================================
# DEBUG CRM METHODS - TEMPORARY
# =========================================================

@router.get("/debug-crm-methods")
async def debug_crm_methods(
    crm: CrmService = Depends(get_crm_service),
):
    return {
        "has_get_tasks": hasattr(crm, "get_tasks"),
        "methods": [
            method
            for method in dir(crm)
            if not method.startswith("_")
        ],
    }
# =========================================================
# TASKS - RECENT
# =========================================================

@router.get(
    "/test-recent-tasks/{employee_uid}",
    response_model=CrmTestResponse,
)
async def test_recent_tasks(
    employee_uid: str,
    crm: CrmService = Depends(get_crm_service),
):
    """
    Get recent tasks for an employee.

    CRM:
        GET /api/tasks/recent/:employee_uid
    """

    try:
        tasks = await crm.get_recent_tasks(employee_uid)

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=tasks,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )


# =========================================================
# TASK - GET BY ID
# =========================================================

@router.get(
    "/test-task/{task_id}",
    response_model=CrmTestResponse,
)
async def test_task(
    task_id: str,
    crm: CrmService = Depends(get_crm_service),
):
    """
    Get one task.

    CRM:
        GET /api/tasks/:id
    """

    try:
        task = await crm.get_task(task_id)

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=task,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )


# =========================================================
# LEAVE - GET ALL
# =========================================================

@router.get(
    "/test-leaves",
    response_model=CrmTestResponse,
)
async def test_leaves(
    crm: CrmService = Depends(get_crm_service),
):
    """
    Get all leave requests.

    CRM:
        GET /api/leaves
    """

    try:
        leaves = await crm.get_leaves()

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=leaves,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )


# =========================================================
# LEAVE - BY EMPLOYEE
# =========================================================

@router.post(
    "/test-leaves-by-employee/{employee_id}",
    response_model=CrmTestResponse,
)
async def test_employee_leaves(
    employee_id: str,
    crm: CrmService = Depends(get_crm_service),
):
    """
    Get leave requests for a specific employee.

    CRM:
        POST /api/leaves/by-employee
    """

    try:
        leaves = await crm.get_leaves_by_employee(employee_id)

        return CrmTestResponse(
            success=True,
            source="existing CRM",
            data=leaves,
        )

    except CrmServiceError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        )