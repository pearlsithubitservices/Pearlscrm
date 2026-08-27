import logging
import time
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request

from app.schemas.chat import ChatRequest, ChatResponse

from app.services.ai_service import (
    AiService,
    AiServiceError,
    get_ai_service,
)

from app.services.crm_service import (
    CrmService,
    CrmServiceError,
    get_crm_service,
)

from app.services.intent_service import (
    Intent,
    detect_intent,
    extract_employee_name,
    extract_employee_field,
    extract_employee_list_field,
    extract_attendance_employee_name,
    extract_attendance_field,
)

from app.services.response_formatting import (
    format_employee_list,
    format_employee_details,
    format_employee_field,
    format_employee_field_list,
    format_attendance,
    format_active_attendance,
    format_attendance_history,
)


logger = logging.getLogger("app.chat")

router = APIRouter(
    prefix="/api/v1",
    tags=["chat"],
)


# =========================================================
# FIND EMPLOYEE
# =========================================================

def find_employee(
    employees: list[dict],
    employee_name: str,
) -> dict | None:

    requested = employee_name.strip().lower()

    # -----------------------------------------------------
    # Exact match
    # -----------------------------------------------------

    for employee in employees:

        actual_name = str(
            employee.get("employeeName", "")
        ).strip().lower()

        if actual_name == requested:
            return employee

    # -----------------------------------------------------
    # Partial match
    # -----------------------------------------------------

    for employee in employees:

        actual_name = str(
            employee.get("employeeName", "")
        ).strip().lower()

        if (
            requested in actual_name
            or actual_name in requested
        ):
            return employee

    return None


# =========================================================
# FORMAT ATTENDANCE FIELD
# =========================================================

def format_attendance_field_response(
    employee: dict,
    attendance: list[dict],
    field: str,
) -> str:

    employee_name = employee.get(
        "employeeName",
        "Unknown",
    )

    # -----------------------------------------------------
    # No attendance record
    # -----------------------------------------------------

    if not attendance:

        return (
            f"Attendance Details\n\n"
            f"Employee: {employee_name}\n\n"
            f"No attendance records found."
        )

    # -----------------------------------------------------
    # Latest attendance record
    # -----------------------------------------------------

    record = attendance[0]

    # -----------------------------------------------------
    # Attendance ID
    # -----------------------------------------------------

    if field == "attendance_id":

        value = (
            record.get("_id")
            or record.get("id")
            or "Not available"
        )

    # -----------------------------------------------------
    # Login time
    # -----------------------------------------------------

    elif field == "login_time":

        value = record.get("login_time")

    # -----------------------------------------------------
    # Logout time
    # -----------------------------------------------------

    elif field == "logout_time":

        value = record.get("logout_time")

    # -----------------------------------------------------
    # Break start
    # -----------------------------------------------------

    elif field == "break_start":

        value = record.get("break_start")

    # -----------------------------------------------------
    # Break end
    # -----------------------------------------------------

    elif field == "break_end":

        value = record.get("break_end")

    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    elif field == "status":

        value = record.get("status")

    # -----------------------------------------------------
    # Total work time
    # -----------------------------------------------------

    elif field == "total_work_seconds":

        seconds = record.get(
            "total_work_seconds"
        )

        if seconds is None:

            value = "Not available"

        else:

            try:

                seconds = int(seconds)

                hours = seconds // 3600
                minutes = (seconds % 3600) // 60
                remaining_seconds = seconds % 60

                value = (
                    f"{hours}h "
                    f"{minutes}m "
                    f"{remaining_seconds}s"
                )

            except (TypeError, ValueError):

                value = str(seconds)

    else:

        value = record.get(field)

    # -----------------------------------------------------
    # Missing / null value
    # -----------------------------------------------------

    if value is None or value == "":

        value = "Not available"

    # -----------------------------------------------------
    # Readable field names
    # -----------------------------------------------------

    field_names = {

        "attendance_id": "Attendance ID",

        "login_time": "Login Time",

        "logout_time": "Logout Time",

        "break_start": "Break Start",

        "break_end": "Break End",

        "status": "Status",

        "total_work_seconds": "Total Work Time",
    }

    display_field = field_names.get(
        field,
        field.replace("_", " ").title(),
    )

    return (
        f"Attendance Details\n\n"
        f"Employee: {employee_name}\n\n"
        f"{display_field}: {value}"
    )


# =========================================================
# CHAT
# =========================================================

@router.post(
    "/chat",
    response_model=ChatResponse,
)
async def chat(
    payload: ChatRequest,
    request: Request,
    ai: AiService = Depends(get_ai_service),
    crm: CrmService = Depends(get_crm_service),
) -> ChatResponse:

    # =====================================================
    # REQUEST ID
    # =====================================================

    request_id = request.headers.get(
        "x-request-id",
        str(uuid.uuid4()),
    )

    started_at = time.monotonic()

    logger.info(
        "chat request received "
        "request_id=%s message_length=%d",
        request_id,
        len(payload.message),
    )

    # =====================================================
    # DETECT INTENT
    # =====================================================

    intent = detect_intent(
        payload.message
    )

    logger.info(
        "chat intent detected "
        "request_id=%s intent=%s",
        request_id,
        intent.value,
    )

    # =====================================================
    # 1. SPECIFIC EMPLOYEE ATTENDANCE FIELD
    #
    # Examples:
    #
    # show Pavithra login time
    # show Pavithra logout time
    # show Pavithra status
    # show Pavithra break start
    # show Pavithra break end
    # show Pavithra attendance id
    # show Pavithra total work time
    # =====================================================

    if intent is Intent.GET_ATTENDANCE_FIELD:

        employee_name = (
            extract_attendance_employee_name(
                payload.message
            )
        )

        field = (
            extract_attendance_field(
                payload.message
            )
        )

        logger.info(
            "attendance field request "
            "request_id=%s employee=%s field=%s",
            request_id,
            employee_name,
            field,
        )

        # -------------------------------------------------
        # Employee name missing
        # -------------------------------------------------

        if not employee_name:

            return ChatResponse(
                response=(
                    "Please provide the employee name."
                )
            )

        # -------------------------------------------------
        # Field missing
        # -------------------------------------------------

        if not field:

            return ChatResponse(
                response=(
                    "Please specify the attendance "
                    "information you want, such as "
                    "login time, logout time, status, "
                    "break time, or total work time."
                )
            )

        # -------------------------------------------------
        # Get employees from CRM
        # -------------------------------------------------

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employees "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Find employee
        # -------------------------------------------------

        employee = find_employee(
            employees,
            employee_name,
        )

        if employee is None:

            return ChatResponse(
                response=(
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )
            )

        # -------------------------------------------------
        # Get employee MongoDB ID
        # -------------------------------------------------

        employee_id = employee.get("_id")

        if not employee_id:

            return ChatResponse(
                response=(
                    f"The employee '{employee_name}' "
                    f"does not have a valid employee ID."
                )
            )

        # -------------------------------------------------
        # Get attendance from CRM
        # -------------------------------------------------

        try:

            attendance = (
                await crm.get_attendance_by_employee(
                    employee_uid=employee_id,
                    employee_name=employee.get(
                        "employeeName"
                    ),
                )
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get attendance field "
                "request_id=%s employee_id=%s",
                request_id,
                employee_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Format requested field
        # -------------------------------------------------

        answer = format_attendance_field_response(
            employee,
            attendance,
            field,
        )

        elapsed_ms = (
            time.monotonic()
            - started_at
        ) * 1000

        logger.info(
            "attendance field request succeeded "
            "request_id=%s employee=%s field=%s "
            "elapsed_ms=%.1f",
            request_id,
            employee_name,
            field,
            elapsed_ms,
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 2. SPECIFIC EMPLOYEE ATTENDANCE
    #
    # Examples:
    #
    # show Pavithra attendance
    # show Deepan Raj C attendance
    #
    # Returns all attendance records for the employee.
    # =====================================================

    if intent is Intent.GET_ATTENDANCE:

        employee_name = (
            extract_attendance_employee_name(
                payload.message
            )
        )

        logger.info(
            "employee attendance request "
            "request_id=%s employee=%s",
            request_id,
            employee_name,
        )

        # -------------------------------------------------
        # Employee name missing
        # -------------------------------------------------

        if not employee_name:

            return ChatResponse(
                response=(
                    "Please provide the employee name."
                )
            )

        # -------------------------------------------------
        # Get employees
        # -------------------------------------------------

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employees "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Find employee
        # -------------------------------------------------

        employee = find_employee(
            employees,
            employee_name,
        )

        if employee is None:

            return ChatResponse(
                response=(
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )
            )

        # -------------------------------------------------
        # Get MongoDB employee ID
        # -------------------------------------------------

        employee_id = employee.get("_id")

        if not employee_id:

            return ChatResponse(
                response=(
                    f"The employee '{employee_name}' "
                    f"does not have a valid employee ID."
                )
            )

        # -------------------------------------------------
        # Get attendance
        # -------------------------------------------------

        try:

            attendance = (
                await crm.get_attendance_by_employee(
                    employee_uid=employee_id,
                    employee_name=employee.get(
                        "employeeName"
                    ),
                )
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get attendance "
                "request_id=%s employee_id=%s",
                request_id,
                employee_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Format full attendance
        # -------------------------------------------------

        answer = format_attendance(
            employee,
            attendance,
        )

        elapsed_ms = (
            time.monotonic()
            - started_at
        ) * 1000

        logger.info(
            "employee attendance request succeeded "
            "request_id=%s employee=%s records=%d "
            "elapsed_ms=%.1f",
            request_id,
            employee_name,
            len(attendance),
            elapsed_ms,
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 3. ACTIVE ATTENDANCE
    #
    # Example:
    #
    # show active attendance
    #
    # Gets currently active attendance.
    # =====================================================

    if intent is Intent.GET_ACTIVE_ATTENDANCE:

        try:

            attendance = (
                await crm.get_active_attendance()
            )

        except CrmServiceError as exc:

            logger.exception(
                "active attendance request failed "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        answer = format_active_attendance(
            attendance
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 4. ATTENDANCE HISTORY
    #
    # Example:
    #
    # show attendance history
    #
    # Gets attendance history from CRM.
    # =====================================================

    if intent is Intent.GET_ATTENDANCE_HISTORY:

        try:

            attendance = (
                await crm.get_attendance_history()
            )

        except CrmServiceError as exc:

            logger.exception(
                "attendance history request failed "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        answer = format_attendance_history(
            attendance
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 5. SHOW ALL EMPLOYEES
    # =====================================================

    if intent is Intent.GET_EMPLOYEES:

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employees "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        answer = format_employee_list(
            employees
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 6. ALL EMPLOYEE FIELD LIST
    #
    # Examples:
    #
    # show all employee emails
    # show all employee roles
    # show all employee contacts
    # =====================================================

    if intent is Intent.GET_EMPLOYEE_FIELD_LIST:

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employee list "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        field = (
            extract_employee_list_field(
                payload.message
            )
        )

        if not field:

            answer = format_employee_list(
                employees
            )

        else:

            answer = (
                format_employee_field_list(
                    employees,
                    field,
                )
            )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 7. SPECIFIC EMPLOYEE FIELD
    #
    # Examples:
    #
    # show Pavithra email
    # show Deepan Raj C contact
    # =====================================================

    if intent is Intent.GET_EMPLOYEE_FIELD:

        employee_name = (
            extract_employee_name(
                payload.message
            )
        )

        field = (
            extract_employee_field(
                payload.message
            )
        )

        # -------------------------------------------------
        # Employee name missing
        # -------------------------------------------------

        if not employee_name:

            return ChatResponse(
                response=(
                    "Please provide the employee name."
                )
            )

        # -------------------------------------------------
        # Field missing
        # -------------------------------------------------

        if not field:

            return ChatResponse(
                response=(
                    "Please specify which employee "
                    "information you want."
                )
            )

        # -------------------------------------------------
        # Get employees
        # -------------------------------------------------

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employees "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Find employee
        # -------------------------------------------------

        employee = find_employee(
            employees,
            employee_name,
        )

        if employee is None:

            return ChatResponse(
                response=(
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )
            )

        # -------------------------------------------------
        # Format employee field
        # -------------------------------------------------

        answer = format_employee_field(
            employee,
            field,
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 8. SPECIFIC EMPLOYEE DETAILS
    #
    # Example:
    #
    # show Pavithra details
    # =====================================================

    if intent is Intent.GET_EMPLOYEE_DETAILS:

        employee_name = (
            extract_employee_name(
                payload.message
            )
        )

        # -------------------------------------------------
        # Employee name missing
        # -------------------------------------------------

        if not employee_name:

            return ChatResponse(
                response=(
                    "Please provide the employee name."
                )
            )

        # -------------------------------------------------
        # Get employees
        # -------------------------------------------------

        try:

            employees = (
                await crm.get_employees()
            )

        except CrmServiceError as exc:

            logger.exception(
                "failed to get employees "
                "request_id=%s",
                request_id,
            )

            raise HTTPException(
                status_code=exc.status_code,
                detail=exc.message,
            ) from exc

        # -------------------------------------------------
        # Find employee
        # -------------------------------------------------

        employee = find_employee(
            employees,
            employee_name,
        )

        if employee is None:

            return ChatResponse(
                response=(
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )
            )

        # -------------------------------------------------
        # Format employee details
        # -------------------------------------------------

        answer = format_employee_details(
            employee
        )

        return ChatResponse(
            response=answer
        )

    # =====================================================
    # 9. MY DETAILS
    # =====================================================

    if intent is Intent.GET_MY_DETAILS:

        return ChatResponse(
            response=(
                "Your employee identity is not connected "
                "to the chatbot yet. Authentication will "
                "be required before I can retrieve your "
                "personal CRM details."
            )
        )

    # =====================================================
    # 10. GENERAL CHAT -> GEMINI
    #
    # If no CRM intent matches, send the message to Gemini.
    # =====================================================

    try:

        answer = (
            await ai.get_chat_response(
                payload.message
            )
        )

    except AiServiceError as exc:

        elapsed_ms = (
            time.monotonic()
            - started_at
        ) * 1000

        logger.warning(
            "chat request failed "
            "request_id=%s status=%d "
            "elapsed_ms=%.1f",
            request_id,
            exc.status_code,
            elapsed_ms,
        )

        raise HTTPException(
            status_code=exc.status_code,
            detail=exc.message,
        ) from exc

    elapsed_ms = (
        time.monotonic()
        - started_at
    ) * 1000

    logger.info(
        "chat request succeeded via Gemini "
        "request_id=%s elapsed_ms=%.1f",
        request_id,
        elapsed_ms,
    )

    return ChatResponse(
        response=answer
    )