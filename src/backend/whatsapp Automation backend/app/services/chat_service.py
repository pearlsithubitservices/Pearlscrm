import logging
import time
import uuid

from fastapi import HTTPException

from app.services.ai_service import (
    AiService,
    AiServiceError,
)

from app.services.crm_service import (
    CrmService,
    CrmServiceError,
)

from app.services.handoff_service import (
    HumanHandoffService,
)

from app.services.intent_service import (
    Intent,
    detect_intent,
    extract_employee_name,
    extract_employee_field,
    extract_employee_list_field,
    extract_attendance_employee_name,
    extract_attendance_field,
    extract_task_id,
    extract_task_employee_name,
    extract_leave_employee_name,
)

from app.services.response_formatting import (
    format_attendance,
    format_active_attendance,
    format_attendance_history,
    format_employee_list,
    format_employee_field_list,
    format_employee_field,
    format_employee_details,
)


logger = logging.getLogger(
    "app.services.chat"
)


# =========================================================
# FIXED RESPONSES
# =========================================================

UNWANTED_RESPONSE = (
    "Sorry, I can only assist with company-related questions "
    "such as employees, attendance, tasks, leave, and "
    "CRM-related information."
)


HR_HANDOFF_RESPONSE = (
    "Sorry, I don't have enough information to answer that. "
    "I can connect you with HR for further assistance."
)


# =========================================================
# FIND EMPLOYEE
# =========================================================

def find_employee(
    employees: list[dict],
    employee_name: str,
) -> dict | None:

    requested = (
        employee_name
        .strip()
        .lower()
    )

    # Exact match
    for employee in employees:

        actual_name = str(
            employee.get(
                "employeeName",
                "",
            )
        ).strip().lower()

        if actual_name == requested:

            return employee

    # Partial match
    for employee in employees:

        actual_name = str(
            employee.get(
                "employeeName",
                "",
            )
        ).strip().lower()

        if (
            requested in actual_name
            or actual_name in requested
        ):

            return employee

    return None


# =========================================================
# FIND EMPLOYEE BY PHONE
# =========================================================

def find_employee_by_phone(
    employees: list[dict],
    phone: str,
) -> dict | None:

    if not phone:

        return None

    requested_phone = (
        str(phone)
        .replace("+", "")
        .replace(" ", "")
        .replace("-", "")
        .strip()
    )

    for employee in employees:

        employee_phone = (
            employee.get("contact")
            or employee.get("phone")
            or ""
        )

        normalized_employee_phone = (
            str(employee_phone)
            .replace("+", "")
            .replace(" ", "")
            .replace("-", "")
            .strip()
        )

        if (
            normalized_employee_phone
            == requested_phone
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

    if not attendance:

        return (
            "Attendance Details\n\n"
            f"Employee: {employee_name}\n\n"
            "No attendance records found."
        )

    record = attendance[0]

    if field == "attendance_id":

        value = (
            record.get("_id")
            or record.get("id")
            or "Not available"
        )

    elif field == "login_time":

        value = record.get(
            "login_time"
        )

    elif field == "logout_time":

        value = record.get(
            "logout_time"
        )

    elif field == "break_start":

        value = record.get(
            "break_start"
        )

    elif field == "break_end":

        value = record.get(
            "break_end"
        )

    elif field == "status":

        value = record.get(
            "status"
        )

    elif field == "total_work_seconds":

        seconds = record.get(
            "total_work_seconds"
        )

        if seconds is None:

            value = "Not available"

        else:

            try:

                seconds = int(
                    seconds
                )

                hours = (
                    seconds // 3600
                )

                minutes = (
                    seconds % 3600
                ) // 60

                remaining_seconds = (
                    seconds % 60
                )

                value = (
                    f"{hours}h "
                    f"{minutes}m "
                    f"{remaining_seconds}s"
                )

            except (
                TypeError,
                ValueError,
            ):

                value = str(
                    seconds
                )

    else:

        value = record.get(
            field
        )

    if (
        value is None
        or value == ""
    ):

        value = "Not available"

    field_names = {

        "attendance_id":
            "Attendance ID",

        "login_time":
            "Login Time",

        "logout_time":
            "Logout Time",

        "break_start":
            "Break Start",

        "break_end":
            "Break End",

        "status":
            "Status",

        "total_work_seconds":
            "Total Work Time",
    }

    display_field = (
        field_names.get(
            field,
            field
            .replace("_", " ")
            .title(),
        )
    )

    return (
        "Attendance Details\n\n"
        f"Employee: {employee_name}\n\n"
        f"{display_field}: {value}"
    )


# =========================================================
# CRM ERROR HELPER
# =========================================================

def crm_http_exception(
    exc: CrmServiceError,
) -> HTTPException:

    return HTTPException(
        status_code=exc.status_code,
        detail=exc.message,
    )


# =========================================================
# FORMAT TASKS
# =========================================================

def format_tasks(
    tasks: list[dict],
    title: str = "Tasks",
) -> str:

    if not tasks:

        return "No tasks found."

    lines = [
        title,
        "",
    ]

    for index, task in enumerate(
        tasks,
        start=1,
    ):

        task_title = (
            task.get("title")
            or task.get("taskName")
            or task.get("name")
            or "Untitled task"
        )

        status = (
            task.get("status")
            or "Not available"
        )

        lines.append(
            f"{index}. "
            f"{task_title} — "
            f"{status}"
        )

    return "\n".join(
        lines
    )


# =========================================================
# FORMAT LEAVES
# =========================================================

def format_leaves(
    leaves: list[dict],
    title: str = "Leave Records",
) -> str:

    if not leaves:

        return (
            "No leave records found."
        )

    lines = [
        title,
        "",
    ]

    for index, leave in enumerate(
        leaves,
        start=1,
    ):

        employee = (
            leave.get("employeeName")
            or leave.get("employee_name")
            or leave.get("employee")
            or "Unknown employee"
        )

        status = (
            leave.get("status")
            or "Not available"
        )

        start_date = (
            leave.get("startDate")
            or leave.get("start_date")
            or ""
        )

        end_date = (
            leave.get("endDate")
            or leave.get("end_date")
            or ""
        )

        date_text = ""

        if (
            start_date
            or end_date
        ):

            date_text = (
                f" ({start_date} - {end_date})"
            )

        lines.append(
            f"{index}. "
            f"{employee} — "
            f"{status}"
            f"{date_text}"
        )

    return "\n".join(
        lines
    )


# =========================================================
# CHAT SERVICE
# =========================================================

class ChatService:

    """
    Shared message-processing service.

    Used by:

    - Admin chat
    - WhatsApp webhook
    """

    def __init__(
        self,
        ai: AiService,
        crm: CrmService,
        handoff: HumanHandoffService,
    ):

        self.ai = ai
        self.crm = crm
        self.handoff = handoff


    # =====================================================
    # PROCESS MESSAGE
    # =====================================================

    async def process_message(
        self,
        message: str,
        source: str = "admin",
        conversation_id: str | None = None,
        request_id: str | None = None,
        employee_phone: str | None = None,
    ) -> str:

        # =================================================
        # REQUEST ID
        # =================================================

        if request_id is None:

            request_id = str(
                uuid.uuid4()
            )

        started_at = time.monotonic()


        # =================================================
        # VALIDATE MESSAGE
        # =================================================

        message = message.strip()

        if not message:

            return (
                "Please enter a message."
            )


        # =================================================
        # IDENTIFY WHATSAPP EMPLOYEE BY PHONE
        # =================================================

        current_employee = None

        if (
            source == "whatsapp"
            and employee_phone
        ):

            try:

                employees = (
                    await self.crm.get_employees()
                )

                current_employee = (
                    find_employee_by_phone(
                        employees,
                        employee_phone,
                    )
                )

                if current_employee:

                    logger.info(
                        "WhatsApp employee identified "
                        "request_id=%s employee=%s phone=%s",
                        request_id,
                        current_employee.get(
                            "employeeName"
                        ),
                        employee_phone,
                    )

                else:

                    logger.warning(
                        "No CRM employee found for "
                        "WhatsApp phone=%s",
                        employee_phone,
                    )

            except CrmServiceError:

                logger.exception(
                    "Failed to identify WhatsApp employee "
                    "request_id=%s phone=%s",
                    request_id,
                    employee_phone,
                )


        # =================================================
        # START LOG
        # =================================================

        logger.info(
            "message processing started "
            "request_id=%s source=%s message_length=%d",
            request_id,
            source,
            len(message),
        )


        # =================================================
        # DETECT INTENT
        # =================================================

        intent = detect_intent(
            message
        )

        logger.info(
            "message intent detected "
            "request_id=%s source=%s intent=%s",
            request_id,
            source,
            intent.value,
        )


        # =================================================
        # MESSAGE LOWER
        # =================================================

        message_lower = message.lower()


        # =================================================
        # 0. UNWANTED TALK
        # =================================================

        if intent is Intent.UNWANTED_TALK:

            return UNWANTED_RESPONSE


        # =================================================
        # 1. EXPLICIT HUMAN HELP
        # =================================================

        if intent is Intent.HUMAN_HELP:

            try:

                handoff_request = (
                    await self.handoff.create_request(
                        message=message,
                        source=source,
                        conversation_id=conversation_id,
                    )
                )

                logger.info(
                    "explicit human handoff created "
                    "request_id=%s handoff_id=%s",
                    request_id,
                    handoff_request["id"],
                )

            except Exception:

                logger.exception(
                    "failed to create explicit human handoff"
                )

                raise HTTPException(
                    status_code=500,
                    detail=(
                        "Unable to create the human "
                        "assistance request."
                    ),
                )

            return (
                "Your request has been sent to HR. "
                "A human representative can assist you."
            )


        # =================================================
        # 2. ATTENDANCE FIELD
        # =================================================

        if intent is Intent.GET_ATTENDANCE_FIELD:

            employee_name = (
                extract_attendance_employee_name(
                    message
                )
            )

            field = (
                extract_attendance_field(
                    message
                )
            )

            if not employee_name:

                return (
                    "Please provide the employee name."
                )

            if not field:

                return (
                    "Please specify the attendance "
                    "information you want."
                )

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            employee = find_employee(
                employees,
                employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )

            employee_id = employee.get(
                "_id"
            )

            try:

                attendance = (
                    await self.crm.get_attendance_by_employee(
                        employee_uid=employee_id,
                        employee_name=employee.get(
                            "employeeName"
                        ),
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_attendance_field_response(
                employee,
                attendance,
                field,
            )


        # =================================================
        # 3. EMPLOYEE ATTENDANCE
        # =================================================

        if intent is Intent.GET_ATTENDANCE:

            # WhatsApp "my attendance"
            if (
                source == "whatsapp"
                and current_employee is not None
                and "my attendance" in message_lower
            ):

                employee = current_employee

            else:

                employee_name = (
                    extract_attendance_employee_name(
                        message
                    )
                )

                if not employee_name:

                    return (
                        "Please provide the employee name."
                    )

                try:

                    employees = (
                        await self.crm.get_employees()
                    )

                except CrmServiceError as exc:

                    raise crm_http_exception(
                        exc
                    )

                employee = find_employee(
                    employees,
                    employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get(
                "_id"
            )

            try:

                attendance = (
                    await self.crm.get_attendance_by_employee(
                        employee_uid=employee_id,
                        employee_name=employee.get(
                            "employeeName"
                        ),
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_attendance(
                employee,
                attendance,
            )


        # =================================================
        # 4. ACTIVE ATTENDANCE
        # =================================================

        if intent is Intent.GET_ACTIVE_ATTENDANCE:

            try:

                attendance = (
                    await self.crm.get_active_attendance()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_active_attendance(
                attendance
            )


        # =================================================
        # 5. ATTENDANCE HISTORY
        # =================================================

        if intent is Intent.GET_ATTENDANCE_HISTORY:

            try:

                attendance = (
                    await self.crm.get_attendance_history()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_attendance_history(
                attendance
            )


        # =================================================
        # 6. ALL EMPLOYEES
        # =================================================

        if intent is Intent.GET_EMPLOYEES:

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_employee_list(
                employees
            )


        # =================================================
        # 7. EMPLOYEE FIELD LIST
        # =================================================

        if intent is Intent.GET_EMPLOYEE_FIELD_LIST:

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            field = (
                extract_employee_list_field(
                    message
                )
            )

            if not field:

                return format_employee_list(
                    employees
                )

            return format_employee_field_list(
                employees,
                field,
            )


        # =================================================
        # 8. SPECIFIC EMPLOYEE FIELD
        # =================================================

        if intent is Intent.GET_EMPLOYEE_FIELD:

            employee_name = (
                extract_employee_name(
                    message
                )
            )

            field = (
                extract_employee_field(
                    message
                )
            )

            if not employee_name:

                return (
                    "Please provide the employee name."
                )

            if not field:

                return (
                    "Please specify which employee "
                    "information you want."
                )

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            employee = find_employee(
                employees,
                employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )

            return format_employee_field(
                employee,
                field,
            )


        # =================================================
        # 9. EMPLOYEE DETAILS
        # =================================================

        if intent is Intent.GET_EMPLOYEE_DETAILS:

            employee_name = (
                extract_employee_name(
                    message
                )
            )

            if not employee_name:

                return (
                    "Please provide the employee name."
                )

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            employee = find_employee(
                employees,
                employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )

            return format_employee_details(
                employee
            )


        # =================================================
        # 10. ALL TASKS
        # =================================================

        if intent is Intent.GET_TASKS:

            try:

                tasks = (
                    await self.crm.get_tasks()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_tasks(
                tasks
            )


        # =================================================
        # 11. TASKS BY EMPLOYEE
        # =================================================

        if intent is Intent.GET_TASKS_BY_EMPLOYEE:

            # =============================================
            # WHATSAPP "MY TASKS"
            # =============================================

            if (
                source == "whatsapp"
                and current_employee is not None
                and (
                    "my task" in message_lower
                    or "my tasks" in message_lower
                    or "my recent task" in message_lower
                    or "my recent tasks" in message_lower
                )
            ):

                employee = current_employee

                logger.info(
                    "Using WhatsApp identified employee "
                    "for tasks request_id=%s employee=%s",
                    request_id,
                    employee.get(
                        "employeeName"
                    ),
                )

            else:

                employee_name = (
                    extract_task_employee_name(
                        message
                    )
                )

                if not employee_name:

                    return (
                        "Please provide the employee name "
                        "to retrieve tasks."
                    )

                try:

                    employees = (
                        await self.crm.get_employees()
                    )

                except CrmServiceError as exc:

                    raise crm_http_exception(
                        exc
                    )

                employee = find_employee(
                    employees,
                    employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{employee_name}' "
                        f"in the CRM."
                    )


            # =============================================
            # GET EMPLOYEE ID
            # =============================================

            employee_id = employee.get(
                "_id"
            )

            if not employee_id:

                return (
                    f"The employee "
                    f"'{employee.get('employeeName')}' "
                    f"does not have a valid employee ID."
                )


            # =============================================
            # GET EMPLOYEE TASKS
            # =============================================

            try:

                tasks = (
                    await self.crm.get_recent_tasks(
                        employee_id
                    )
                )

            except CrmServiceError as exc:

                logger.exception(
                    "failed to get employee tasks "
                    "request_id=%s employee_id=%s",
                    request_id,
                    employee_id,
                )

                raise crm_http_exception(
                    exc
                )


            # =============================================
            # RESPONSE
            # =============================================

            return format_tasks(
                tasks,
                title=(
                    f"Recent Tasks - "
                    f"{employee.get('employeeName')}"
                ),
            )


        # =================================================
        # 12. TASK BY ID
        # =================================================

        if intent is Intent.GET_TASK:

            task_id = (
                extract_task_id(
                    message
                )
            )

            if not task_id:

                return (
                    "Please provide the task ID."
                )

            try:

                task = (
                    await self.crm.get_task(
                        task_id
                    )
                )

            except CrmServiceError as exc:

                if exc.status_code == 404:

                    return (
                        f"I could not find task "
                        f"'{task_id}' in the CRM."
                    )

                raise crm_http_exception(
                    exc
                )

            title = (
                task.get("title")
                or task.get("taskName")
                or task.get("name")
                or "Untitled task"
            )

            status = (
                task.get("status")
                or "Not available"
            )

            description = (
                task.get("description")
                or "Not available"
            )

            return (
                "Task Details\n\n"
                f"Task: {title}\n"
                f"Status: {status}\n"
                f"Description: {description}"
            )


        # =================================================
        # 13. CREATE TASK
        # =================================================

        if intent is Intent.CREATE_TASK:

            return (
                "I can help create a task, but I need "
                "the task details such as title, "
                "description, and assigned employee."
            )


        # =================================================
        # 14. UPDATE TASK
        # =================================================

        if intent is Intent.UPDATE_TASK:

            return (
                "I can help update a task, but I need "
                "the task ID and the information you want "
                "to change."
            )


        # =================================================
        # 15. ALL LEAVES
        # =================================================

        if intent is Intent.GET_LEAVES:

            try:

                leaves = (
                    await self.crm.get_leaves()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_leaves(
                leaves
            )


        # =================================================
        # 16. LEAVES BY EMPLOYEE
        # =================================================

        if intent is Intent.GET_LEAVES_BY_EMPLOYEE:

            employee_name = (
                extract_leave_employee_name(
                    message
                )
            )

            if not employee_name:

                return (
                    "Please provide the employee name "
                    "to retrieve leave records."
                )

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            employee = find_employee(
                employees,
                employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{employee_name}' "
                    f"in the CRM."
                )

            employee_id = employee.get(
                "_id"
            )

            try:

                leaves = (
                    await self.crm.get_leaves_by_employee(
                        employee_id
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_leaves(
                leaves,
                title=(
                    f"Leave Records - "
                    f"{employee.get('employeeName')}"
                ),
            )


        # =================================================
        # 17. CREATE LEAVE
        # =================================================

        if intent is Intent.CREATE_LEAVE:

            return (
                "I can help with a leave request, but I "
                "need the leave details such as start date, "
                "end date, and reason."
            )


        # =================================================
        # 18. UPDATE LEAVE
        # =================================================

        if intent is Intent.UPDATE_LEAVE:

            return (
                "I can help update a leave request, but "
                "I need the leave request ID and the "
                "information you want to change."
            )


        # =================================================
        # 19. UPDATE LEAVE STATUS
        # =================================================

        if intent is Intent.UPDATE_LEAVE_STATUS:

            return (
                "Leave status changes require the leave "
                "request ID and the new status."
            )


        # =================================================
        # 20. MY DETAILS
        # =================================================

        if intent is Intent.GET_MY_DETAILS:

            if (
                source == "whatsapp"
                and current_employee is not None
            ):

                return format_employee_details(
                    current_employee
                )

            return (
                "Your employee identity is not connected "
                "to the chatbot yet."
            )


        # =================================================
        # 21. GENERAL CHAT -> GEMINI
        # =================================================

        try:

            answer = (
                await self.ai.get_chat_response(
                    message
                )
            )

        except AiServiceError as exc:

            logger.warning(
                "Gemini request failed "
                "request_id=%s source=%s status=%d",
                request_id,
                source,
                exc.status_code,
            )

            try:

                await self.handoff.create_request(
                    message=message,
                    source=source,
                    conversation_id=conversation_id,
                )

            except Exception:

                logger.exception(
                    "failed to create human handoff"
                )

            return HR_HANDOFF_RESPONSE


        # =================================================
        # GEMINI UNKNOWN -> HUMAN HANDOFF
        # =================================================

        if (
            "I don't have enough information to answer that"
            in answer
        ):

            try:

                await self.handoff.create_request(
                    message=message,
                    source=source,
                    conversation_id=conversation_id,
                )

            except Exception:

                logger.exception(
                    "failed to create human handoff"
                )

            return HR_HANDOFF_RESPONSE


        # =================================================
        # FINAL RESPONSE
        # =================================================

        return answer