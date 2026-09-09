import re
from enum import Enum


class Intent(str, Enum):

    # =========================================================
    # EMPLOYEE
    # =========================================================

    GET_EMPLOYEES = "get_employees"

    GET_EMPLOYEE_DETAILS = "get_employee_details"

    GET_EMPLOYEE_FIELD = "get_employee_field"

    GET_EMPLOYEE_FIELD_LIST = "get_employee_field_list"

    GET_MY_DETAILS = "get_my_details"


    # =========================================================
    # ATTENDANCE
    # =========================================================

    GET_ATTENDANCE = "get_attendance"

    GET_ATTENDANCE_FIELD = "get_attendance_field"

    GET_ACTIVE_ATTENDANCE = "get_active_attendance"

    GET_ATTENDANCE_HISTORY = "get_attendance_history"


    # =========================================================
    # TASKS
    # =========================================================

    GET_TASKS = "get_tasks"

    GET_TASKS_BY_EMPLOYEE = "get_tasks_by_employee"

    GET_TASK = "get_task"

    CREATE_TASK = "create_task"

    UPDATE_TASK = "update_task"


    # =========================================================
    # LEAVES
    # =========================================================

    GET_LEAVES = "get_leaves"

    GET_LEAVES_BY_EMPLOYEE = "get_leaves_by_employee"

    GET_APPROVED_LEAVES = "get_approved_leaves"

    GET_PENDING_LEAVES = "get_pending_leaves"

    GET_REJECTED_LEAVES = "get_rejected_leaves"

    CREATE_LEAVE = "create_leave"

    UPDATE_LEAVE = "update_leave"

    UPDATE_LEAVE_STATUS = "update_leave_status"


    # =========================================================
    # PAYROLL / PAYSLIP
    # =========================================================

    GET_PAYROLL = "get_payroll"

    GET_PAYROLL_BY_EMPLOYEE = "get_payroll_by_employee"

    GET_PAYROLL_DETAILS = "get_payroll_details"

    GET_PAYROLL_STATUS = "get_payroll_status"

    GET_PAID_PAYROLL = "get_paid_payroll"

    GET_PENDING_PAYROLL = "get_pending_payroll"

    GET_PAYSLIP_BY_EMPLOYEE_AND_MONTH = (
        "get_payslip_by_employee_and_month"
    )


    # =========================================================
    # OTHER
    # =========================================================

    UNWANTED_TALK = "unwanted_talk"

    HUMAN_HELP = "human_help"

    GENERAL_CHAT = "general_chat"


# =========================================================
# COMMON HELPERS
# =========================================================

def _contains_any(
    text: str,
    words: list[str],
) -> bool:

    return any(
        word in text
        for word in words
    )


def _normalize(
    text: str,
) -> str:

    return re.sub(
        r"\s+",
        " ",
        text.strip().lower(),
    )


# =========================================================
# UNWANTED TALK
# =========================================================

UNWANTED_PATTERNS = [

    r"\btell me a joke\b",
    r"\bmake me laugh\b",
    r"\bdo you know any jokes\b",
    r"\bsay a joke\b",

    r"\bsing a song\b",
    r"\bsing for me\b",
    r"\bsing something\b",

    r"\btell me a story\b",
    r"\btell me a funny story\b",

    r"\bplay a game\b",
    r"\bplay with me\b",

    r"\bwho is your boyfriend\b",
    r"\bwho is your girlfriend\b",
    r"\bdo you have a girlfriend\b",
    r"\bdo you have a boyfriend\b",

    r"\bwhat is your favorite movie\b",
    r"\bwhat is your favorite song\b",

    r"\bwrite me a poem\b",
    r"\bwrite a poem\b",
    r"\bwrite me a song\b",
    r"\bwrite a song\b",

    r"\bdance for me\b",
    r"\bcan you dance\b",
]


def is_unwanted_talk(
    message: str,
) -> bool:

    text = _normalize(message)

    return any(
        re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )
        for pattern in UNWANTED_PATTERNS
    )


# =========================================================
# HUMAN HELP
# =========================================================

HUMAN_HELP_PATTERNS = [

    r"\btalk to hr\b",
    r"\bconnect me to hr\b",
    r"\bconnect me with hr\b",
    r"\bcontact hr\b",

    r"\bi want to talk to hr\b",
    r"\bi need hr\b",

    r"\btalk to a human\b",
    r"\btalk to a person\b",

    r"\bconnect me to a human\b",
    r"\bconnect me with a person\b",

    r"\bneed human help\b",
    r"\bneed human assistance\b",

    r"\bcontact human\b",
    r"\bconnect with human\b",
]


def is_human_help_request(
    message: str,
) -> bool:

    text = _normalize(message)

    return any(
        re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )
        for pattern in HUMAN_HELP_PATTERNS
    )


# =========================================================
# EMPLOYEE HELPERS
# =========================================================

def extract_employee_name(
    message: str,
) -> str | None:

    text = message.strip()

    patterns = [

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:details|information|info)$",

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:email|mail|phone|contact|role|position|department|designation)$",

        r"(?:what is|what's)\s+(.+?)\s+"
        r"(?:email|mail|phone|contact|role|position|department)$",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            name = match.group(1).strip()

            if name:
                return name

    return None


def extract_employee_field(
    message: str,
) -> str | None:

    text = _normalize(message)

    field_patterns = {

        "email": [
            "email",
            "mail",
            "email address",
        ],

        "contact": [
            "contact",
            "phone",
            "phone number",
            "mobile",
            "mobile number",
        ],

        "role": [
            "role",
            "position",
            "job role",
        ],

        "department": [
            "department",
            "dept",
        ],

        "designation": [
            "designation",
        ],
    }

    for field, keywords in field_patterns.items():

        if _contains_any(text, keywords):
            return field

    return None


def extract_employee_list_field(
    message: str,
) -> str | None:

    text = _normalize(message)

    if _contains_any(
        text,
        [
            "all emails",
            "employee emails",
            "all employee emails",
            "email addresses",
        ],
    ):
        return "email"

    if _contains_any(
        text,
        [
            "all contacts",
            "employee contacts",
            "all phone numbers",
            "employee phone numbers",
        ],
    ):
        return "contact"

    if _contains_any(
        text,
        [
            "all roles",
            "employee roles",
            "all positions",
        ],
    ):
        return "role"

    if _contains_any(
        text,
        [
            "all departments",
            "employee departments",
        ],
    ):
        return "department"

    if _contains_any(
        text,
        [
            "all designations",
            "employee designations",
        ],
    ):
        return "designation"

    return None


# =========================================================
# ATTENDANCE HELPERS
# =========================================================

def extract_attendance_employee_name(
    message: str,
) -> str | None:

    text = message.strip()

    patterns = [

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:attendance|login|logout|status|break|attendance id|"
        r"total work|work time)",

        r"(?:what is|what's)\s+(.+?)\s+"
        r"(?:login|logout|attendance|status|break|work time)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            name = match.group(1).strip()

            if name:
                return name

    return None


def extract_attendance_field(
    message: str,
) -> str | None:

    text = _normalize(message)

    if _contains_any(
        text,
        [
            "attendance id",
            "attendance id number",
        ],
    ):
        return "attendance_id"

    if _contains_any(
        text,
        [
            "login time",
            "login",
            "check in",
            "check-in",
            "checkin",
        ],
    ):
        return "login_time"

    if _contains_any(
        text,
        [
            "logout time",
            "logout",
            "check out",
            "check-out",
            "checkout",
        ],
    ):
        return "logout_time"

    if _contains_any(
        text,
        [
            "break start",
            "break started",
            "break in",
        ],
    ):
        return "break_start"

    if _contains_any(
        text,
        [
            "break end",
            "break ended",
            "break out",
        ],
    ):
        return "break_end"

    if _contains_any(
        text,
        [
            "status",
            "attendance status",
        ],
    ):
        return "status"

    if _contains_any(
        text,
        [
            "total work time",
            "total working time",
            "work time",
            "working time",
            "hours worked",
        ],
    ):
        return "total_work_seconds"

    return None


# =========================================================
# TASK HELPERS
# =========================================================

def extract_task_id(
    message: str,
) -> str | None:

    match = re.search(
        r"(?:task\s*(?:id)?|task)\s*[:#]?\s*"
        r"([a-zA-Z0-9_-]{4,})",
        message,
        flags=re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

    return None


def extract_task_employee_name(
    message: str,
) -> str | None:

    text = message.strip()

    patterns = [

        r"(?:tasks|task)\s+(?:for|of)\s+(.+?)(?:\?|$)",

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:tasks|task)$",

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"recent\s+tasks$",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            name = match.group(1).strip()

            invalid_names = [
                "all",
                "all employees",
                "employees",
                "recent",
                "my",
            ]

            if (
                name
                and name.lower() not in invalid_names
            ):
                return name

    return None


# =========================================================
# LEAVE HELPERS
# =========================================================

def extract_leave_employee_name(
    message: str,
) -> str | None:

    text = message.strip()

    patterns = [

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:leave|leaves|leave history)",

        r"(?:leave|leaves)\s+(?:for|of)\s+(.+?)(?:\?|$)",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            name = match.group(1).strip()

            if name:
                return name

    return None


def extract_leave_id(
    message: str,
) -> str | None:

    match = re.search(
        r"(?:leave\s*(?:id)?|leave request\s*(?:id)?)"
        r"\s*[:#]?\s*([a-zA-Z0-9_-]{4,})",
        message,
        flags=re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

    return None


def extract_leave_status(
    message: str,
) -> str | None:

    text = _normalize(message)

    statuses = [
        "approved",
        "rejected",
        "pending",
        "cancelled",
        "canceled",
    ]

    for status in statuses:

        if re.search(
            rf"\b{re.escape(status)}\b",
            text,
        ):

            if status == "canceled":
                return "cancelled"

            return status

    return None


# =========================================================
# PAYROLL HELPERS
# =========================================================

def extract_payroll_employee_name(
    message: str,
) -> str | None:

    text = message.strip()

    patterns = [

        r"(?:payslip|payroll|salary)\s+(?:for|of)\s+(.+?)(?:\?|$)",

        r"(?:show|get|find|give|display)\s+(.+?)\s+"
        r"(?:payslip|payroll|salary)$",

        r"(.+?)\s+(?:salary|payslip|payroll)\s+"
        r"(?:details|information|info)$",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:

            name = match.group(1).strip()

            invalid_names = [
                "all",
                "employees",
                "all employees",
                "my",
                "current",
                "latest",
                "pending",
                "paid",
            ]

            if (
                name
                and name.lower() not in invalid_names
            ):
                return name

    return None


def extract_payroll_status(
    message: str,
) -> str | None:

    text = _normalize(message)

    if re.search(r"\bpaid\b", text):
        return "Paid"

    if re.search(r"\bpending\b", text):
        return "Pending"

    return None


def extract_payroll_field(
    message: str,
) -> str | None:

    text = _normalize(message)

    field_patterns = {

        "basicSalary": [
            "basic salary",
            "basic",
        ],

        "medical": [
            "medical",
            "medical allowance",
        ],

        "performanceBonus": [
            "performance bonus",
            "bonus",
        ],

        "conveyance": [
            "conveyance",
            "travel allowance",
        ],

        "pf": [
            "pf",
            "provident fund",
        ],

        "esi": [
            "esi",
        ],

        "tds": [
            "tds",
        ],

        "professionalTax": [
            "professional tax",
        ],

        "gross": [
            "gross salary",
            "gross",
        ],

        "totalDeductions": [
            "total deductions",
            "deductions",
        ],

        "net": [
            "net salary",
            "net pay",
            "take home",
            "take-home",
        ],
    }

    for field, keywords in field_patterns.items():

        if _contains_any(
            text,
            keywords,
        ):
            return field

    return None


# =========================================================
# PAYSLIP MONTH HELPER
# =========================================================

def extract_payslip_month(
    message: str,
) -> str | None:

    text = _normalize(message)

    months = {
        "january": "January",
        "february": "February",
        "march": "March",
        "april": "April",
        "may": "May",
        "june": "June",
        "july": "July",
        "august": "August",
        "september": "September",
        "october": "October",
        "november": "November",
        "december": "December",
    }

    for month_key, month_value in months.items():

        if re.search(
            rf"\b{month_key}\b",
            text,
            flags=re.IGNORECASE,
        ):
            return month_value

    return None


# =========================================================
# DETECT INTENT
# =========================================================

def detect_intent(
    message: str,
) -> Intent:

    text = _normalize(message)


    # =====================================================
    # UNWANTED TALK
    # =====================================================

    if is_unwanted_talk(text):
        return Intent.UNWANTED_TALK


    # =====================================================
    # HUMAN HELP
    # =====================================================

    if is_human_help_request(text):
        return Intent.HUMAN_HELP


    # =====================================================
    # ATTENDANCE
    # =====================================================

    if _contains_any(
        text,
        [
            "active attendance",
            "currently working",
            "currently active",
            "who is working",
            "who are working",
        ],
    ):
        return Intent.GET_ACTIVE_ATTENDANCE


    if _contains_any(
        text,
        [
            "attendance history",
            "attendance records",
            "all attendance",
            "attendance report",
        ],
    ):
        return Intent.GET_ATTENDANCE_HISTORY


    attendance_field = extract_attendance_field(text)

    attendance_employee = (
        extract_attendance_employee_name(text)
    )


    if (
        attendance_field
        and attendance_employee
    ):
        return Intent.GET_ATTENDANCE_FIELD


    if _contains_any(
        text,
        [
            "attendance",
            "attendance details",
            "attendance record",
        ],
    ):

        if attendance_employee:
            return Intent.GET_ATTENDANCE


    # =====================================================
    # TASKS
    # =====================================================

    if _contains_any(
        text,
        [
            "create task",
            "create a task",
            "add task",
            "add a task",
            "new task",
        ],
    ):
        return Intent.CREATE_TASK


    if _contains_any(
        text,
        [
            "update task",
            "edit task",
            "change task",
            "modify task",
        ],
    ):
        return Intent.UPDATE_TASK


    if (
        _contains_any(
            text,
            [
                "recent tasks",
                "recent task",
            ],
        )
        and extract_task_employee_name(text)
    ):
        return Intent.GET_TASKS_BY_EMPLOYEE


    if (
        _contains_any(
            text,
            [
                "task id",
                "task details",
                "get task",
                "show task",
            ],
        )
        and extract_task_id(text)
    ):
        return Intent.GET_TASK


    if _contains_any(
        text,
        [
            "all tasks",
            "show tasks",
            "show all tasks",
            "list tasks",
            "tasks",
        ],
    ):

        task_employee = extract_task_employee_name(text)

        if task_employee:
            return Intent.GET_TASKS_BY_EMPLOYEE

        return Intent.GET_TASKS


    # =====================================================
    # LEAVES
    # =====================================================

    if _contains_any(
        text,
        [
            "approved leaves",
            "approved leave",
            "show approved leaves",
            "show approved leave",
            "list approved leaves",
        ],
    ):
        return Intent.GET_APPROVED_LEAVES


    if _contains_any(
        text,
        [
            "pending leaves",
            "pending leave",
            "show pending leaves",
            "show pending leave",
            "list pending leaves",
        ],
    ):
        return Intent.GET_PENDING_LEAVES


    if _contains_any(
        text,
        [
            "rejected leaves",
            "rejected leave",
            "show rejected leaves",
            "show rejected leave",
            "list rejected leaves",
        ],
    ):
        return Intent.GET_REJECTED_LEAVES


    if _contains_any(
        text,
        [
            "create leave",
            "apply leave",
            "apply for leave",
            "request leave",
            "new leave",
        ],
    ):
        return Intent.CREATE_LEAVE


    if _contains_any(
        text,
        [
            "update leave",
            "edit leave",
            "change leave",
            "modify leave",
        ],
    ):
        return Intent.UPDATE_LEAVE


    if _contains_any(
        text,
        [
            "approve leave",
            "reject leave",
            "cancel leave",
            "change leave status",
        ],
    ):
        return Intent.UPDATE_LEAVE_STATUS


    if (
        _contains_any(
            text,
            [
                "leave id",
                "leave request",
            ],
        )
        and extract_leave_id(text)
        and extract_leave_status(text)
    ):
        return Intent.UPDATE_LEAVE_STATUS


    if _contains_any(
        text,
        [
            "my leaves",
            "my leave",
            "my leave history",
        ],
    ):
        return Intent.GET_LEAVES_BY_EMPLOYEE


    if _contains_any(
        text,
        [
            "leave history",
            "leave records",
            "all leave records",
            "show leave records",
            "show all leaves",
            "all leaves",
            "all leave",
            "show leaves",
            "list leaves",
            "list leave records",
        ],
    ):

        leave_employee = extract_leave_employee_name(text)

        if leave_employee:
            return Intent.GET_LEAVES_BY_EMPLOYEE

        return Intent.GET_LEAVES


    # =====================================================
    # PAYROLL / PAYSLIP
    # =====================================================

    payroll_employee = (
        extract_payroll_employee_name(text)
    )

    payroll_status = (
        extract_payroll_status(text)
    )

    payroll_field = (
        extract_payroll_field(text)
    )

    payslip_month = (
        extract_payslip_month(text)
    )


    # Specific salary field
    if (
        payroll_field
        and payroll_employee
    ):
        return Intent.GET_PAYROLL_DETAILS


    # Payslip for employee and month
    if (
        payroll_employee
        and payslip_month
        and _contains_any(
            text,
            [
                "payslip",
                "payroll",
                "salary",
            ],
        )
    ):
        return Intent.GET_PAYSLIP_BY_EMPLOYEE_AND_MONTH


    # Paid payroll
    if _contains_any(
        text,
        [
            "paid payroll",
            "paid payslips",
            "paid salaries",
            "show paid payroll",
            "show paid payslips",
        ],
    ):
        return Intent.GET_PAID_PAYROLL


    # Pending payroll
    if _contains_any(
        text,
        [
            "pending payroll",
            "pending payslips",
            "pending salaries",
            "show pending payroll",
            "show pending payslips",
        ],
    ):
        return Intent.GET_PENDING_PAYROLL


    # Payroll by employee
    if (
        payroll_employee
        and _contains_any(
            text,
            [
                "payroll",
                "payslip",
                "salary",
            ],
        )
    ):
        return Intent.GET_PAYROLL_BY_EMPLOYEE


    # Payroll status
    if (
        payroll_status
        and _contains_any(
            text,
            [
                "payroll",
                "payslip",
                "salary",
            ],
        )
    ):
        return Intent.GET_PAYROLL_STATUS


    # All payroll
    if _contains_any(
        text,
        [
            "all payroll",
            "show payroll",
            "show all payroll",
            "list payroll",
            "all payslips",
            "show payslips",
            "show all payslips",
            "list payslips",
            "payroll records",
            "payslip records",
        ],
    ):
        return Intent.GET_PAYROLL


    # =====================================================
    # EMPLOYEES
    # =====================================================

    if _contains_any(
        text,
        [
            "all employees",
            "show employees",
            "show all employees",
            "list employees",
            "employees",
        ],
    ):
        return Intent.GET_EMPLOYEES


    employee_list_field = (
        extract_employee_list_field(text)
    )

    if employee_list_field:
        return Intent.GET_EMPLOYEE_FIELD_LIST


    if _contains_any(
        text,
        [
            "my details",
            "my employee details",
            "my profile",
            "my employee information",
        ],
    ):
        return Intent.GET_MY_DETAILS


    employee_field = (
        extract_employee_field(text)
    )

    employee_name = (
        extract_employee_name(text)
    )


    if (
        employee_field
        and employee_name
    ):
        return Intent.GET_EMPLOYEE_FIELD


    if _contains_any(
        text,
        [
            "employee details",
            "employee information",
            "employee info",
        ],
    ):

        if employee_name:
            return Intent.GET_EMPLOYEE_DETAILS


    # =====================================================
    # GENERAL CHAT
    # =====================================================

    return Intent.GENERAL_CHAT