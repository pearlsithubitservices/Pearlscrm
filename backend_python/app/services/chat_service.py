import logging
import time
import uuid
import re

from fastapi import HTTPException

from app.services.ai_service import (
    AiService,
    AiServiceError,
)
from app.services.nlu_service import NLUService
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
    extract_task_status_update,
    extract_project_note_request,
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

    def normalize_phone(value) -> str:

        digits = "".join(
            character
            for character in str(value)
            if character.isdigit()
        )

        if digits.startswith("91") and len(digits) == 12:

            digits = digits[2:]

        return digits

    requested_phone = normalize_phone(
        phone
    )

    logger.info(
        "PHONE MATCH DEBUG: incoming=%s normalized=%s",
        phone,
        requested_phone,
    )

    for employee in employees:

        employee_phone = (
            employee.get("contact")
            or employee.get("phone")
            or employee.get("mobile")
            or employee.get("mobileNumber")
            or employee.get("profile", {}).get("phone")
            or ""
        )

        normalized_employee_phone = normalize_phone(
            employee_phone
        )

        logger.info(
            "PHONE MATCH DEBUG: employee=%s contact=%s phone=%s "
            "mobile=%s mobileNumber=%s profile_phone=%s normalized=%s",
            employee.get("employeeName"),
            employee.get("contact"),
            employee.get("phone"),
            employee.get("mobile"),
            employee.get("mobileNumber"),
            employee.get("profile", {}).get("phone"),
            normalized_employee_phone,
        )

        if (
            normalized_employee_phone
            and normalized_employee_phone == requested_phone
        ):

            logger.info(
                "PHONE MATCH SUCCESS: employee=%s phone=%s",
                employee.get("employeeName"),
                normalized_employee_phone,
            )

            return employee

    logger.warning(
        "PHONE MATCH FAILED: incoming=%s normalized=%s employees=%d",
        phone,
        requested_phone,
        len(employees),
    )

    return None


# =========================================================
# ATTENDANCE FIELD FORMATTER
# Supports new EmpAttendanceModel and old Attendance fields
# =========================================================

def format_attendance_field_response(
    employee: dict,
    attendance: list[dict],
    field: str,
) -> str:

    employee_name = (
        employee.get("employeeName")
        or employee.get("employee_name")
        or "Unknown"
    )

    if not attendance:
        return (
            "Attendance Details\n\n"
            f"Employee: {employee_name}\n\n"
            "No attendance records found."
        )

    record = attendance[0]

    breaks = record.get("breaks") or []
    latest_break = breaks[-1] if breaks else {}

    # Support both old and new attendance fields
    field_values = {
        "attendance_id": (
            record.get("_id")
            or record.get("id")
        ),

        "date": record.get("date"),

        "login_time": (
            record.get("clockIn")
            or record.get("login_time")
        ),

        "logout_time": (
            record.get("clockOut")
            or record.get("logout_time")
        ),

        "break_start": (
            latest_break.get("start")
            or record.get("break_start")
        ),

        "break_end": (
            latest_break.get("end")
            or record.get("break_end")
        ),

        "status": (
            record.get("attendanceState")
            or record.get("status")
        ),

        "total_work_seconds": (
            record.get("workingHours")
            if record.get("workingHours") is not None
            else record.get("total_work_seconds")
        ),
    }

    value = field_values.get(
        field,
        record.get(field),
    )

    # Convert working seconds into hours and minutes
    if field == "total_work_seconds":

        if value is None:
            value = "Not available"

        else:
            try:
                seconds = int(float(value))

                hours = seconds // 3600
                minutes = (seconds % 3600) // 60
                remaining_seconds = seconds % 60

                value = (
                    f"{hours}h "
                    f"{minutes}m "
                    f"{remaining_seconds}s"
                )

            except (TypeError, ValueError):
                value = str(value)

    # Convert missing values
    if value is None or value == "":
        value = "Not available"

    field_names = {
        "attendance_id": "Attendance ID",
        "date": "Date",
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
    tasks,
    employee_name="Employee",
    title=None,
):
    heading = title or f"My Tasks — {employee_name}"

    if not tasks:
        return (
            f"{heading}\n\n"
            "You don't have any tasks matching your request."
        )

    total = len(tasks)

    lines = [
        heading,
        "",
        f"{employee_name}, you currently have {total} tasks:",
    ]

    for index, task in enumerate(tasks, start=1):
        name = (
            task.get("title")
            or task.get("taskName")
            or task.get("name")
            or "Untitled task"
        )

        status = task.get("status") or "Not available"

        lines.append(f"{index}. {name} — {status}.")

    return "\n".join(lines)


def filter_tasks_for_message(
    tasks: list[dict],
    message: str,
) -> list[dict]:

    text = " ".join(message.strip().lower().split())

    # -----------------------------------------------------
    # 1. Filter by requested status
    # -----------------------------------------------------

    if re.search(
        r"\b(previous|past|finished previously)\b",
        text,
    ):
        allowed_statuses = {
            "completed", "complete", "done", "finished"
        }

    elif re.search(
        r"\b(incomplete|unfinished|not completed|"
        r"not finished|still incomplete|yet to complete)\b",
        text,
    ):
        allowed_statuses = {
            "pending", "in progress", "in-progress",
            "active", "ongoing", "assigned", "new"
        }

    elif re.search(r"\bpending\b", text):
        allowed_statuses = {"pending", "new"}

    elif re.search(
        r"\b(in progress|in-progress|ongoing)\b",
        text,
    ):
        allowed_statuses = {
            "in progress", "in-progress", "ongoing"
        }

    elif re.search(
        r"\b(completed|complete|finished|done)\b",
        text,
    ):
        allowed_statuses = {
            "completed", "complete", "done", "finished"
        }

    elif re.search(r"\b(current|currently)\b", text):
        allowed_statuses = {
            "pending", "in progress", "in-progress",
            "active", "ongoing", "assigned", "new"
        }

    else:
        allowed_statuses = None

    filtered_tasks = tasks

    # Normalize database status values before comparison.
    if allowed_statuses is not None:
        filtered_tasks = [
            task
            for task in filtered_tasks
            if str(task.get("status") or "")
            .strip()
            .lower()
            .replace("_", " ")
            in {
                status.replace("_", " ")
                for status in allowed_statuses
            }
        ]

   
    # -----------------------------------------------------
    # 2. Extract a specific task title
    # -----------------------------------------------------

    title_patterns = [
        # Is Animation Website completed?
        r"^(?:is|was|has)\s+(?:my\s+)?(.+?)"
        r"(?:\s+task)?\s+"
        r"(?:completed|complete|finished|done)[?.!]*$",

        # Have I completed Automation?
        r"^(?:have\s+i|did\s+i|have\s+we)\s+"
        r"(?:already\s+)?"
        r"(?:completed|complete|finished|done|finish)\s+"
        r"(.+?)[?.!]*$",

        # What is the status of Design UI for Arushuvai?
        r"^(?:what\s+is\s+the|what's\s+the)\s+"
        r"(?:status|progress)\s+of\s+"
        r"(?:my\s+)?(.+?)[?.!]*$",

        # Status of Animation Website
        r"^(?:status|progress)\s+of\s+"
        r"(?:my\s+)?(.+?)[?.!]*$",

        # Show my Animation Website task
        r"^(?:please\s+)?(?:show|get|find|display|list|"
        r"check|give|tell\s+me\s+about)\s+"
        r"(?:me\s+)?(?:my\s+)?(.+?)\s+tasks?[?.!]*$",

        # Tell me about my Automation task
        r"^(?:tell\s+me\s+about|describe)\s+"
        r"(?:my\s+)?(.+?)(?:\s+task)?[?.!]*$",

        # Show tasks for Automation
        r"^(?:show|list|get|find|display)\s+"
        r"(?:me\s+)?(?:my\s+)?tasks?\s+"
        r"(?:for|named|called)\s+(.+?)[?.!]*$",
        
         # What is my Automation task status?
         r"^(?:what\s+is|what's)\s+"
         r"(?:my\s+)?(.+?)\s+"
         r"(?:task\s+)?(?:status|progress)[?.!]*$",

         # Is Animation Website completed?
         r"^(?:is|was|has)\s+(?:my\s+)?(.+?)"
         r"(?:\s+task)?\s+"
         r"(?:completed|complete|finished|done)[?.!]*$",
    ]

    requested_title = None

    for pattern in title_patterns:
        match = re.search(pattern, text, re.IGNORECASE)

        if match:
            requested_title = match.group(1).strip()
            break

    # -----------------------------------------------------
    # 3. Normalize task titles
    # -----------------------------------------------------

    def normalize_task_title(value: str) -> str:

        value = str(value or "").casefold().strip()

        value = re.sub(
            r"[^\w\s]",
            " ",
            value,
        )

        return " ".join(value.split())

    if requested_title:

        requested_title = re.sub(
            r"^(?:the|my)\s+",
            "",
            requested_title,
            flags=re.IGNORECASE,
        ).strip()

        requested_title = re.sub(
            r"\s+(?:task|tasks)$",
            "",
            requested_title,
            flags=re.IGNORECASE,
        ).strip()

        normalized_requested = normalize_task_title(
            requested_title
        )

        general_queries = {
               "my","all","all my","assigned","my assigned","all assigned","all my assigned","current","currently",
               "previous","past","pending","completed","complete","finished","recent","in progress","incomplete","unfinished",
           }

        if normalized_requested and normalized_requested not in general_queries:

            matching_tasks = []

            for task in filtered_tasks:

                task_title = (
                    task.get("title")
                    or task.get("taskName")
                    or task.get("name")
                    or ""
                )

                normalized_database_title = normalize_task_title(
                    task_title
                )

                if normalized_database_title == normalized_requested:
                    matching_tasks.append(task)

            filtered_tasks = matching_tasks

    return filtered_tasks






# =========================================================
# LEAVE FORMATTER
# =========================================================


def format_leaves(
    leaves: list[dict],
    title: str = "Leave Records",
) -> str:

    if not leaves:
        return (
            f"{title}\n\n"
            "No matching leave records found."
        )

    lines = [title, ""]

    for index, leave in enumerate(leaves, start=1):

        employee = (
            leave.get("employeeName")
            or leave.get("employee_name")
            or (
                leave.get("employee", {}).get("employeeName")
                if isinstance(leave.get("employee"), dict)
                else leave.get("employee")
            )
            or "Unknown employee"
        )

        status = leave.get("status") or "Not available"

        leave_type = (
            leave.get("leaveType")
            or leave.get("leave_type")
            or leave.get("type")
            or "Not specified"
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

        reason = (
            leave.get("reason")
            or leave.get("leaveReason")
            or leave.get("description")
        )

        lines.append(f"{index}. Leave Request")
        lines.append(f"   Employee: {employee}")
        lines.append(f"   Status: {status}")
        lines.append(f"   Leave Type: {leave_type}")

        if start_date:
            lines.append(f"   Start Date: {start_date}")

        if end_date:
            lines.append(f"   End Date: {end_date}")

        if reason:
            lines.append(f"   Reason: {reason}")

        lines.append("")

    return "\n".join(lines).rstrip()



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
                "",
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

        lines.append(
            f"{index}. Payslip Details"
        )

        employee_name = (
            payslip.get("employeeName")
            or payslip.get("employee_name")
            or payslip.get("name")
        )

        if employee_name:

            lines.append(
                f"   Employee: {employee_name}"
            )

        employee_id = (
            payslip.get("employeeId")
            or payslip.get("employee_id")
            or payslip.get("empId")
        )

        if employee_id:

            lines.append(
                f"   Employee ID: {employee_id}"
            )

        month = payslip.get(
            "month"
        )

        if month:

            lines.append(
                f"   Month: {month}"
            )

        year = payslip.get(
            "year"
        )

        if year:

            lines.append(
                f"   Year: {year}"
            )

        basic_salary = (
            payslip.get("basicSalary")
            or payslip.get("basic_salary")
        )

        if basic_salary is not None:

            lines.append(
                "   Basic Salary: "
                f"{format_currency(basic_salary)}"
            )

        allowances = (
            payslip.get("allowances")
            or payslip.get("totalAllowances")
            or payslip.get("total_allowances")
        )

        if allowances is not None:

            lines.append(
                "   Allowances: "
                f"{format_currency(allowances)}"
            )

        deductions = (
            payslip.get("deductions")
            or payslip.get("totalDeductions")
            or payslip.get("total_deductions")
        )

        if deductions is not None:

            lines.append(
                "   Deductions: "
                f"{format_currency(deductions)}"
            )

        gross_salary = (
            payslip.get("grossSalary")
            or payslip.get("gross_salary")
            or payslip.get("gross")
        )

        if gross_salary is not None:

            lines.append(
                "   Gross Salary: "
                f"{format_currency(gross_salary)}"
            )

        net_salary = (
            payslip.get("netSalary")
            or payslip.get("net_salary")
            or payslip.get("salary")
        )

        if net_salary is not None:

            lines.append(
                "   Net Salary: "
                f"{format_currency(net_salary)}"
            )

        status = (
            payslip.get("status")
            or payslip.get("paymentStatus")
            or payslip.get("payment_status")
        )

        if status:

            lines.append(
                f"   Status: {status}"
            )

        paid_date = (
            payslip.get("paidDate")
            or payslip.get("paid_date")
            or payslip.get("paymentDate")
            or payslip.get("payment_date")
        )

        if paid_date:

            lines.append(
                f"   Paid Date: {paid_date}"
            )

        payslip_id = (
            payslip.get("_id")
            or payslip.get("id")
            or payslip.get("payslipId")
            or payslip.get("payslip_id")
        )

        if payslip_id:

            lines.append(
                f"   Payslip ID: {payslip_id}"
            )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# PROJECT FILTERING AND FORMATTING HELPERS
# =========================================================



def filter_projects_for_message(
    projects: list[dict],
    message: str,
) -> list[dict]:

    from datetime import date, datetime
    from difflib import SequenceMatcher

    text = " ".join(message.strip().lower().split())
    filtered = list(projects)

    def normalize(value):
        return " ".join(
            re.sub(r"[^a-z0-9]+", " ", str(value or "").lower()).split()
        )

    def get_status(project):
        return str(project.get("status") or "").strip().lower().replace("_", " ")

    def get_due_date(project):
        value = project.get("dueDate") or project.get("due_date")

        if not value:
            return None

        try:
            if isinstance(value, datetime):
                return value.date()

            if isinstance(value, date):
                return value

            value = str(value).strip()

            if value.endswith("Z"):
                value = value[:-1] + "+00:00"

            return datetime.fromisoformat(value).date()

        except (ValueError, TypeError, OverflowError):
            return None

    # 1. Project status filtering.
    if re.search(r"\b(completed|complete|finished|done)\b", text):
        filtered = [
            p for p in filtered
            if get_status(p) in {
                "completed", "complete", "finished", "done"
            }
        ]

    elif re.search(r"\bpending\b", text):
        filtered = [
            p for p in filtered
            if get_status(p) == "pending"
        ]

    elif re.search(
        r"\b(in progress|in-progress|ongoing|active)\b",
        text,
    ):
        filtered = [
            p for p in filtered
            if get_status(p) in {
                "in progress", "in-progress", "ongoing", "active"
            }
        ]

    # 2. Overdue / delayed projects.
    delayed_query = bool(re.search(
        r"\b(delayed|overdue|past due|late|missed deadline|"
        r"behind schedule|running late)\b",
        text,
    ))

    if delayed_query:
        today = date.today()

        filtered = [
            p for p in filtered
            if get_status(p) not in {
                "completed", "complete", "finished", "done"
            }
            and (
                (
                    get_due_date(p) is not None
                    and get_due_date(p) < today
                )
                or (
                    get_due_date(p) is None
                    and re.search(
                        r"\b(delayed|overdue|late)\b",
                        " ".join(
                            str(p.get(key) or "")
                            for key in ("risk", "riskStatus", "priority")
                        ).lower(),
                    )
                )
            )
        ]

    # 3. Next / upcoming project deadline.
    next_deadline_query = bool(re.search(
        r"\b(next|upcoming|nearest|earliest)\b.*"
        r"\b(deadline|due date|project)\b|"
        r"\b(next|upcoming|nearest)\s+project\s+deadline\b",
        text,
    ))

    if next_deadline_query:
        today = date.today()

        upcoming = [
            (p, get_due_date(p))
            for p in filtered
            if get_due_date(p) is not None
            and get_due_date(p) >= today
            and get_status(p) not in {
                "completed", "complete", "finished", "done"
            }
        ]

        if not upcoming:
            return []

        upcoming.sort(key=lambda item: item[1])
        return [upcoming[0][0]]

    # 4. Ignore general words that are not project titles.
    ignored_words = {
        "show", "find", "get", "display", "list", "search",
        "please", "me", "my", "mine", "the", "for", "to",
        "all", "assigned", "current", "currently", "what",
        "is", "are", "when", "how", "about", "tell", "give",
        "want", "check", "view", "can", "could", "you",
        "of", "and", "which", "who", "with", "on", "am",
        "i", "working", "work", "projects", "project",
        "progress", "completion", "deadline", "deadlines",
        "due", "date", "dates", "milestone", "milestones",
        "team", "teams", "member", "members", "teammates",
        "colleagues", "people", "status", "company",
        "details", "detail", "information", "info",
        "overview", "risk", "risks", "pending",
        "completed", "complete", "finished", "active",
        "ongoing", "in", "at", "delayed", "delay",
        "overdue", "late", "behind", "schedule",
        "running", "past", "missed", "any", "next",
        "upcoming", "nearest", "earliest", "myself",
        "me", "its", "their", "there",
    }

    message_words = [
        word for word in normalize(message).split()
        if word not in ignored_words
    ]

    # No project title specified: return all status-filtered projects.
    if not message_words:
        return filtered

    # 5. Match a specifically named project.
    matches = []

    for project in filtered:
        title = normalize(project.get("title") or "")
        title_words = title.split()

        if not title_words:
            continue

        matched = sum(
            1 for title_word in title_words
            if any(
                SequenceMatcher(
                    None, title_word, word
                ).ratio() >= (
                    0.85 if len(title_word) <= 4 else 0.78
                )
                for word in message_words
            )
        )

        score = matched / len(title_words)

        if (
            (len(title_words) == 1 and matched == 1)
            or (len(title_words) > 1 and matched >= 2 and score >= 0.5)
            or any(
                word in message_words
                and len(word) >= 6
                and sum(
                    word in normalize(p.get("title") or "").split()
                    for p in projects
                ) == 1
                for word in title_words
            )
        ):
            matches.append((project, score))

    if not matches:
        return []

    matches.sort(key=lambda item: item[1], reverse=True)

    best_score = matches[0][1]

    best_matches = [
        project
        for project, score in matches
        if abs(score - best_score) < 0.0001
    ]

    if len(best_matches) != 1:
        return []

    matched_project = best_matches[0]

    return [
        p for p in filtered
        if p is matched_project
    ]


def get_project_member(
    project: dict,
    employee_id: str,
) -> dict | None:

    members = project.get("members")

    if not isinstance(members, list):
        return None

    for member in members:
        if not isinstance(member, dict):
            continue

        member_uid = str(member.get("uid") or "").strip()

        if member_uid == str(employee_id).strip():
            return member

    return None


from datetime import datetime, date


def format_project_due_date(value):
    if not value:
        return "Not available"

    try:
        if isinstance(value, datetime):
            parsed_date = value
        elif isinstance(value, date):
            parsed_date = datetime.combine(value, datetime.min.time())
        else:
            date_string = str(value).strip()
            if date_string.endswith("Z"):
                date_string = date_string[:-1] + "+00:00"

            parsed_date = datetime.fromisoformat(date_string)

        return parsed_date.strftime("%d %b %Y")

    except (ValueError, TypeError, OverflowError):
        return str(value)

def format_employee_projects(
    projects: list[dict],
    employee: dict,
    employee_id: str,
    intent: Intent,
) -> str:

    employee_name = (
        employee.get("employeeName")
        or employee.get("name")
        or "Employee"
    )

    if not projects:
        return "No projects matching your request were found."

    if intent is Intent.GET_PROJECT_PROGRESS:
        heading = "My Project Progress"
    elif intent is Intent.GET_PROJECT_DEADLINES:
        heading = "My Project Deadlines"
    elif intent is Intent.GET_PROJECT_TEAM:
        heading = "My Project Teams"
    elif intent is Intent.GET_PROJECT_MILESTONES:
        heading = "My Project Milestones"
    else:
        heading = "My Projects"

    lines = [f"{heading} — {employee_name}", ""]

    for index, project in enumerate(projects, start=1):
        title = project.get("title") or "Untitled project"
        status = project.get("status") or "Not available"
        progress = project.get("progress")
        raw_due_date = project.get("dueDate")
        due_date = format_project_due_date(raw_due_date)
        company = project.get("company") or "Not available"

        member = get_project_member(project, employee_id)

        lines.append(f"{index}. {title}")

        if intent is Intent.GET_PROJECT_TEAM:
            members = project.get("members") or []

            if not members:
                lines.append("   Team: No team members listed.")
            else:
                lines.append("   Team:")

                for team_member in members:
                    if not isinstance(team_member, dict):
                        continue

                    name = (
                        team_member.get("name")
                        or team_member.get("employeeName")
                        or team_member.get("uid")
                        or "Unknown member"
                    )
                    role = team_member.get("role")

                    lines.append(
                        f"   - {name}"
                        + (f" — {role}" if role else "")
                    )

        elif intent is Intent.GET_PROJECT_MILESTONES:
            milestones = project.get("milestones") or []

            if not milestones:
                lines.append("   Milestones: Not available.")
            else:
                for milestone in milestones:
                    if isinstance(milestone, dict):
                        name = (
                            milestone.get("title")
                            or milestone.get("name")
                            or "Milestone"
                        )
                        if "status" in milestone and milestone.get("status"):
                            milestone_status = milestone.get("status")

                        elif "completed" in milestone:
                            milestone_status = (
                              "Completed"
                              if milestone.get("completed") is True
                              else "In Progress"
                        )

                        else:
                           milestone_status = "Not available"
                        lines.append(
                            f"   - {name}: {milestone_status}"
                        )
                    else:
                        lines.append(f"   - {milestone}")

        elif intent is Intent.GET_PROJECT_DEADLINES:
            
            lines.append(f"   Due Date: {due_date}")
            lines.append(f"   Status: {status}")

        elif intent is Intent.GET_PROJECT_PROGRESS:
            lines.append(
                f"   Project Progress: "
                f"{progress if progress is not None else 'Not available'}"
                + ("%" if progress is not None else "")
            )

            if member and member.get("progress") is not None:
                lines.append(
                    f"   My Progress: {member['progress']}%"
                )

            lines.append(f"   Status: {status}")

        else:
            lines.append(f"   Company: {company}")
            lines.append(f"   Status: {status}")

            if progress is not None:
                lines.append(f"   Progress: {progress}%")

            if due_date:
                lines.append(f"   Due Date: {due_date}")

        lines.append("")

    return "\n".join(lines).rstrip()

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
        self.nlu = NLUService(ai_service=ai)

    async def execute_automation_rule(
        self,
        rule: dict,
        message: str,
        source: str = "whatsapp",
        conversation_id: str | None = None,
        employee_name: str | None = None,
        request_id: str | None = None,
        employee_phone: str | None = None,
    ) -> str:
        """
        Execute an active Message automation rule.

        Supported actions:
        - Fetch Leave Balance
        - Task and project request actions
        - Route to HR
        - Assign to Human
        """

        if not rule:
            return ""

        # Never execute inactive rules.
        if str(rule.get("status", "")).strip().lower() != "active":
            logger.info(
                "Automation rule skipped because it is inactive rule=%s",
                rule.get("name"),
            )
            return ""

        # Only Message-triggered rules are handled here.
        if str(rule.get("trigger", "")).strip().lower() != "message":
            logger.info(
                "Automation rule skipped because trigger is not Message "
                "rule=%s trigger=%s",
                rule.get("name"),
                rule.get("trigger"),
            )
            return ""

        action = " ".join(
            str(rule.get("action", "")).strip().lower().replace("_", " ").split()
        )

        if not action:
            logger.warning(
                "Automation rule has no action rule=%s",
                rule.get("name"),
            )
            return ""

        logger.info(
            "Executing automation rule rule=%s action=%s",
            rule.get("name"),
            rule.get("action"),
        )

        # -----------------------------------------------------
        # ROUTE TO HR / ASSIGN TO HUMAN
        # -----------------------------------------------------
        hr_actions = {
            "route to hr",
            "assign to human",
            "human handoff",
            "handoff to hr",
            "send to hr",
            "connect to hr",
        }

        if action in hr_actions:
            try:
                handoff_employee_name = employee_name

                # If the caller did not supply an employee name,
                # try to identify the employee using the WhatsApp number.
                if not handoff_employee_name and employee_phone:
                    try:
                        employees = await self.crm.get_employees()
                        matched_employee = find_employee_by_phone(
                            employees,
                            employee_phone,
                        )
                        if matched_employee:
                            handoff_employee_name = (
                                matched_employee.get("employeeName")
                                or matched_employee.get("name")
                            )
                    except CrmServiceError:
                        logger.exception(
                            "Could not look up employee before HR handoff "
                            "request_id=%s",
                            request_id,
                        )

                handoff_request = await self.handoff.create_request(
                    message=message,
                    source=source,
                    conversation_id=conversation_id,
                    employee_name=handoff_employee_name,
                )

                logger.info(
                    "Automation handoff created "
                    "request_id=%s rule=%s handoff_id=%s employee=%s",
                    request_id,
                    rule.get("name"),
                    handoff_request.get("_id")
                    if isinstance(handoff_request, dict)
                    else None,
                    handoff_employee_name or "Unknown",
                )

                return (
                    "Your request has been sent to HR. "
                    "A human representative can assist you."
                )

            except Exception:
                logger.exception(
                    "Automation HR handoff failed "
                    "request_id=%s rule=%s",
                    request_id,
                    rule.get("name"),
                )
                # Return a response instead of an empty string so the
                # request does not silently fall through to the AI service.
                return (
                    "Sorry, I couldn't send your request to HR right now. "
                    "Please try again later."
                )

        # -----------------------------------------------------
        # FETCH LEAVE BALANCE
        # -----------------------------------------------------
        if action == "fetch leave balance":
            if not employee_phone:
                return (
                    "I couldn't identify your WhatsApp number. "
                    "Please contact HR."
                )

            try:
                employees = await self.crm.get_employees()
                employee = find_employee_by_phone(employees, employee_phone)

                if employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = str(
                    employee.get("_id")
                    or employee.get("id")
                    or employee.get("employeeId")
                    or ""
                ).strip()

                if not employee_id:
                    return (
                        "Your employee ID could not be found. "
                        "Please contact HR."
                    )

                balance = await self.crm.get_leave_balance(employee_id)

                resolved_employee_name = (
                    employee.get("employeeName")
                    or employee.get("name")
                    or "Employee"
                )

                personal = balance.get("personalLeave", 0)
                sick = balance.get("sickLeave", 0)
                annual = balance.get("annualLeave", 0)

                total = (
                    float(personal or 0)
                    + float(sick or 0)
                    + float(annual or 0)
                )

                return (
                    f"Hi {resolved_employee_name}, your leave balance is:\\n\\n"
                    f"Personal Leave: {personal} days\\n"
                    f"Sick Leave: {sick} days\\n"
                    f"Annual Leave: {annual} days\\n"
                    f"Total Remaining: {total:g} days"
                )

            except CrmServiceError as exc:
                logger.error(
                    "Could not fetch leave balance: %s",
                    exc.message,
                )

                if exc.status_code == 404:
                    return (
                        "Your leave balance record was not found. "
                        "Please contact HR."
                    )

                return (
                    "Sorry, I couldn't retrieve your leave balance "
                    "right now. Please try again later."
                )

            except Exception:
                logger.exception("Unexpected error fetching leave balance")
                return (
                    "Sorry, something went wrong while retrieving "
                    "your leave balance."
                )

        # -----------------------------------------------------
        # TASK AUTOMATION ACTIONS
        # -----------------------------------------------------
        task_actions = {
            "fetch my tasks",
            "fetch pending tasks",
            "fetch completed tasks",
            "update task status",
            "handle task request",
        }

        if action in task_actions:
            return await self.process_message(
                message=message,
                source=source,
                conversation_id=conversation_id,
                employee_name=employee_name,
                request_id=request_id,
                employee_phone=employee_phone,
            )

        # -----------------------------------------------------
        # PROJECT AUTOMATION ACTIONS
        # -----------------------------------------------------
        project_actions = {
            "fetch my projects",
            "fetch project progress",
            "fetch project deadlines",
            "fetch project team",
            "fetch project milestones",
            "handle project request",
        }

        if action in project_actions:
            return await self.process_message(
                message=message,
                source=source,
                conversation_id=conversation_id,
                employee_name=employee_name,
                request_id=request_id,
                employee_phone=employee_phone,
            )

        # -----------------------------------------------------
        # UNSUPPORTED ACTION
        # -----------------------------------------------------
        logger.warning(
            "Automation action is not implemented yet action=%s rule=%s",
            rule.get("action"),
            rule.get("name"),
        )

        return (
            "This automation action is not available yet. "
            "Please contact the administrator."
        )

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


        # =================================================
        # LOG START
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

        # Use Gemini NLU if existing detection returns GENERAL_CHAT
        if intent is Intent.GENERAL_CHAT:

            nlu_result = await self.nlu.understand_message(
                message
            )

            if nlu_result:

                if nlu_result.get("needs_clarification"):

                    clarification = (
                        nlu_result.get("clarification_question")
                    )

                    if clarification:
                        return clarification

                else:

                    nlu_intent = nlu_result.get("intent")

                    if (
                        nlu_intent
                        and nlu_intent is not Intent.GENERAL_CHAT
                    ):

                        intent = nlu_intent

                        logger.info(
                            "NLU identified intent=%s confidence=%.2f",
                            intent.value,
                            nlu_result.get("confidence", 0),
                        )

        # Log final detected intent
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
        # ACTIVE ATTENDANCE
        # =================================================

        if intent is Intent.GET_ACTIVE_ATTENDANCE:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

                employee_id = (
                    employee.get("uid")
                    or employee.get("employee_uid")
                    or employee.get("employeeId")
                    or employee.get("id")
                    or employee.get("_id")
                )

                if not employee_id:
                    return WHATSAPP_NOT_LINKED_RESPONSE

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
                    raise crm_http_exception(exc)

                return format_active_attendance(attendance)

            try:
                attendance = (
                    await self.crm.get_active_attendance()
                )

            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            return format_active_attendance(attendance)

        # =================================================
        # ATTENDANCE HISTORY
        # =================================================
        if intent is Intent.GET_ATTENDANCE_HISTORY:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

                employee_id = (
                   employee.get("uid")
                   or employee.get("employee_uid")
                   or employee.get("employeeId")
                   or employee.get("id")
                   or employee.get("_id")
                )

                if not employee_id:
                    return WHATSAPP_NOT_LINKED_RESPONSE

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
                    raise crm_http_exception(exc)

                return format_attendance_history(attendance)

            try:
                attendance = (
                    await self.crm.get_attendance_history()
                )

            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            return format_attendance_history(attendance)



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
                        await self.crm.get_employee_tasks(
                            employee_id
                        )
                    )

                except CrmServiceError as exc:

                    raise crm_http_exception(
                        exc
                    )

                tasks = filter_tasks_for_message(tasks, message)

                return format_tasks(
                   tasks,
                   employee_name=employee_name
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

        
        # =========================================================
        # TASK COUNT
        # =========================================================

        if intent is Intent.GET_TASK_COUNT:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:
                return (
                    "Task count is available through your "
                    "employee WhatsApp account."
                )

            employee_id = (
                employee.get("_id")
                or employee.get("id")
                or employee.get("uid")
            )

            if not employee_id:
                return WHATSAPP_NOT_LINKED_RESPONSE

            try:
                tasks = await self.crm.get_employee_tasks(
                    employee_id
                )

            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            employee_name = (
                employee.get("employeeName")
                or employee.get("name")
                or "Employee"
            )

            total_tasks = len(tasks)

            completed_statuses = {
                "completed",
                "complete",
                "finished",
                "done",
            }

            completed_tasks = sum(
                1
                for task in tasks
                if str(task.get("status") or "")
                .strip()
                .lower()
                .replace("_", " ") in completed_statuses
            )

            normalized_message = message.lower()

            if re.search(
                r"\b(?:completed|complete|finished|done)\b",
                normalized_message,
            ):
                return (
                    f"Task Summary — {employee_name}\n\n"
                    f"You have completed {completed_tasks} "
                    f"out of {total_tasks} tasks."
                )

            return (
                f"Task Summary — {employee_name}\n\n"
                f"You have {total_tasks} tasks assigned to you."
            )

        # =================================================
        # TASKS BY EMPLOYEE
        # =================================================
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
                    extract_task_employee_name(message)
                )

                if not requested_employee_name:
                    return (
                        "Please provide the employee name "
                        "to retrieve tasks."
                    )

                try:
                    employees = await self.crm.get_employees()

                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

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

            employee_id = (
                employee.get("_id")
                or employee.get("id")
                or employee.get("uid")
            )

            employee_ids = list(dict.fromkeys(
                str(employee.get(key)).strip()
                for key in ("_id", "id", "uid", "empId", "employeeId")
                if employee.get(key) not in (None, "")
            ))

            if not employee_ids:
                return (
                    f"The employee "
                    f"'{employee.get('employeeName')}' "
                    f"does not have a valid employee ID."
                )

            try:
                tasks = await self.crm.get_employee_tasks(
                    employee_id
                )

            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            tasks = filter_tasks_for_message(tasks, message)

            employee_name = (
                employee.get("employeeName")
                or employee.get("name")
                or "Employee"
            )

            return format_tasks(
                tasks,
                employee_name=employee_name,
                title=f"My Tasks — {employee_name}",
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
            update_request = extract_task_status_update(message)

            if is_whatsapp_employee(source):
                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                if update_request is None:
                    return (
                        f"{employee_name}, use this format to update your task:\n"
                        "mark Animation Website as completed\n"
                        "change Animation Website to in progress\n"
                        "mark Animation Website as pending"
                    )

                task_title, new_status = update_request

                employee_id = str(current_employee.get("_id") or "")
                if not employee_id:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                try:
                    # This list is already restricted to the logged-in employee.
                    # Do not apply the normal task-query status filter here: the
                    # status in an update command is the TARGET status, not the
                    # task's current status.
                    tasks = await self.crm.get_employee_tasks(employee_id)
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                # Match the complete task title, ignoring case and extra spaces.
                normalize_title = lambda value: " ".join(
                    str(value or "").strip().casefold().split()
                )

                matching_tasks = [
                    task for task in tasks
                    if normalize_title(
                        task.get("title") or task.get("taskName")
                    ) == normalize_title(task_title)
                ]

                if not matching_tasks:
                    return (
                        f"{employee_name}, I couldn't find an assigned task "
                        f"with the exact title '{task_title}'. "
                        "Please check the task title and try again."
                    )

                if len(matching_tasks) > 1:
                    return (
                        f"{employee_name}, multiple assigned tasks have the "
                        f"title '{task_title}'. Please contact your admin "
                        "to distinguish them before updating."
                    )

                task = matching_tasks[0]
                task_id = task.get("_id") or task.get("id")

                if not task_id:
                    return (
                        "I couldn't identify this task in the CRM. "
                        "Please contact your admin."
                    )

                old_status = task.get("status", "Unknown")

                try:
                    updated_task = await self.crm.update_task_status(
                        str(task_id),
                        new_status,
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                if str(updated_task.get("status", "")).casefold() != new_status.casefold():
                    return (
                        "The CRM did not confirm the requested status change. "
                        "Please check the task in the CRM."
                    )

                return (
                    f"{employee_name}, task '{task.get('title', task_title)}' "
                    f"status updated from {old_status} to {new_status}."
                )

            return (
                "I can help update a task, but I need the task ID and "
                "the information you want to change."
            )
       
        # =================================================
        # DELETE TASK
        # =================================================

        if intent is Intent.DELETE_TASK:
            # No task-deletion CRM operation is used or defined in this
            # service. Do not attempt an unverified CRM write.
            if is_whatsapp_employee(source):
                return (
                    "Task deletion is not available through the "
                    "employee WhatsApp assistant."
                )

            return (
                "Task deletion is not currently supported "
                "through this assistant."
            )


        # =================================================
        # PROJECT NOTES
        # =================================================

        project_note_intents = {
            Intent.GET_PROJECT_NOTES,
            Intent.CREATE_PROJECT_NOTE,
            Intent.UPDATE_PROJECT_NOTE,
            Intent.DELETE_PROJECT_NOTE,
        }

        if intent in project_note_intents:

            if not is_whatsapp_employee(source):
                return (
                    "Project notes through WhatsApp are "
                    "available only to linked employees."
                )

            if current_employee is None:
                return WHATSAPP_NOT_LINKED_RESPONSE

            employee_id = str(
                current_employee.get("_id")
                or current_employee.get("id")
                or ""
            ).strip()

            if not employee_id:
                return (
                    "Your employee account does not have "
                    "a valid employee ID."
                )

            note_request = extract_project_note_request(message)

            if not note_request:
                return (
                    "Please use one of these formats:\n"
                    "Add note to Arushuvai Website: Homepage design completed\n"
                    "Show my notes for Arushuvai Website\n"
                    "Update note 1 for Arushuvai Website: Homepage design reviewed"
                )

            project_title = " ".join(
                note_request["project_title"].casefold().split()
            )

            try:
                projects = await self.crm.get_projects_by_employee(
                    employee_id
                )
            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            matching_projects = [
                project
                for project in projects
                if " ".join(
                    str(project.get("title", "")).casefold().split()
                ) == project_title
            ]

            if not matching_projects:
                return (
                    f"I couldn't find the assigned project "
                    f"'{note_request['project_title']}'. "
                    "Please check the project title."
                )

            if len(matching_projects) > 1:
                return (
                    "More than one assigned project has that title. "
                    "Please contact your CRM administrator."
                )

            project = matching_projects[0]
            project_id = str(project.get("_id") or "").strip()

            if not project_id:
                return "The project does not have a valid project ID."

            notes = project.get("notes") or []

            if not isinstance(notes, list):
                notes = []

            action = note_request["action"]

            if action == "view":
                if not notes:
                    return (
                        f"No notes have been added to "
                        f"{project.get('title', 'this project')} yet."
                    )

                lines = [
                    f"Project Notes - {project.get('title', 'Project')}"
                ]

                for index, note in enumerate(notes, start=1):
                    if not isinstance(note, dict):
                        continue

                    title = str(note.get("title") or "Note")
                    description = str(
                        note.get("description") or ""
                    )
                    date_text = str(note.get("date") or "")

                    lines.append(f"\n{index}. {title}")

                    if description:
                        lines.append(description)

                    if date_text:
                        lines.append(f"Date: {date_text}")

                return "\n".join(lines)

            if action == "create":
                note_text = note_request["note_text"].strip()

                if not note_text:
                    return "Please provide the note content."

                new_note = {
                    "title": (
                        note_request.get("note_title") or note_text[:60].strip()
                        or "WhatsApp Note"
                    ),
                    "description": note_text,
                    "date": datetime.now().strftime(
                        "%d %b %Y, %I:%M %p"
                    ),
                }

                updated_notes = [new_note, *notes]

                try:
                    await self.crm.update_project_note(
                        project_id,
                        updated_notes,
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                return (
                    f"Note added successfully to "
                    f"{project.get('title', 'the project')}."
                )

            if action == "update":
                note_number = note_request.get("note_number")

                if (
                    not isinstance(note_number, int)
                    or note_number < 1
                    or note_number > len(notes)
                ):
                    return (
                        f"Invalid note number. This project currently "
                        f"has {len(notes)} notes."
                    )

                note_index = note_number - 1
                target_note = notes[note_index]

                if not isinstance(target_note, dict):
                    return "The selected note has invalid data."

                updated_note = dict(target_note)
                updated_note["description"] = (
                    note_request["note_text"].strip()
                )

                updated_notes = list(notes)
                updated_notes[note_index] = updated_note

                try:
                    await self.crm.update_project_note(
                        project_id,
                        updated_notes,
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                return (
                    f"Note {note_number} updated successfully for "
                    f"{project.get('title', 'the project')}."
                )
            
            if action == "delete":
                note_number = note_request.get("note_number")

                if (
                    not isinstance(note_number, int)
                    or note_number < 1
                    or note_number > len(notes)
                ):
                    return (
                        f"Invalid note number. This project currently "
                        f"has {len(notes)} notes."
                    )

                note_index = note_number - 1
                target_note = notes[note_index]

                if not isinstance(target_note, dict):
                    return "The selected note has invalid data."

                updated_notes = [
                    note
                    for index, note in enumerate(notes)
                    if index != note_index
                ]

                try:
                    await self.crm.update_project_note(
                        project_id,
                        updated_notes,
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                return (
                    f"Note {note_number} deleted successfully from "
                    f"{project.get('title', 'the project')}."
                )


        # =================================================
        # MY PROJECTS
        # =================================================

        
        project_intents = {
            Intent.GET_PROJECTS,
            Intent.GET_PROJECT_PROGRESS,
            Intent.GET_PROJECT_DEADLINES,
            Intent.GET_PROJECT_TEAM,
            Intent.GET_PROJECT_MILESTONES,
        }

        if intent in project_intents:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = str(
                    current_employee.get("_id")
                    or current_employee.get("id")
                    or current_employee.get("uid")
                    or ""
                ).strip()

                employee_ids = list(dict.fromkeys(
                    str(current_employee.get(key)).strip()
                    for key in ("_id", "id", "uid", "empId", "employeeId")
                    if current_employee.get(key) not in (None, "")
                ))

                if not employee_ids:
                    return (
                        "Your employee account does not have "
                        "a valid employee ID."
                    )

                try:
                    projects = (
                        await self.crm.get_projects_by_employee(
                            employee_ids
                        )
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                # Apply filters only to the employee's assigned projects.
                projects = filter_projects_for_message(
                    projects,
                    message,
                )

                return format_employee_projects(
                    projects=projects,
                    employee=current_employee,
                    employee_id=employee_id,
                    intent=intent,
                )

            return (
                "Project viewing through this command is "
                "currently available to linked employees "
                "on WhatsApp."
            )


       
        # =================================================
        # MY FOLLOW-UPS
        # =================================================

        if intent is Intent.GET_FOLLOWUPS:

            # Keep existing WhatsApp employee privacy checks.
            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:
                return WHATSAPP_PRIVACY_RESPONSE

            employee_name_display = (
                employee.get("employeeName")
                or employee.get("name")
                or "Employee"
            )

            try:
                followups = (
                    await self.crm.get_followups_by_employee(
                        employee
                    )
                )
            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            if not followups:
                return (
                    "No follow-ups are currently assigned "
                    "to you."
                )

            # Normalize the incoming message.
            text = " ".join(message.strip().lower().split())

            today = datetime.now().date()
            timedelta = __import__("datetime").timedelta

            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=6)

            # Convert supported date values to Python dates.
            def parse_followup_date(value):
                if not value:
                    return None

                if isinstance(value, datetime):
                    return value.date()

                if isinstance(value, __import__("datetime").date):
                    return value

                value_text = str(value).strip()

                if not value_text:
                    return None

                # Try ISO dates and ISO datetime values first.
                try:
                    parsed_datetime = datetime.fromisoformat(
                        value_text.replace("Z", "+00:00")
                    )
                    return parsed_datetime.date()
                except (ValueError, TypeError):
                    pass

                # Support common CRM date formats.
                for date_format in (
                    "%Y-%m-%d",
                    "%d-%m-%Y",
                    "%d/%m/%Y",
                    "%m/%d/%Y",
                    "%d %b %Y",
                    "%d %B %Y",
                ):
                    try:
                        return datetime.strptime(
                            value_text, date_format
                        ).date()
                    except (ValueError, TypeError):
                        continue

                return None

            def get_due_date(followup):
                # Prefer nextFollowupDate; fall back to date.
                parsed = parse_followup_date(
                    followup.get("nextFollowupDate")
                )

                if parsed is None:
                    parsed = parse_followup_date(
                        followup.get("date")
                    )

                return parsed

            def is_completed(followup):
                status = str(
                    followup.get("status") or ""
                ).strip().lower()

                return (
                    followup.get("isCompleted") is True
                    or status in {
                        "completed",
                        "complete",
                        "done",
                        "finished",
                    }
                )

            def get_client_name(followup):
                return str(
                    followup.get("clientName") or ""
                ).strip()

            # Start with the employee's assigned follow-ups.
            filtered_followups = list(followups)
            heading = "My Follow-ups"

            # 1. Pending follow-ups.
            if re.search(r"\bpending\b", text):
                filtered_followups = [
                    f for f in filtered_followups
                    if not is_completed(f)
                    and str(
                        f.get("status") or ""
                    ).strip().lower()
                    in {
                        "pending",
                        "new",
                        "scheduled",
                        "in progress",
                    }
                ]
                heading = "My Pending Follow-ups"

            # 2. Completed follow-ups.
            elif re.search(
                r"\b(completed|complete|finished|done)\b",
                text,
            ):
                filtered_followups = [
                    f for f in filtered_followups
                    if is_completed(f)
                ]
                heading = "My Completed Follow-ups"

            # 3. Overdue follow-ups.
            elif re.search( r"\bover[\s-]*due\b|\bpast[\s-]+due\b", text):
                filtered_followups = [
                    f for f in filtered_followups
                    if not is_completed(f)
                    and get_due_date(f) is not None
                    and get_due_date(f) < today
                ]
                heading = "My Overdue Follow-ups"

            # 4. Today's follow-ups.
            elif re.search(r"\btoday\b|\bdue today\b", text):
                filtered_followups = [
                    f for f in filtered_followups
                    if get_due_date(f) == today
                ]
                heading = "My Follow-ups Today"

           
            # 5. This week's follow-ups.
            elif re.search(
                r"\bthis week\b|\bfor the week\b",
                text,
            ):
                weekly_followups = []

                for followup in filtered_followups:
                    due_date = get_due_date(followup)

                    if (
                        due_date is not None
                        and week_start <= due_date <= week_end
                    ):
                        weekly_followups.append(followup)

                filtered_followups = weekly_followups
                heading = "My Follow-ups This Week"
 

            # 6. Upcoming follow-ups.
            elif re.search(r"\bupcoming\b|\bcoming up\b", text):
                filtered_followups = [
                    f for f in filtered_followups
                    if not is_completed(f)
                    and get_due_date(f) is not None
                    and get_due_date(f) > today
                ]
                heading = "My Upcoming Follow-ups"

            # 7. Recent follow-ups: latest created first.
            elif re.search(
                r"\brecent\b|\brecently created\b",
                text,
            ):

                def get_created_at(followup):
                    value = followup.get("createdAt")

                    if isinstance(value, datetime):
                        return value.replace(tzinfo=None)

                    if value:
                        try:
                            return datetime.fromisoformat(
                                str(value).replace("Z", "+00:00")
                            ).replace(tzinfo=None)
                        except (ValueError, TypeError):
                            pass

                    return datetime.min

                filtered_followups = sorted(
                    filtered_followups,
                    key=get_created_at,
                    reverse=True,
                )[:5]

                heading = "My Recent Follow-ups"

            # 8. Customer-specific follow-ups.
            else:
                customer_match = re.search(
                    r"\bfollow[\s-]*ups?\s+for\s+(.+?)\s*$",
                    text,
                    re.IGNORECASE,
                )

                if customer_match:
                    requested_customer = (
                        customer_match.group(1).strip(" .?!")
                    )

                    ignored_customer_phrases = {
                        "today",
                        "this week",
                        "this month",
                        "the week",
                        "me",
                        "myself",
                    }

                    if (
                        requested_customer
                        and requested_customer.casefold()
                        not in ignored_customer_phrases
                    ):
                        normalized_customer = " ".join(
                            requested_customer.casefold().split()
                        )

                        filtered_followups = [
                            f for f in filtered_followups
                            if normalized_customer
                            in " ".join(
                                get_client_name(f).casefold().split()
                            )
                        ]

                        heading = (
                            f"My Follow-ups for {requested_customer}"
                        )

                # 9. Details request.
                if re.search(
                    r"\bdetails?\b|\binformation\b",
                    text,
                ):
                    if len(filtered_followups) > 1:
                        clients = []

                        for f in filtered_followups:
                            name = (
                                get_client_name(f)
                                or "Unknown client"
                            )

                            if name not in clients:
                                clients.append(name)

                        if clients:
                            return (
                                f"You have {len(filtered_followups)} "
                                "follow-ups. Which customer would "
                                "you like details for?\n\n"
                                + "\n".join(
                                    f"{index}. {name}"
                                    for index, name in enumerate(
                                        clients, start=1
                                    )
                                )
                                + "\n\nExample: show my follow-ups "
                                f"for {clients[0]}"
                            )

                    heading = "My Follow-up Details"

            # 10. Return a useful response when nothing matches.
            if not filtered_followups:
                return (
                    f"{heading}\n\n"
                    "No matching follow-ups were found."
                )

            lines = [
                f"{heading} - {employee_name_display}",
                "",
            ]

            for index, followup in enumerate(
                filtered_followups,
                start=1,
            ):
                client_name = (
                    followup.get("clientName")
                    or "Not available"
                )

                company_name = (
                    followup.get("companyName")
                    or "Not available"
                )

                status = (
                    followup.get("status")
                    or "Not available"
                )

                followup_type = (
                    followup.get("type")
                    or "Not available"
                )

                # Use a separate name for the date value.
                raw_followup_date = (
                    followup.get("nextFollowupDate")
                    or followup.get("date")
                )

                due_date = get_due_date(followup)

                display_date = (
                    due_date.isoformat()
                    if due_date
                    else str(
                        raw_followup_date or "Not available"
                    )
                )

                followup_time = (
                    followup.get("followupTime") or ""
                )

                notes = followup.get("notes") or ""

                lines.append(f"{index}. Follow-up")
                lines.append(f"   Client: {client_name}")
                lines.append(f"   Company: {company_name}")
                lines.append(f"   Status: {status}")
                lines.append(f"   Type: {followup_type}")
                lines.append(f"   Date: {display_date}")

                if followup_time:
                    lines.append(f"   Time: {followup_time}")

                if notes:
                    lines.append(f"   Notes: {notes}")

                lines.append("")

            return "\n".join(lines).rstrip()


        # =================================================
        # MY MEETINGS
        # =================================================

        if intent is Intent.GET_MEETINGS:

            if is_whatsapp_employee(source):

                if current_employee is None:

                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:

                return WHATSAPP_PRIVACY_RESPONSE

            try:

                meetings = (
                    await self.crm.get_meetings_by_employee(
                        employee
                    )
                )

            except CrmServiceError as exc:

                raise crm_http_exception(
                    exc
                )

            if not meetings:

                return (
                    f"No meetings are currently scheduled "
                    f"for {employee.get('employeeName', 'you')}."
                )

            employee_name = (
                employee.get("employeeName")
                or employee.get("name")
                or "Employee"
            )

            lines = [
                f"My Meetings - {employee_name}",
                "",
            ]

            for index, meeting in enumerate(
                meetings,
                start=1,
            ):

                title = (
                    meeting.get("title")
                    or meeting.get("name")
                    or "Meeting"
                )

                meeting_type = (
                    meeting.get("type")
                    or "Not available"
                )

                status = (
                    meeting.get("status")
                    or "Not available"
                )

                priority = (
                    meeting.get("priority")
                    or "Not available"
                )

                date = (
                    meeting.get("date")
                    or meeting.get("meetingDate")
                    or "Not available"
                )

                start_time = (
                    meeting.get("startTime")
                    or meeting.get("start_time")
                )

                end_time = (
                    meeting.get("endTime")
                    or meeting.get("end_time")
                )

                location = (
                    meeting.get("location")
                    or "Not available"
                )

                lines.append(
                    f"{index}. {title}"
                )

                lines.append(
                    f"   Type: {meeting_type}"
                )

                lines.append(
                    f"   Status: {status}"
                )

                lines.append(
                    f"   Priority: {priority}"
                )

                lines.append(
                    f"   Date: {date}"
                )

                if start_time and end_time:

                    lines.append(
                        f"   Time: {start_time} - {end_time}"
                    )

                elif start_time:

                    lines.append(
                        f"   Time: {start_time}"
                    )

                lines.append(
                    f"   Location: {location}"
                )

                agenda = meeting.get(
                    "agenda"
                )

                if agenda:

                    lines.append(
                        f"   Agenda: {agenda}"
                    )

                project = meeting.get(
                    "project"
                )

                if project:

                    if isinstance(
                        project,
                        dict,
                    ):

                        project_name = (
                            project.get("title")
                            or project.get("name")
                            or ""
                        )

                    else:

                        project_name = str(
                            project
                        )

                    if project_name:

                        lines.append(
                            f"   Project: {project_name}"
                        )

                client = meeting.get(
                    "client"
                )

                if client:

                    if isinstance(
                        client,
                        dict,
                    ):

                        client_name = (
                            client.get("name")
                            or client.get("clientName")
                            or client.get("companyName")
                            or ""
                        )

                    else:

                        client_name = str(
                            client
                        )

                    if client_name:

                        lines.append(
                            f"   Client: {client_name}"
                        )

                lines.append("")

            return "\n".join(
                lines
            ).rstrip()


        
        # =================================================
        # APPROVED LEAVES
        # =================================================

        if intent is Intent.GET_APPROVED_LEAVES:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
                    or current_employee.get("id")
                )

                if not employee_id:
                    return "Your employee account does not have a valid employee ID."

                try:
                    leaves = await self.crm.get_leaves_by_employee(
                        employee_id
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = (
                    f"My Approved Leaves - "
                    f"{current_employee.get('employeeName', 'Employee')}"
                )

            else:
                try:
                    leaves = await self.crm.get_leaves()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = "Approved Leave Records"

            return format_leaves(
                filter_leaves_by_status(leaves, "approved"),
                title=title,
            )

        # =================================================
        # PENDING LEAVES
        # =================================================

        if intent is Intent.GET_PENDING_LEAVES:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
                    or current_employee.get("id")
                )

                if not employee_id:
                    return "Your employee account does not have a valid employee ID."

                try:
                    leaves = await self.crm.get_leaves_by_employee(
                        employee_id
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = (
                    f"My Pending Leaves - "
                    f"{current_employee.get('employeeName', 'Employee')}"
                )

            else:
                try:
                    leaves = await self.crm.get_leaves()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = "Pending Leave Records"

            return format_leaves(
                filter_leaves_by_status(leaves, "pending"),
                title=title,
            )

        # =================================================
        # REJECTED LEAVES
        # =================================================

        if intent is Intent.GET_REJECTED_LEAVES:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = (
                    current_employee.get("_id")
                    or current_employee.get("id")
                )

                if not employee_id:
                    return "Your employee account does not have a valid employee ID."

                try:
                    leaves = await self.crm.get_leaves_by_employee(
                        employee_id
                    )
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = (
                    f"My Rejected Leaves - "
                    f"{current_employee.get('employeeName', 'Employee')}"
                )

            else:
                try:
                    leaves = await self.crm.get_leaves()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = "Rejected Leave Records"

            return format_leaves(
                filter_leaves_by_status(leaves, "rejected"),
                title=title,
            )

        # =================================================
        # WHATSAPP LEAVE BALANCE
        # =================================================

        normalized_message = " ".join(
            message.lower().strip().split()
        )

        balance_phrases = [
            "leave balance",
            "balance of my leave",
            "what is my balance",
            "how many leaves do i have",
            "how many leave do i have",
            "remaining leaves",
            "remaining leave",
            "leaves remaining",
        ]

        if (
            is_whatsapp_employee(source)
            and any(
                phrase in normalized_message
                for phrase in balance_phrases
            )
        ):
            if current_employee is None:
                return WHATSAPP_NOT_LINKED_RESPONSE

            employee_id = (
                current_employee.get("_id")
                or current_employee.get("id")
            )

            if not employee_id:
                return (
                    "I couldn't identify your employee record. "
                    "Please contact HR."
                )

            try:
                balance = await self.crm.get_leave_balance(
                    employee_id
                )
            except CrmServiceError as exc:
                logger.exception(
                    "Failed to retrieve leave balance for employee=%s: %s",
                    employee_id,
                    exc,
                )
                return (
                    "Sorry, I couldn't retrieve your leave balance "
                    "right now. Please try again later."
                )

            return (
                f"Your Leave Balance - "
                f"{current_employee.get('employeeName', 'Employee')}\n\n"
                f"Personal Leave: {balance.get('personalLeave', 0)}\n"
                f"Sick Leave: {balance.get('sickLeave', 0)}\n"
                f"Annual Leave: {balance.get('annualLeave', 0)}"
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
        # PAYROLL DETAILS / PAYROLL STATUS
        # =================================================

        if intent in {
            Intent.GET_PAYROLL_DETAILS,
            Intent.GET_PAYROLL_STATUS,
        }:
            if is_whatsapp_employee(source):
                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee = current_employee

            else:
                requested_employee_name = (
                    extract_payroll_employee_name(message)
                )
                requested_payroll_field = extract_payroll_field(message)

                if requested_employee_name and requested_payroll_field:
                    field_name_suffixes = {
                        "basicSalary": ("basic salary", "basic"),
                        "medical": ("medical allowance", "medical"),
                        "performanceBonus": (
                            "performance bonus",
                            "bonus",
                        ),
                        "conveyance": ("conveyance",),
                        "pf": ("pf", "provident fund"),
                        "esi": ("esi",),
                        "tds": ("tds",),
                        "professionalTax": ("professional tax",),
                        "gross": ("gross salary", "gross"),
                        "totalDeductions": (
                            "total deductions",
                            "deductions",
                        ),
                        "net": ("net salary", "net"),
                    }

                    for suffix in field_name_suffixes.get(
                        requested_payroll_field,
                        (),
                    ):
                        requested_employee_name = re.sub(
                            rf"\\s+{re.escape(suffix)}$",
                            "",
                            requested_employee_name,
                            flags=re.IGNORECASE,
                        ).strip()

                if requested_employee_name:
                    requested_employee_name = re.sub(
                        r"['’]s$",
                        "",
                        requested_employee_name,
                    ).strip()

                # The intent-service extractor can capture a possessive
                # self-reference such as "my net" as a person's name.
                if (
                    not requested_employee_name
                    or requested_employee_name.casefold() in {
                        "my", "me", "i", "myself", "all", "employees"
                    }
                    or requested_employee_name.casefold().startswith(
                        ("my ", "me ", "i ")
                    )
                ):
                    return (
                        "Please provide the employee name "
                        "to retrieve payroll information."
                    )

                try:
                    employees = await self.crm.get_employees()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                employee = find_employee(
                    employees,
                    requested_employee_name,
                )

                if employee is None:
                    return (
                        f"I could not find an employee named "
                        f"'{requested_employee_name}' in the CRM."
                    )

            employee_id = (
                employee.get("_id")
                or employee.get("id")
            )

            if not employee_id:
                return (
                    f"The employee '{employee.get('employeeName', 'Employee')}' "
                    "does not have a valid employee ID."
                )

            try:
                payslips = await self.crm.get_payslips_by_employee(
                    employee_id
                )
            except CrmServiceError as exc:
                raise crm_http_exception(exc)

            employee_display = (
                employee.get("employeeName")
                or employee.get("name")
                or "Employee"
            )

            if intent is Intent.GET_PAYROLL_STATUS:
                requested_status = extract_payroll_status(message)

                if requested_status:
                    payslips = [
                        payslip
                        for payslip in (payslips or [])
                        if str(
                            payslip.get("status")
                            or payslip.get("paymentStatus")
                            or payslip.get("payment_status")
                            or ""
                        ).strip().casefold()
                        == requested_status.casefold()
                    ]

                    title = (
                        f"My {requested_status} Payroll Status"
                        if is_whatsapp_employee(source)
                        else f"{employee_display} - "
                        f"{requested_status} Payroll Status"
                    )
                else:
                    title = (
                        f"My Payroll Status - {employee_display}"
                        if is_whatsapp_employee(source)
                        else f"Payroll Status - {employee_display}"
                    )

                return format_payslips(
                    payslips or [],
                    title=title,
                )

            payroll_field = (
                extract_payroll_field(message)
                if is_whatsapp_employee(source)
                else requested_payroll_field
            )

            if not payroll_field:
                return format_payslips(
                    payslips or [],
                    title=f"Payroll Details - {employee_display}",
                )

            field_aliases = {
                "basicSalary": ("basicSalary", "basic_salary"),
                "medical": ("medical",),
                "performanceBonus": ("performanceBonus", "performance_bonus"),
                "conveyance": ("conveyance",),
                "pf": ("pf",),
                "esi": ("esi",),
                "tds": ("tds",),
                "professionalTax": ("professionalTax", "professional_tax"),
                "gross": ("gross", "grossSalary", "gross_salary"),
                "totalDeductions": (
                    "totalDeductions",
                    "total_deductions",
                    "deductions",
                ),
                "net": ("net", "netSalary", "net_salary", "salary"),
            }

            field_label = re.sub(
                r"(?<!^)(?=[A-Z])",
                " ",
                payroll_field,
            ).replace("_", " ").title()

            lines = [
                f"Payroll Details - {employee_display}",
                "",
                f"{field_label}:",
            ]

            found_value = False

            for payslip in payslips or []:
                value = next(
                    (
                        payslip.get(key)
                        for key in field_aliases.get(
                            payroll_field,
                            (payroll_field,),
                        )
                        if payslip.get(key) is not None
                        and payslip.get(key) != ""
                    ),
                    None,
                )

                if value is None:
                    continue

                found_value = True
                month = payslip.get("month") or "Month not available"
                lines.append(
                    f"- {month}: {format_currency(value)}"
                )

            if not found_value:
                return (
                    f"No {field_label.lower()} value was found "
                    f"in {employee_display}'s payroll records."
                )

            return "\n".join(lines)


        # =================================================
        # PAYSLIP BY EMPLOYEE AND MONTH
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
                    extract_payroll_employee_name(
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

            payslip_with_employee = {
                **payslip,
                "employeeName": (
                    payslip.get("employeeName")
                    or payslip.get("employee_name")
                    or employee.get("employeeName")
                    or employee.get("name")
                    or employee.get("username")
                    or "Unknown employee"
                ),
            }

            return format_payslip(
                payslip_with_employee,
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

        if intent is Intent.GET_PAYROLL:

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
        # PAID PAYROLL
        # =================================================

        if intent is Intent.GET_PAID_PAYROLL:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = current_employee.get("_id")

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
                    raise crm_http_exception(exc)

                employee_name = current_employee.get(
                    "employeeName", "Employee"
                )

                title = f"My Paid Payslips - {employee_name}"

            else:

                try:
                    payslips = await self.crm.get_payslips()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = "Paid Payslips"

            paid_payslips = [
                payslip
                for payslip in payslips
                if str(payslip.get("status", "")).strip().lower()
                == "paid"
            ]

            if not paid_payslips:
                return "No paid payslips found."

            return format_payslips(
                paid_payslips,
                title=title,
            )


        # =================================================
        # PENDING PAYROLL
        # =================================================

        if intent is Intent.GET_PENDING_PAYROLL:

            if is_whatsapp_employee(source):

                if current_employee is None:
                    return WHATSAPP_NOT_LINKED_RESPONSE

                employee_id = current_employee.get("_id")

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
                    raise crm_http_exception(exc)

                employee_name = current_employee.get(
                    "employeeName", "Employee"
                )

                title = f"My Pending Payslips - {employee_name}"

            else:

                try:
                    payslips = await self.crm.get_payslips()
                except CrmServiceError as exc:
                    raise crm_http_exception(exc)

                title = "Pending Payslips"

            pending_payslips = [
                payslip
                for payslip in payslips
                if str(payslip.get("status", "")).strip().lower()
                == "pending"
            ]

            if not pending_payslips:
                return "No pending payslips found."

            return format_payslips(
                pending_payslips,
                title=title,
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
