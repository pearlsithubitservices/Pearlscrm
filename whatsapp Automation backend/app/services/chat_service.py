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
    extract_payroll_employee_name,
    extract_payroll_status,
    extract_payroll_field,
    extract_payslip_month,
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
# RESPONSES
# =========================================================

UNWANTED_RESPONSE = (
    "Sorry, I can only assist with company-related questions "
    "such as employees, attendance, tasks, leave, payslips, "
    "and CRM-related information."
)


HR_HANDOFF_RESPONSE = (
    "Sorry, I don't have enough information to answer that. "
    "I can connect you with HR for further assistance."
)


WHATSAPP_PRIVACY_RESPONSE = (
    "For privacy reasons, I can only provide information "
    "related to your own employee account."
)


WHATSAPP_NOT_LINKED_RESPONSE = (
    "Your WhatsApp number is not linked to an employee "
    "account in the CRM."
)


# =========================================================
# SOURCE HELPERS
# =========================================================

def is_whatsapp_employee(
    source: str,
) -> bool:

    return source == "whatsapp"


# =========================================================
# EMPLOYEE HELPERS
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
# ATTENDANCE FIELD FORMATTER
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
# CRM ERROR
# =========================================================

def crm_http_exception(
    exc: CrmServiceError,
) -> HTTPException:

    return HTTPException(
        status_code=exc.status_code,
        detail=exc.message,
    )


# =========================================================
# TASK FORMATTER
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
# LEAVE FORMATTER
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


def filter_leaves_by_status(
    leaves: list[dict],
    status: str,
) -> list[dict]:

    normalized_status = (
        status
        .strip()
        .lower()
    )

    filtered_leaves = []

    for leave in leaves:

        leave_status = str(
            leave.get(
                "status",
                ""
            )
        ).strip().lower()

        if leave_status == normalized_status:

            filtered_leaves.append(
                leave
            )

    return filtered_leaves


# =========================================================
# PAYSLIP HELPERS
# =========================================================

def format_currency(
    value,
) -> str:

    if value is None or value == "":

        return "Not available"

    try:

        amount = float(
            value
        )

        return f"₹{amount:,.2f}"

    except (
        TypeError,
        ValueError,
    ):

        return str(
            value
        )


def format_payslip(
    payslip: dict,
    title: str = "Payslip Details",
) -> str:

    employee_name = (
        payslip.get("employeeName")
        or payslip.get("employee_name")
        or "Unknown employee"
    )

    month = (
        payslip.get("month")
        or "Not available"
    )

    lines = [
        title,
        "",
        f"Employee: {employee_name}",
        f"Month: {month}",
    ]

    employee_id = (
        payslip.get("employeeId")
        or payslip.get("employee_id")
    )

    if employee_id:

        lines.append(
            f"Employee ID: {employee_id}"
        )

    basic_salary = (
        payslip.get("basicSalary")
        or payslip.get("basic_salary")
    )

    if basic_salary is not None:

        lines.append(
            "Basic Salary: "
            f"{format_currency(basic_salary)}"
        )

    allowances = (
        payslip.get("allowances")
    )

    if allowances is not None:

        lines.append(
            "Allowances: "
            f"{format_currency(allowances)}"
        )

    deductions = (
        payslip.get("deductions")
    )

    if deductions is not None:

        lines.append(
            "Deductions: "
            f"{format_currency(deductions)}"
        )

    gross_salary = (
        payslip.get("grossSalary")
        or payslip.get("gross_salary")
    )

    if gross_salary is not None:

        lines.append(
            "Gross Salary: "
            f"{format_currency(gross_salary)}"
        )

    net_salary = (
        payslip.get("netSalary")
        or payslip.get("net_salary")
        or payslip.get("salary")
    )

    if net_salary is not None:

        lines.append(
            "Net Salary: "
            f"{format_currency(net_salary)}"
        )

    status = (
        payslip.get("status")
    )

    if status:

        lines.append(
            f"Status: {status}"
        )

    return "\n".join(
        lines
    )


def format_payslips(
    payslips: list[dict],
    title: str = "Payslips",
) -> str:

    if not payslips:

        return "No payslips found."

    lines = [
        title,
        "",
    ]

    for index, payslip in enumerate(
        payslips,
        start=1,
    ):

        employee_name = (
            payslip.get("employeeName")
            or payslip.get("employee_name")
            or "Unknown employee"
        )

        month = (
            payslip.get("month")
            or "Not available"
        )

        net_salary = (
            payslip.get("netSalary")
            or payslip.get("net_salary")
            or payslip.get("salary")
        )

        lines.append(
            f"{index}. {employee_name}"
        )

        lines.append(
            f"   Month: {month}"
        )

        if net_salary is not None:

            lines.append(
                "   Net Salary: "
                f"{format_currency(net_salary)}"
            )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# CHAT SERVICE
# =========================================================

class ChatService:

    def __init__(
        self,
        ai: AiService,
        crm: CrmService,
        handoff: HumanHandoffService,
    ):

        self.ai = ai
        self.crm = crm
        self.handoff = handoff


    async def process_message(
        self,
        message: str,
        source: str = "admin",
        conversation_id: str | None = None,
        employee_name: str | None = None,
        request_id: str | None = None,
        employee_phone: str | None = None,
    ) -> str:

        if request_id is None:

            request_id = str(
                uuid.uuid4()
            )

        started_at = time.monotonic()

        message = message.strip()

        if not message:

            return (
                "Please enter a message."
            )


        # =================================================
        # IDENTIFY WHATSAPP EMPLOYEE
        # =================================================

        current_employee = None

        if (
            is_whatsapp_employee(source)
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
        # UNWANTED TALK
        # =================================================

        if intent is Intent.UNWANTED_TALK:

            return UNWANTED_RESPONSE


        # =================================================
        # HUMAN HELP
        # =================================================

        if intent is Intent.HUMAN_HELP:

            try:

                handoff_request = (
                    await self.handoff.create_request(
                        message=message,
                        source=source,
                        conversation_id=conversation_id,
                        employee_name=(
                            current_employee.get(
                                "employeeName"
                            )
                            if current_employee
                            else employee_name
                        ),
                    )
                )

                logger.info(
                    "explicit human handoff created "
                    "request_id=%s handoff_id=%s",
                    request_id,
                    handoff_request.get("_id"),
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
        # ATTENDANCE FIELD
        # =================================================

        if intent is Intent.GET_ATTENDANCE_FIELD:

            field = extract_attendance_field(
                message
            )

            if not field:

                return (
                    "Please specify the attendance "
                    "information you want."
                )

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                requested_employee_name = (
                    extract_attendance_employee_name(
                        message
                    )
                )

                if not requested_employee_name:

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
                    requested_employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{requested_employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get("_id")

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
        # ATTENDANCE
        # =================================================

        if intent is Intent.GET_ATTENDANCE:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                requested_employee_name = (
                    extract_attendance_employee_name(
                        message
                    )
                )

                if not requested_employee_name:

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
                    requested_employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{requested_employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get("_id")

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
        # ACTIVE ATTENDANCE
        # =================================================

        if intent is Intent.GET_ACTIVE_ATTENDANCE:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

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
        # ATTENDANCE HISTORY
        # =================================================

        if intent is Intent.GET_ATTENDANCE_HISTORY:

            if is_whatsapp_employee(source):

                return (
                    "I can only provide your own attendance "
                    "information through WhatsApp."
                )

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
        # EMPLOYEES
        # =================================================

        if intent is Intent.GET_EMPLOYEES:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

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
        # EMPLOYEE FIELD LIST
        # =================================================

        if intent is Intent.GET_EMPLOYEE_FIELD_LIST:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

            try:

                employees = (
                    await self.crm.get_employees()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            field = extract_employee_list_field(
                message
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
        # EMPLOYEE FIELD
        # =================================================

        if intent is Intent.GET_EMPLOYEE_FIELD:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                field = extract_employee_field(
                    message
                )

                if not field:

                    return (
                        "Please specify which employee "
                        "information you want."
                    )

                return format_employee_field(
                    current_employee,
                    field,
                )

            employee_name_requested = (
                extract_employee_name(
                    message
                )
            )

            field = extract_employee_field(
                message
            )

            if not employee_name_requested:

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
                employee_name_requested,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{employee_name_requested}' "
                    f"in the CRM."
                )

            return format_employee_field(
                employee,
                field,
            )


        # =================================================
        # EMPLOYEE DETAILS
        # =================================================

        if intent is Intent.GET_EMPLOYEE_DETAILS:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                return format_employee_details(
                    current_employee
                )

            requested_employee_name = (
                extract_employee_name(
                    message
                )
            )

            if not requested_employee_name:

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
                requested_employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{requested_employee_name}' "
                    f"in the CRM."
                )

            return format_employee_details(
                employee
            )


        # =================================================
        # ALL TASKS
        # =================================================

        if intent is Intent.GET_TASKS:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
                )

                try:

                    tasks = (
                        await self.crm.get_recent_tasks(
                            employee_id
                        )
                    )

                except CrmServiceError as exc:

                    raise crm_http_exception(
                        exc
                    )

                return format_tasks(
                    tasks,
                    title=(
                        f"My Tasks - "
                        f"{current_employee.get('employeeName')}"
                    ),
                )

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
        # TASKS BY EMPLOYEE
        # =================================================

        if intent is Intent.GET_TASKS_BY_EMPLOYEE:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                requested_employee_name = (
                    extract_task_employee_name(
                        message
                    )
                )

                if not requested_employee_name:

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
                    requested_employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{requested_employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get(
                "_id"
            )

            if not employee_id:

                return (
                    f"The employee "
                    f"'{employee.get('employeeName')}' "
                    f"does not have a valid employee ID."
                )

            try:

                tasks = (
                    await self.crm.get_recent_tasks(
                        employee_id
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_tasks(
                tasks,
                title=(
                    f"Recent Tasks - "
                    f"{employee.get('employeeName')}"
                ),
            )


        # =================================================
        # TASK DETAILS
        # =================================================

        if intent is Intent.GET_TASK:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

            task_id = extract_task_id(
                message
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
        # CREATE TASK
        # =================================================

        if intent is Intent.CREATE_TASK:

            if is_whatsapp_employee(source):

                return (
                    "Task creation is not available "
                    "through the employee WhatsApp assistant."
                )

            return (
                "I can help create a task, but I need "
                "the task details such as title, "
                "description, and assigned employee."
            )


        # =================================================
        # UPDATE TASK
        # =================================================

        if intent is Intent.UPDATE_TASK:

            if is_whatsapp_employee(source):

                return (
                    "Task updates are not available "
                    "through the employee WhatsApp assistant."
                )

            return (
                "I can help update a task, but I need "
                "the task ID and the information you want "
                "to change."
            )


        # =================================================
        # APPROVED LEAVES
        # =================================================

        if intent is Intent.GET_APPROVED_LEAVES:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

            try:

                leaves = (
                    await self.crm.get_leaves()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            approved_leaves = (
                filter_leaves_by_status(
                    leaves,
                    "approved",
                )
            )

            return format_leaves(
                approved_leaves,
                title="Approved Leave Records",
            )


        # =================================================
        # PENDING LEAVES
        # =================================================

        if intent is Intent.GET_PENDING_LEAVES:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

            try:

                leaves = (
                    await self.crm.get_leaves()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            pending_leaves = (
                filter_leaves_by_status(
                    leaves,
                    "pending",
                )
            )

            return format_leaves(
                pending_leaves,
                title="Pending Leave Records",
            )


        # =================================================
        # REJECTED LEAVES
        # =================================================

        if intent is Intent.GET_REJECTED_LEAVES:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

            try:

                leaves = (
                    await self.crm.get_leaves()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            rejected_leaves = (
                filter_leaves_by_status(
                    leaves,
                    "rejected",
                )
            )

            return format_leaves(
                rejected_leaves,
                title="Rejected Leave Records",
            )


        # =================================================
        # ALL LEAVES
        # =================================================

        if intent is Intent.GET_LEAVES:

            if is_whatsapp_employee(source):

                return WHATSAPP_PRIVACY_RESPONSE

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
        # LEAVES BY EMPLOYEE
        # =================================================

        if intent is Intent.GET_LEAVES_BY_EMPLOYEE:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
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
                        f"My Leave Records - "
                        f"{current_employee.get('employeeName')}"
                    ),
                )

            requested_employee_name = (
                extract_leave_employee_name(
                    message
                )
            )

            if not requested_employee_name:

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
                requested_employee_name,
            )

            if employee is None:

                return (
                    f"I could not find an employee "
                    f"named '{requested_employee_name}' "
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
        # CREATE LEAVE
        # =================================================

        if intent is Intent.CREATE_LEAVE:

            return (
                "I can help with a leave request, but I "
                "need the leave details such as start date, "
                "end date, and reason."
            )


        # =================================================
        # UPDATE LEAVE
        # =================================================

        if intent is Intent.UPDATE_LEAVE:

            if is_whatsapp_employee(source):

                return (
                    "Leave updates are not available "
                    "through the employee WhatsApp assistant."
                )

            return (
                "I can help update a leave request, but "
                "I need the leave request ID and the "
                "information you want to change."
            )


        # =================================================
        # UPDATE LEAVE STATUS
        # =================================================

        if intent is Intent.UPDATE_LEAVE_STATUS:

            if is_whatsapp_employee(source):

                return (
                    "Leave status changes are handled "
                    "by the authorized company team."
                )

            return (
                "Leave status changes require the leave "
                "request ID and the new status."
            )


        # =================================================
        # PAYSLIP BY EMPLOYEE AND MONTH
        # IMPORTANT: CHECK BEFORE GENERAL PAYSLIP INTENT
        # =================================================

        if (
            intent
            is Intent.GET_PAYSLIP_BY_EMPLOYEE_AND_MONTH
        ):

            month = extract_payslip_month(
                message
            )

            if not month:

                return (
                    "Please specify the month "
                    "for the payslip."
                )

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                requested_employee_name = (
                    extract_payslip_employee_name(
                        message
                    )
                )

                if not requested_employee_name:

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
                    requested_employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{requested_employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get(
                "_id"
            )

            if not employee_id:

                return (
                    f"The employee "
                    f"'{employee.get('employeeName')}' "
                    f"does not have a valid employee ID."
                )

            try:

                payslip = (
                    await self.crm
                    .get_payslip_by_employee_and_month(
                        employee_id,
                        month,
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            if payslip is None:

                return (
                    f"No payslip was found for "
                    f"{employee.get('employeeName')} "
                    f"for {month}."
                )

            return format_payslip(
                payslip,
                title="Payslip Details",
            )


        # =================================================
        # PAYSLIPS BY EMPLOYEE
        # =================================================

        if intent is Intent.GET_PAYROLL_BY_EMPLOYEE:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                requested_employee_name = (
                    extract_payroll_employee_name(
                        message
                    )
                )

                if not requested_employee_name:

                    return (
                        "Please provide the employee name "
                        "to retrieve payslips."
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
                    requested_employee_name,
                )

                if employee is None:

                    return (
                        f"I could not find an employee "
                        f"named '{requested_employee_name}' "
                        f"in the CRM."
                    )

            employee_id = employee.get(
                "_id"
            )

            if not employee_id:

                return (
                    f"The employee "
                    f"'{employee.get('employeeName')}' "
                    f"does not have a valid employee ID."
                )

            try:

                payslips = (
                    await self.crm.get_payslips_by_employee(
                        employee_id
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_payslips(
                payslips,
                title=(
                    f"Payslips - "
                    f"{employee.get('employeeName')}"
                ),
            )


        # =================================================
        # ALL PAYSLIPS
        # =================================================

        if intent is Intent.GET_PAYSLIPS:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
                )

                if not employee_id:

                    return (
                        "Your employee account does not have "
                        "a valid employee ID."
                    )

                try:

                    payslips = (
                        await self.crm.get_payslips_by_employee(
                            employee_id
                        )
                    )

                except CrmServiceError as exc:

                    raise crm_http_exception(
                        exc
                    )

                return format_payslips(
                    payslips,
                    title=(
                        f"My Payslips - "
                        f"{current_employee.get('employeeName')}"
                    ),
                )

            try:

                payslips = (
                    await self.crm.get_payslips()
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            return format_payslips(
                payslips,
                title="All Payslips",
            )


        # =================================================
        # MY DETAILS
        # =================================================

        if intent is Intent.GET_MY_DETAILS:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                return format_employee_details(
                    current_employee
                )

            return (
                "Please specify the employee name "
                "you want to view."
            )


        # =================================================
        # AI FALLBACK
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
                    employee_name=(
                        current_employee.get(
                            "employeeName"
                        )
                        if current_employee
                        else employee_name
                    ),
                )

            except Exception:

                logger.exception(
                    "failed to create human handoff"
                )

            return HR_HANDOFF_RESPONSE


        if (
            "I don't have enough information to answer that"
            in answer
        ):

            try:

                await self.handoff.create_request(
                    message=message,
                    source=source,
                    conversation_id=conversation_id,
                    employee_name=(
                        current_employee.get(
                            "employeeName"
                        )
                        if current_employee
                        else employee_name
                    ),
                )

            except Exception:

                logger.exception(
                    "failed to create human handoff"
                )

            return HR_HANDOFF_RESPONSE


        elapsed_ms = (
            time.monotonic()
            - started_at
        ) * 1000

        logger.info(
            "message processing completed "
            "request_id=%s source=%s elapsed_ms=%.1f",
            request_id,
            source,
            elapsed_ms,
        )

        return answer