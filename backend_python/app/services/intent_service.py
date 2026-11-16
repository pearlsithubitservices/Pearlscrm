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
    GET_TASK_COUNT = "get_task_count"

    CREATE_TASK = "create_task"

    UPDATE_TASK = "update_task"

    DELETE_TASK = "delete_task"
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

    GET_PROJECTS = "get_projects"
    GET_PROJECT_PROGRESS = "get_project_progress"
    GET_PROJECT_DEADLINES = "get_project_deadlines"
    GET_PROJECT_TEAM = "get_project_team"
    GET_PROJECT_MILESTONES = "get_project_milestones"
    GET_PROJECT_NOTES = "get_project_notes"
    CREATE_PROJECT_NOTE = "create_project_note"
    UPDATE_PROJECT_NOTE = "update_project_note"
    DELETE_PROJECT_NOTE = "delete_project_note"
    GET_FOLLOWUPS = "get_followups"
    GET_MEETINGS = "get_meetings"
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
    # Direct HR requests
    r"\bhr\s+help\b",
    r"\bhelp\s+from\s+hr\b",
    r"\b(?:i|we)\s+need\s+(?:some\s+)?help\s+(?:from|with)\s+hr\b",
    r"\b(?:i|we)\s+need\s+(?:some\s+)?(?:hr\s+)?(?:help|assistance|support)\b",
    r"\bhr\s*[,.:;!?-]?\s*(?:i\s+)?(?:need|want|have|got)\s+(?:some\s+)?(?:help|assistance|support)\b",
    r"\b(?:can|could|may)\s+i\s+(?:please\s+)?(?:speak|talk)\s+(?:to|with)\s+hr\b",
    r"\b(?:i\s+)?(?:want|need)\s+to\s+(?:speak|talk)\s+(?:to|with)\s+hr\b",
    r"\b(?:please\s+)?(?:connect|transfer)\s+me\s+(?:to|with)\s+hr\b",
    r"\b(?:contact|reach)\s+(?:the\s+)?hr\b",

    # Existing direct expressions
    r"\btalk to hr\b",
    r"\bspeak to hr\b",
    r"\bspeak with hr\b",
    r"\bconnect me to hr\b",
    r"\bconnect me with hr\b",
    r"\bcontact hr\b",
    r"\bi want to talk to hr\b",
    r"\bi need hr\b",

    # Requests for a human representative
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
            "punch in",
            "punched in",
            "clock in",
            "clocked in",
            "log in",
            "logged in",
            "came in",
            "come in",
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
            "punch out",
            "punched out",
            "clock out",
            "clocked out",
            "log out",
            "logged out",
            "left office",
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
            "worked hours",
            "working hours",
            "work hours",
            "total hours",
            "how long",
        ],
    ):
        return "total_work_seconds"

    return None



def extract_task_status_update(
    message: str,
) -> tuple[str, str] | None:
    """Extract the task title and requested new status."""

    patterns = [
        r"^\s*(?:please\s+)?(?:mark|set|change|update)\s+"
        r"(.+?)\s+(?:as|to)\s+"
        r"(in\s+progress|pending|completed|complete|done|finished)"
        r"\s*[.!?]*$",
    ]

    status_map = {
        "pending": "Pending",
        "in progress": "In Progress",
        "completed": "Completed",
        "complete": "Completed",
        "done": "Completed",
        "finished": "Completed",
    }

    for pattern in patterns:
        match = re.search(
            pattern,
            message.strip(),
            flags=re.IGNORECASE,
        )

        if match:
            task_title = match.group(1).strip()

            # Remove optional "task" wording from the title.
            task_title = re.sub(
                r"^\s*task\s+|\s+task\s*$",
                "",
                task_title,
                flags=re.IGNORECASE,
            ).strip()

            requested_status = status_map[
                match.group(2).lower()
            ]

            if task_title:
                return task_title, requested_status

    return None


def extract_task_employee_name(message: str) -> str | None:
    text = message.strip()

    patterns = [
        r"(?:show|get|find|give|display|list)\s+(.+?)\s+"
        r"(?:tasks|task|recent tasks|recent task)$",
        r"(?:tasks|task)\s+(?:for|of|assigned to)\s+(.+?)$",
    ]

    for pattern in patterns:
        match = re.search(
            pattern,
            text,
            flags=re.IGNORECASE,
        )

        if match:
            name = match.group(1).strip()

            if name and name.lower() not in {
                "my", "me", "mine", "all", "pending",
                "completed", "current", "previous", "recent",
            }:
                return name

    return None



def extract_task_id(message: str) -> str | None:
    match = re.search(
        r"(?:task\s*(?:id)?|task)\s*[:#]?\s*([a-zA-Z0-9_-]{4,})",
        message,
        flags=re.IGNORECASE,
    )

    if match:
        return match.group(1).strip()

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

_PAYROLL_MONTH_WORDS = (
    "january|february|march|april|may|june|july|august|september|"
    "october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|"
    "oct|nov|dec"
)


def _clean_payroll_name(
    name: str,
) -> str | None:
    """
    Remove trailing month / time phrases from a captured payroll name
    ("priya for march" -> "priya") and reject captures that are not a
    person at all ("march", "last month", "me").
    """

    name = name.strip().strip("?.!,")

    name = re.sub(
        rf"\s+(?:for|in|of|during|on)\s+(?:the\s+)?"
        rf"(?:(?:{_PAYROLL_MONTH_WORDS})(?:\s+\d{{4}})?|"
        rf"(?:last|this|current|previous|past|next)\s+month|"
        rf"\d{{4}})\s*$",
        "",
        name,
        flags=re.IGNORECASE,
    ).strip()

    if not name:
        return None

    if re.fullmatch(
        rf"(?:{_PAYROLL_MONTH_WORDS})(?:\s+\d{{4}})?|"
        rf"(?:last|this|current|previous|past|next|the)"
        rf"(?:\s+month)?|month|year|\d{{4}}|me|myself|i|us|you|"
        rf"him|her|them|it|this|that|these|those|today|yesterday|"
        rf"tomorrow|now",
        name,
        flags=re.IGNORECASE,
    ):
        return None

    return name


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
                name = _clean_payroll_name(name)

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

    # Negative / unpaid wording first, otherwise "not paid" would be
    # read as "paid".
    if re.search(
        r"\b(?:pending|unpaid|not\s+(?:yet\s+)?(?:been\s+)?"
        r"(?:paid|credited|received|processed|released|"
        r"disbursed|transferred)|"
        r"yet\s+to\s+(?:be\s+)?(?:paid|credited|receive|received|"
        r"get)|"
        r"still\s+(?:waiting|not)|delayed|outstanding|due)\b",
        text,
    ):
        return "Pending"

    if re.search(
        r"\b(?:paid|credited|received|processed|released|"
        r"disbursed|transferred|settled)\b",
        text,
    ):
        return "Paid"

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
            "in hand",
        ],
    }

    for field, keywords in field_patterns.items():

        # Whole-word match: short tokens such as "pf", "esi" and
        # "tds" must not match inside other words ("design").
        if any(
            re.search(rf"\b{re.escape(keyword)}\b", text)
            for keyword in keywords
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

    # "may" is also a very common English verb ("May I see my
    # payslip?"). Treat it as the month only when it is used like one.
    may_is_month = bool(
        re.search(
            r"\b(?:in|for|of|during|on|from|till|until|by|"
            r"month\s+of|since)\s+may\b|"
            r"\bmay\s+(?:month|salary|payslip|payroll|pay|slip|"
            r"20\d{2}|'s)\b|"
            r"\bmay\b\s*$",
            text,
        )
    )

    for month_key, month_value in months.items():

        if month_key == "may" and not may_is_month:
            continue

        if re.search(
            rf"\b{month_key}\b",
            text,
            flags=re.IGNORECASE,
        ):
            return month_value

    # Short forms ("mar payslip", "salary for sept"). Only accepted
    # when the sentence is clearly about pay, so a person called
    # "Jan" is not turned into a month by accident.
    if re.search(
        r"\b(?:salary|salaries|payslip|payroll|pay|slip|paid)\b",
        text,
    ):
        short_months = {
            "jan": "January",
            "feb": "February",
            "mar": "March",
            "apr": "April",
            "jun": "June",
            "jul": "July",
            "aug": "August",
            "sep": "September",
            "sept": "September",
            "oct": "October",
            "nov": "November",
            "dec": "December",
        }

        for short_key, month_value in short_months.items():

            if re.search(
                rf"\b(?:for|in|of|during|on|month\s+of)\s+"
                rf"{short_key}\b|\b{short_key}\s+"
                rf"(?:salary|payslip|payroll|pay|slip)\b",
                text,
            ):
                return month_value

    return None


# =========================================================
# PROJECT NOTE HELPERS
# =========================================================

def extract_project_note_request(
    message: str,
) -> dict | None:
    """
    Extract project-note commands.

    Add:
    Add note to Arushuvai Website: Homepage design completed

    Add with separate title and description:
    Add note to Arushuvai Website: Title: Product Page Design | Note: Homepage design reviewed

    View:
    Show my notes for Arushuvai Website

    Update:
    Update note 1 for Arushuvai Website: Homepage design reviewed
    """

    text = message.strip()

    # -----------------------------------------------------
    # ADD A NOTE
    # -----------------------------------------------------

    match = re.search(
        r"^\s*(?:please\s+)?(?:add|create|write)\s+"
        r"(?:a\s+)?note\s+(?:to|for)\s+"
        r"(.+?)\s*:\s*(.+?)\s*$",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        project_title = match.group(1).strip()
        note_text = match.group(2).strip().rstrip(".!?")

        note_title = ""
        note_description = note_text

        # Support: Title: ... | Note: ...
        structured_match = re.fullmatch(
            r"title\s*:\s*(.+?)\s*\|\s*"
            r"note\s*:\s*(.+?)\s*",
            note_text,
            flags=re.IGNORECASE,
        )

        if structured_match:
            note_title = structured_match.group(1).strip()
            note_description = structured_match.group(2).strip()

        # Also support: Title: ... | Description: ...
        if not structured_match:
            structured_match = re.fullmatch(
                r"title\s*:\s*(.+?)\s*\|\s*"
                r"description\s*:\s*(.+?)\s*",
                note_text,
                flags=re.IGNORECASE,
            )

            if structured_match:
                note_title = structured_match.group(1).strip()
                note_description = structured_match.group(2).strip()

        if project_title and note_description:
          return {
                "action": "create",
                "project_title": project_title,
                "note_number": None,
                "note_title": note_title,
                "note_text": note_description,
            }
   
    # -----------------------------------------------------
    # DELETE A NUMBERED NOTE
    # -----------------------------------------------------

    match = re.search(
        r"^\s*(?:please\s+)?(?:delete|remove)\s+"
        r"note\s+#?(\d+)\s+(?:for|in|on)\s+"
        r"(.+?)\s*$",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        note_number = int(match.group(1))
        project_title = match.group(2).strip().rstrip(".!?")

        if project_title and note_number > 0:
            return {
                "action": "delete",
                "project_title": project_title,
                "note_number": note_number,
                "note_title": None,
                "note_text": None,
            }

    # -----------------------------------------------------
    # UPDATE A NUMBERED NOTE
    # -----------------------------------------------------

    match = re.search(
        r"^\s*(?:please\s+)?(?:update|edit|change|modify)\s+"
        r"note\s+#?(\d+)\s+(?:for|in|on)\s+"
        r"(.+?)\s*:\s*(.+?)\s*$",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        note_number = int(match.group(1))
        project_title = match.group(2).strip()
        note_text = match.group(3).strip().rstrip(".!?")

        if project_title and note_text:
            return {
                "action": "update",
                "project_title": project_title,
                "note_number": note_number,
                "note_title": None,
                "note_text": note_text,
            }

    # -----------------------------------------------------
    # VIEW NOTES FOR A PROJECT
    # -----------------------------------------------------

    match = re.search(
        r"^\s*(?:please\s+)?(?:show|view|list|get|display|see|check)\s+"
        r"(?:my\s+)?(?:previous\s+)?notes?\s+"
        r"(?:for|of|in|on)\s+(.+?)\s*$",
        text,
        flags=re.IGNORECASE,
    )

    if match:
        project_title = match.group(1).strip().rstrip(".!?")

        if project_title:
            return {
                "action": "view",
                "project_title": project_title,
                "note_number": None,
                "note_title": None,
                "note_text": None,
            }

    return None



# =========================================================
# NATURAL-LANGUAGE UNDERSTANDING LAYER
#
# Added on top of the existing helpers. detect_intent() uses
# these to understand HOW a sentence is asked (typos, shorthand,
# synonyms, questions vs. commands) and WHICH module it is about,
# before deciding the intent. Nothing here touches any API,
# database or integration; it only reads the message text.
# =========================================================

# ---------------------------------------------------------
# 1. NORMALISATION: typos, WhatsApp shorthand, synonyms
# ---------------------------------------------------------

_CONTRACTION_RULES = [
    (re.compile(r"\bcan'?t\b"), "can not"),
    (re.compile(r"\bwon'?t\b"), "will not"),
    (
        re.compile(
            r"\b(do|does|did|is|was|were|are|has|have|had|"
            r"should|could|would|must)n'?t\b"
        ),
        r"\1 not",
    ),
    (
        re.compile(
            r"\b(what|who|how|where|when|why|that|there|here|it)'s\b"
        ),
        r"\1 is",
    ),
    (re.compile(r"\bwhats\b"), "what is"),
    (re.compile(r"\bwhos\b"), "who is"),
    (re.compile(r"\bhows\b"), "how is"),
    (re.compile(r"\bi'?m\b"), "i am"),
    (re.compile(r"\bi'?ve\b"), "i have"),
    (re.compile(r"\bi'll\b"), "i will"),
    (re.compile(r"\bi'd\b"), "i would"),
    (re.compile(r"\b(you|we|they)'re\b"), r"\1 are"),
]

_SHORTHAND = {
    "pls": "please",
    "plz": "please",
    "plss": "please",
    "u": "you",
    "r": "are",
    "ur": "your",
    "abt": "about",
    "wat": "what",
    "wht": "what",
    "wut": "what",
    "hw": "how",
    "wen": "when",
    "tdy": "today",
    "tday": "today",
    "2day": "today",
    "tmrw": "tomorrow",
    "tmr": "tomorrow",
    "tmrrw": "tomorrow",
    "2moro": "tomorrow",
    "2mrw": "tomorrow",
    "tomorow": "tomorrow",
    "tommorow": "tomorrow",
    "tommorrow": "tomorrow",
    "yday": "yesterday",
    "ystrday": "yesterday",
    "yesterdy": "yesterday",
    "mnth": "month",
    "mth": "month",
    "wk": "week",
    "gimme": "give me",
    "lemme": "let me",
    "wanna": "want to",
    "gonna": "going to",
    "hv": "have",
    "hve": "have",
    "shw": "show",
    "chk": "check",
    "chck": "check",
}

_WEEKDAYS = (
    "monday|tuesday|wednesday|thursday|friday|saturday|sunday"
)

# (compiled pattern, replacement). Applied in order.
_CANONICAL_RULES = [

    # ---- common typos -------------------------------------
    (re.compile(
        r"\b(?:attendence|attendnce|atendance|attandance|attendace|"
        r"attendanc|atttendance|attendens)\b"
    ), "attendance"),
    (re.compile(
        r"\b(?:salry|sallary|salery|slary|sallery|salaray|sallry)\b"
    ), "salary"),
    (re.compile(
        r"\b(?:payrole|payrol|payrool|pay roll)\b"
    ), "payroll"),
    (re.compile(r"\b(?:taks|tasck|tassk|tsk|taskk)(s?)\b"), r"task\1"),
    (re.compile(
        r"\b(?:projet|projct|proect|prjct|prject|projectt|porject)(s?)\b"
    ), r"project\1"),
    (re.compile(r"\bmile\s+stones?\b"), "milestone"),
    (re.compile(r"\bdead\s+lines?\b"), "deadline"),
    (re.compile(r"\bduedate(s?)\b"), r"due date\1"),
    (re.compile(r"\b(?:leav|leve|leavw)\b"), "leave"),
    (re.compile(r"\bleavs\b"), "leaves"),

    # ---- payroll synonyms ---------------------------------
    (re.compile(
        r"\b(?:pay\s*slip|salary\s+slip|pay\s*check|pay\s*stub|"
        r"salary\s+statement)(s?)\b"
    ), r"payslip\1"),
    (re.compile(
        r"\b(?:wages?|remuneration|earnings|pay\s+packet)\b"
    ), "salary"),
    (re.compile(r"\bpay\s*day\b|\bpay\s*date\b|\bsalary\s+date\b"),
     "payday"),
    (re.compile(r"\bpaid\s+(leaves?)\b"), r"\1"),

    # ---- attendance synonyms ------------------------------
    # punch in / clock in / log in / check in  -> login
    (re.compile(
        r"\b(?:(?:log|logged|logging|punch|punched|punching|clock|"
        r"clocked|clocking)\s*in|"
        r"(?:check|checked|checking)\s*in"
        r"(?=\s*(?:time|today|yesterday|tomorrow|at\b|by\b|\d|yet|"
        r"already|status|record|details|history|$))|checkin)\b"
    ), "login"),
    (re.compile(
        r"\b(?:(?:log|logged|logging|punch|punched|punching|clock|"
        r"clocked|clocking|sign|signed|signing)\s*out|"
        r"(?:check|checked|checking)\s*out"
        r"(?=\s*(?:time|today|yesterday|tomorrow|at\b|by\b|\d|yet|"
        r"already|status|record|details|history|$))|checkout)\b"
    ), "logout"),
    (re.compile(
        r"\b(?:came|come|coming|reached|reach|arrived|arrive|entered)"
        r"\s+(?:to\s+|in\s+|into\s+|at\s+)?(?:the\s+)?office\b"
    ), "login"),
    (re.compile(
        r"\b(?:left|leave|leaving|exited|exit)\s+(?:the\s+)?office\b"
    ), "logout"),
    (re.compile(
        r"\b(did|do|does|will|has|have|was|were)\s+"
        r"(i|we|he|she|they)\s+(?:come|came|arrive|arrived|reach|"
        r"reached)\b"
    ), r"\1 \2 login"),
    (re.compile(
        r"\bhow\s+(?:many\s+hours|long)\s+(?:did|have|has|am|was|do|"
        r"does)\s+(?:i|we|he|she|they|[a-z]+)\s+(?:[a-z]+\s+){0,2}?"
        r"(?:work|worked|working)\b"
    ), r"working hours \g<0>"),

    # ---- leave synonyms -----------------------------------
    (re.compile(r"\b(?:day|days|time|week|weeks)\s+off\b"), "leave"),
    (re.compile(
        r"\b(morning|afternoon|evening|tomorrow|today|" + _WEEKDAYS +
        r")\s+off\b"
    ), r"leave \1"),
    (re.compile(r"\boff\s+days?\b"), "leave"),
    (re.compile(
        r"\b(?:i|we)\s+(?:will|shall|might)\s+be\s+off\s+(?:on\s+)?"
        r"(tomorrow|today|" + _WEEKDAYS + r"|next\s+week|this\s+week)\b"
    ), r"i will take leave \1"),
    (re.compile(
        r"\b(sick|medical|casual|earned|annual|maternity|paternity|"
        r"privilege|compensatory|marriage|bereavement)\s+days?\b"
    ), r"\1 leave"),
    (re.compile(r"\bvacations?\b"), "leave"),
    (re.compile(
        r"\b(need|want|apply for|apply|request|take|get)\s+"
        r"(?:a\s+|an\s+)?permission\b"
    ), r"\1 leave"),
    # "leave" used as a VERB is not the leave module.
    (re.compile(
        r"\bleave\s+(?:early|now|home|here|there|work)\b"
    ), "exit"),
    (re.compile(r"\bleaving\s+(?:early|now|soon|work)\b"), "exiting"),
    (re.compile(
        r"\bleave\s+(?:me|us|it|him|her|them)\b"
        r"(?!\s+(?:request|balance|status|application))"
    ), "exit"),

    # ---- task synonyms ------------------------------------
    (re.compile(
        r"\b(my|the|today|our)\s+to\s*do\b"
    ), r"\1 task"),
    (re.compile(
        r"\bto\s*do\s+(?:list|items?)\b|\btodos?\b|\bto\s*dos\b"
    ), "task"),
    (re.compile(r"\bwork\s*items?\b|\bworkload\b|\bwork\s+load\b"),
     "tasks"),
    (re.compile(
        r"\b(pending|assigned|remaining|incomplete|unfinished|overdue|"
        r"urgent|allocated|given|today)\s+works?\b"
        r"(?!\s*(?:hours?|time|shift|schedule|days?|week|from|force|"
        r"place|culture|life))"
    ), r"\1 tasks"),
    (re.compile(
        r"\bwork\s+(assigned|allocated|given|left|remaining|pending)\b"
    ), r"tasks \1"),
    (re.compile(r"\bwhat\s+work\s+(?=(?:do|have|did|should|am)\b)"),
     "what tasks "),

    # ---- project synonyms ---------------------------------
    (re.compile(
        r"\b(?:delivery|submission|launch|go\s*live|golive|completion|"
        r"end|finish|target)\s+dates?\b"
    ), "deadline"),
    (re.compile(r"\bdue\s+dates?\b"), "deadline"),
    (re.compile(
        r"\bcompleteness\b|\bcompletion\b|\bpercent(?:age)?\b|%|"
        r"\bhow\s+far\b|"
        r"\bhow\s+much\s+(?:is\s+)?(?:done|completed|finished|complete)\b"
    ), "progress"),
]


def _nlu_normalize(
    message: str,
) -> str:
    """
    Lower-case the message and turn WhatsApp-style writing into a
    canonical form the module detectors can reason about.
    Punctuation is dropped; apostrophes are kept so that possessives
    ("rahul's salary") can still be recognised.
    """

    t = message.lower().strip()

    t = (
        t.replace("\u2019", "'")
        .replace("\u2018", "'")
        .replace("`", "'")
        .replace("\u00b4", "'")
    )

    t = re.sub(r"\btoday'?s\b", "today", t)

    for pattern, replacement in _CONTRACTION_RULES:
        t = pattern.sub(replacement, t)

    t = t.replace("-", " ").replace("_", " ")

    t = re.sub(r"[^\w\s'#:/%@&]", " ", t)

    t = re.sub(r"\s+", " ", t).strip()

    t = re.sub(
        r"\b(" + "|".join(map(re.escape, _SHORTHAND)) + r")\b",
        lambda m: _SHORTHAND[m.group(1)],
        t,
    )

    for pattern, replacement in _CANONICAL_RULES:
        t = pattern.sub(replacement, t)

    return re.sub(r"\s+", " ", t).strip()


# ---------------------------------------------------------
# 2. SENTENCE SHAPE: question / command / status-check
# ---------------------------------------------------------

_FILLER = (
    r"(?:(?:hey|hi|hello|hii|hlo|ok|okay|so|and|also|then|please|"
    r"kindly|bro|sir|madam|mam|actually|btw|just|now)\s+)*"
)

_QUERY_START = re.compile(
    r"^" + _FILLER +
    r"(?:what|which|who|whom|whose|when|where|why|how|any|is|are|was|"
    r"were|do|does|did|have|has|had|show|list|display|tell|give|get|"
    r"fetch|find|check|view|see|share|pull|open|explain|describe|"
    r"summarize|status|update on|any update|let me (?:see|know|check)|"
    r"(?:i|we)\s+(?:want|need|wish|would like)\s+to\s+"
    r"(?:see|know|check|view|find|get|look)|"
    r"can you (?:show|tell|check|give|get|list|share|fetch|find|see)|"
    r"could you (?:show|tell|check|give|get|list|share|fetch|find|see)|"
    r"will you (?:show|tell|check|give|get|list)|"
    r"(?:am|are)\s+(?:i|we))\b"
)

_STATUS_CHECK_START = re.compile(
    r"^" + _FILLER +
    r"(?:is|was|has|have|did|does|will|would|when|why|how come|"
    r"any update|update on|status of|what is the status|"
    r"what happened|where is|am i|are)\b"
)

# Command prefix: "please", "can you", "i want to", "can i" ...
_CMD_PREFIX = (
    r"^" + _FILLER +
    r"(?:(?:can|could|would|will)\s+you\s+(?:please\s+)?|"
    r"(?:can|could|may)\s+i\s+(?:please\s+)?|"
    r"(?:i|we)\s+(?:want|need|wish|would like|have|am going)\s+to\s+|"
    r"(?:lets|let us)\s+|(?:i|we)\s+will\s+)?"
)

_HOW_TO = re.compile(r"^" + _FILLER + r"how\s+(?:do|can|should|to)\b")


def _is_query(
    n: str,
    raw: str = "",
) -> bool:

    return "?" in raw or bool(_QUERY_START.match(n))


def _is_status_check(
    n: str,
) -> bool:
    """True for single-item checks: 'is my X approved', 'when will ...'."""

    if re.match(r"^" + _FILLER + r"(?:is|are)\s+there\b", n):
        return False

    return bool(_STATUS_CHECK_START.match(n))


def _is_short(
    n: str,
) -> bool:

    return len(n.split()) <= 4


_RE_SELF = re.compile(r"\b(?:my|mine|me|myself|i|we|our|us)\b")


def _has_self(
    n: str,
) -> bool:

    return bool(_RE_SELF.search(n))


_RE_OWNER = re.compile(r"\b(?:my|mine|me|myself|our)\b")


def _has_owner(
    n: str,
) -> bool:

    return bool(_RE_OWNER.search(n))


_RE_TEAM_WORDS = re.compile(
    r"\b(?:all|everyone|everybody|every|team|employees|staff|company|"
    r"whole|entire|who|people|members|colleagues|everyone's)\b"
)


# ---------------------------------------------------------
# 3. MODULE VOCABULARY (nouns decide the module; status words
#    such as "pending" / "completed" never decide it alone)
# ---------------------------------------------------------

_RE_TASK = re.compile( r"\b(?:tasks?|assignments?|responsibilit(?:y|ies))\b")

_RE_PROJECT = re.compile(r"\b(?:projects?|milestones?)\b")

_RE_LEAVE = re.compile(r"\bleaves?\b")

_RE_PAYROLL_STRONG = re.compile(
    r"\b(?:salary|salaries|payroll|payslips?|payday|ctc|net pay|"
    r"gross pay|gross salary|basic salary|basic pay|take home|in hand|"
    r"bonus(?:es)?|incentives?|allowances?|deductions?|pf|esi|tds|"
    r"provident fund|professional tax|conveyance)\b"
)

_RE_PAYROLL_PAID_VERB = re.compile(
    r"\b(?:get|got|getting|been|be|was|were|am|will i be|"
    r"did i get|have i been)\s+paid\b"
)

_RE_ATT_STRONG = re.compile(
    r"\b(?:attendance|login|logout|working hours|work hours|work time|"
    r"working time|hours worked|worked hours|total hours|office hours|"
    r"break time|lunch break|tea break|overtime|punctuality)\b|"
    r"\bmy\s+(?:in|out)\s+time\b"
)

_RE_ATT_WEAK = re.compile(
    r"\b(?:am|was|were|is|have been|had been|will be|did|do)\s+"
    r"(?:i|we)\s+(?:[a-z]+\s+)?"
    r"(?:present|absent|late|early|on time|on break|in office|at work|"
    r"marked)\b|"
    r"\bmy\s+(?:[a-z]+\s+)?(?:present|absent|late|break|shift)\b|"
    r"\bhow\s+many\s+(?:days|hours|times)\s+(?:did|have|was|were)\s+i\s+"
    r"(?:work|worked|been\s+present|been\s+absent|attend|attended|"
    r"come|been\s+late|was\s+late|was\s+absent)\b|"
    r"\bdid\s+i\s+(?:work|attend)\b(?!\s+on\b)|"
    r"\b(?:is|was|are|were|did)\s+(?:[a-z]+\s+){1,2}"
    r"(?:present|absent|late|in office|on time)\b"
    r"(?=\s*(?:today|yesterday|now|tomorrow|this|on\b|$))"
)

# Named things that usually mean a software/client project when the
# sentence has no explicit "project" or "task" word.
_RE_PROJECT_CUE = re.compile(
    r"\b(?:website|web site|web app|app|portal|platform|software|crm|"
    r"erp|landing page|redesign|ecommerce|e commerce|client|"
    r"go live|launch)\b"
)

_RE_TASK_PHRASE = re.compile(
    r"\bwhat\s+(?:should|do|can|must|shall)\s+i\s+"
    r"(?:do|work on|start|finish|complete|have to do|need to do)\b|"
    r"\bon my plate\b|"
    r"\bwhat\s+(?:i|do i)\s+(?:have|need|got)\s+to\s+"
    r"(?:do|finish|complete|submit|deliver)\b|"
    r"\banything\s+(?:to do|pending for me|assigned)\b|"
    r"\bwhat\s+am\s+i\s+(?:supposed|expected)\s+to\s+do\b|"
    r"\b(?:my|today)\s+work\b(?!\s*(?:hours?|time|shift|schedule|day))"
)

_RE_WORKING_ON = re.compile(
    r"\bwhat\b.*\b(?:am i|i am)\s+(?:currently\s+|now\s+|presently\s+)?"
    r"working\s+on\b"
)

# Things employees ask about that are NOT tasks/projects in this CRM.
_RE_OTHER_ENTITY = re.compile(
    r"\b(?:reimbursements?|expenses?|claims?|invoices?|payments?|"
    r"requests?|tickets?|letters?|certificates?|documents?|id card|"
    r"laptop|assets?|insurance|loan|advance|resignation|transfer|"
    r"promotion|appraisal|increment|hike|review|meetings?|calls?)\b"
)


def _scrub_non_leave(
    n: str,
) -> str:

    return re.sub(
        r"\b(?:to|will|can|may|should|must|could|would)\s+leave\s+"
        r"(?:the\s+)?(?:office|early|late|now|home|here|soon)\b",
        " ",
        n,
    )


def _module_scores(
    n: str,
) -> dict:

    scores = {
        "leave": 0,
        "payroll": 0,
        "attendance": 0,
        "task": 0,
        "project": 0,
    }

    n_leave = _scrub_non_leave(n)

    if _RE_LEAVE.search(n_leave):
        scores["leave"] += 3

    payroll_hits = set(_RE_PAYROLL_STRONG.findall(n))
    scores["payroll"] += 3 * len(payroll_hits)

    if _RE_PAYROLL_PAID_VERB.search(n):
        scores["payroll"] += 3

    if _RE_ATT_STRONG.search(n):
        scores["attendance"] += 3

    if _RE_ATT_WEAK.search(n):
        scores["attendance"] += 2

    if _RE_TASK.search(n):
        scores["task"] += 3

    if _RE_PROJECT.search(n):
        scores["project"] += 3

    return scores


# Tie-break order. A leave/payroll/attendance word beats a task word
# only on equal score; tasks always beat projects when both appear.
_MODULE_ORDER = [
    "leave",
    "payroll",
    "attendance",
    "task",
    "project",
]


def _pick_module(
    n: str,
) -> str | None:

    scores = _module_scores(n)

    best = max(_MODULE_ORDER, key=lambda m: scores[m])

    if scores[best] == 0:
        return None

    return best


# ---------------------------------------------------------
# 4. PEOPLE: "rahul's tasks", "is priya on leave", "salary of arun"
# ---------------------------------------------------------

_NAME_RE = r"([a-z][a-z.']*(?:\s+[a-z][a-z.']*){0,2})"

_PERSON_STOP = set("""
my me mine i you we he she they it us him her them his hers their
theirs our ours your yours the a an this that these those all any
every each some no none other another everyone everybody anyone team
company employee employees staff colleague colleagues today tomorrow
yesterday now current currently latest recent recently previous past
last next new old pending completed complete finished done approved
rejected cancelled canceled paid unpaid active ongoing overdue open
closed total full details detail info information list records record
history report status task tasks leave leaves payroll payslip payslips
salary salaries attendance project projects follow up and or of for in
on at to from by with about whose who what which when where how why
show get give find display view check see tell please can could would
will is are was were do does did has have had been being be not yes ok
okay hello hi hey hr admin manager boss sir madam mam bro
basic gross net medical conveyance performance bonus pf esi tds
professional tax take home deductions deduction allowance allowances
monthly weekly daily month week year days day hours hour time login
logout present absent late early break working work worked
approve approves approving reject rejects rejecting cancel apply
applied applying taken took take got
january february march april may june july august september october
november december jan feb mar apr jun jul aug sep sept oct nov dec
monday tuesday wednesday thursday friday saturday sunday
many much more most less than then there here also just only
assigned allocated given handled owned related under belonging
balance remaining left available entitled count milestone milestones
deadline deadlines progress notes note meeting meetings
annual yearly quarterly total final base fixed variable incentive
latest recent previous monthly overtime casual sick earned
""".split())

_NAME_JOINERS = {"and", "or", "vs", "versus"}


def _clean_person(
    name: str | None,
) -> str | None:
    """Return a plausible person name or None."""

    if not name:
        return None

    tokens = [
        t.replace("'s", "").strip(".'")
        for t in name.lower().split()
    ]

    tokens = [t for t in tokens if t]

    if not tokens:
        return None

    if any(t in _NAME_JOINERS for t in tokens):
        return None

    runs: list[list[str]] = []
    current: list[str] = []

    for token in tokens:
        if token in _PERSON_STOP:
            if current:
                runs.append(current)
                current = []
        else:
            current.append(token)

    if current:
        runs.append(current)

    if not runs:
        return None

    candidate = runs[-1]

    if len(candidate) > 3 or len(candidate[0]) < 2:
        return None

    if any(t.isdigit() for t in candidate):
        return None

    return " ".join(candidate)


def _person_patterns(
    noun: str,
) -> list[str]:

    return [

        # tasks of priya / leave for arun / salary of rahul
        r"\b" + noun + r"\s+(?:[a-z]+\s+){0,2}?(?:of|for|by|from|"
        r"belonging to|assigned to|given to|allocated to|handled by|"
        r"done by|owned by|related to|under|taken by|applied by)\s+" +
        _NAME_RE,

        # rahul's pending tasks
        _NAME_RE + r"'s\s+(?:[a-z]+\s+){0,2}" + noun + r"\b",

        # show priya tasks / get arun pending leaves
        r"\b(?:show|get|find|give|display|list|view|check|see|fetch|"
        r"pull up|open|tell me)\s+(?:me\s+)?(?:all\s+)?" + _NAME_RE +
        r"\s+(?:[a-z]+\s+){0,2}" + noun + r"\b",

        # what tasks does rahul have / how many leaves did arun take
        r"\b(?:what|which|how many)\s+(?:[a-z]+\s+){0,2}" + noun +
        r"\s+(?:does|did|do|is|are|has|have|was)\s+" + _NAME_RE +
        r"\s+(?:have|has|got|take|taken|took|apply|applied|doing|"
        r"working|assigned|handling|pending|completed|finished|left|"
        r"remaining)\b",

        # does rahul have any pending tasks / did priya take leave
        r"\b(?:does|did|has|have|is|was|will)\s+" + _NAME_RE +
        r"\s+(?:have|has|got|take|taken|took|apply|applied|completed|"
        r"finished|done|submitted|any|on)\s+(?:[a-z]+\s+){0,3}" +
        noun + r"\b",

        # what is rahul salary / how much is priya payslip
        r"\b(?:what|how much)\s+(?:is|was|are|does|did)\s+" + _NAME_RE +
        r"\s+(?:[a-z]+\s+){0,2}" + noun + r"\b",
    ]


_PAYROLL_PERSON_EXTRA = [

    # karthik payslip / rahul salary details
    r"^" + _NAME_RE + r"\s+(?:[a-z]+\s+)?(?:salary|salaries|payslips?|"
    r"payroll)\b",
]

_ATT_PERSON_EXTRA = [

    # is rahul present today / was priya late
    r"\b(?:is|was|did|does|has|will|are|were)\s+" + _NAME_RE +
    r"\s+(?:[a-z]+\s+)?(?:present|absent|late|login|logout|in office|"
    r"here|available|online|working|came|come|attend\w*|punch\w*|"
    r"on time|on break)\b",

    # when did rahul login / what time did priya logout
    r"\b(?:when|what time)\s+(?:did|does|will|has|is|was)\s+" +
    _NAME_RE + r"\s+(?:login|logout|come|arrive|start|finish|end)\b",
]

_LEAVE_PERSON_EXTRA = [

    # is rahul on leave today / did priya take leave
    r"\b(?:is|was|will|did|does|has|had|are)\s+" + _NAME_RE +
    r"\s+(?:on|take|taken|took|apply|applied|applying|going on|"
    r"gone on|have|has|get|got)\s+(?:[a-z]+\s+){0,2}leaves?\b",
]


def _find_person(
    n: str,
    text: str,
    noun: str,
    extra: list[str] | None = None,
    fallback=None,
) -> str | None:
    """
    Find the employee a sentence is about (not the sender).
    Returns None for "my", "me", "I", dates, months and status words.
    """

    for pattern in _person_patterns(noun) + list(extra or []):

        for match in re.finditer(pattern, n):

            name = _clean_person(match.group(1))

            if name:
                return name

    if fallback is not None:

        try:
            name = _clean_person(fallback(text))
        except Exception:
            name = None

        if name:
            return name

    return None


# ---------------------------------------------------------
# 5. PROJECT-NOTE INTENT (uses the existing extractor first)
# ---------------------------------------------------------

_NOTE_ARTICLE = (
    r"(?:my\s+|the\s+|a\s+|an\s+|this\s+|that\s+|one\s+|new\s+|"
    r"another\s+|project\s+)*"
)


def _detect_project_note_intent(
    message: str,
    n: str,
) -> "Intent | None":

    if not re.search(r"\bnotes?\b", n):
        return None

    # "task notes" is not a project note.
    if re.search(r"\btask\s+notes?\b", n):
        return None

    # 1. Explicit structured commands (existing extractor).
    note = extract_project_note_request(message)

    if note:

        action = note.get("action")

        if action == "create":
            return Intent.CREATE_PROJECT_NOTE

        if action == "update":
            return Intent.UPDATE_PROJECT_NOTE

        if action == "delete":
            return Intent.DELETE_PROJECT_NOTE

        if action == "view":
            return Intent.GET_PROJECT_NOTES

    # 2. Natural wording. Notes about another module are not
    #    project notes.
    if (
        _RE_LEAVE.search(_scrub_non_leave(n))
        or _RE_PAYROLL_STRONG.search(n)
        or _RE_ATT_STRONG.search(n)
    ):
        return None

    query = _is_query(n, message)

    how_to = bool(_HOW_TO.match(n))

    if re.search(
        r"\b(?:delete|remove|erase|discard|clear)\s+" +
        _NOTE_ARTICLE + r"notes?\b",
        n,
    ):
        return Intent.DELETE_PROJECT_NOTE

    if re.search(
        r"\b(?:update|edit|change|modify|revise|correct|amend)\s+" +
        _NOTE_ARTICLE + r"notes?\b(?!\s+on\s+(?:the\s+)?status)",
        n,
    ) and not re.match(r"^update on\b", n):
        return Intent.UPDATE_PROJECT_NOTE

    if (
        re.search(
            r"\b(?:add|create|write|make|put|save|post|insert|record|"
            r"jot|log|take)\s+(?:down\s+)?" + _NOTE_ARTICLE +
            r"notes?\b|\bnote\s+down\b",
            n,
        )
        and (not query or how_to)
    ):
        return Intent.CREATE_PROJECT_NOTE

    if (
        re.search(r"\bnotes\b", n)
        and (query or _has_self(n) or _RE_PROJECT.search(n))
    ) or (
        re.search(r"\bnote\b", n)
        and _RE_PROJECT.search(n)
        and query
    ):
        return Intent.GET_PROJECT_NOTES

    return None


# ---------------------------------------------------------
# 6. TASK-SPECIFIC HELPERS
# ---------------------------------------------------------

_TASK_GENERIC = set("""
my me mine all any new old recent latest current previous pending
completed complete finished done overdue today tomorrow this that the
status progress list details detail info summary history report
overview updates update total in active open closed urgent high low
priority assigned working ongoing next upcoming of for on about
""".split())


def _task_lookup_target(
    n: str,
) -> bool:
    """True when the sentence points at ONE specific task."""

    # task id: "task 1042", "task id abc123", "task #45"
    if re.search(
        r"\btask\s*(?:id|number|no|num)?\s*[:#]?\s*"
        r"(?=[a-z0-9]*\d)[a-z0-9]{3,}\b",
        n,
    ):
        return True

    if re.search(r"\btasks\b", n):
        return False

    def _target_ok(target: str) -> bool:

        words = target.split()

        return bool(words) and not any(
            w in _TASK_GENERIC for w in words
        )

    # details of task X / description of the X task
    match = re.search(
        r"\b(?:details?|description|info|information|summary|overview)"
        r"\s+(?:of|about|on|for)\s+(?:the\s+|my\s+|this\s+)?"
        r"(?:task\s+)?([a-z0-9][a-z0-9 ]*?)(?:\s+task)?$",
        n,
    )

    if match and _target_ok(match.group(1)):
        return True

    # tell me about the X task / explain the X task
    match = re.search(
        r"\b(?:tell me about|explain|describe|what is)\s+(?:the\s+)?"
        r"([a-z0-9][a-z0-9 ]*?)\s+task\b",
        n,
    )

    if match and _target_ok(match.group(1)):
        return True

    # open task X / view task X / show task X
    match = re.search(
        r"\b(?:show|view|open|get|see|find|display|check)\s+"
        r"(?:me\s+)?(?:the\s+)?task\s+([a-z0-9][a-z0-9 ]*)$",
        n,
    )

    if match and _target_ok(match.group(1)):
        return True

    return False


def _other_module_nouns(
    n: str,
) -> bool:
    """Leave / payroll / attendance / project / note words present."""

    return bool(
        _RE_LEAVE.search(_scrub_non_leave(n))
        or _RE_PAYROLL_STRONG.search(n)
        or _RE_ATT_STRONG.search(n)
        or _RE_PROJECT.search(n)
        or re.search(r"\bnotes?\b", n)
    )


def _detect_task_mutation(
    message: str,
    text: str,
    n: str,
) -> "Intent | None":
    """Create / update / delete a task (explicit commands only)."""

    has_task = bool(_RE_TASK.search(n))

    query = _is_query(n, message)

    how_to = bool(_HOW_TO.match(n))

    # ----- DELETE ------------------------------------------
    if has_task and re.search(
        r"\b(?:delete|remove|cancel|drop|discard|scrap|erase)\b", n
    ):
        return Intent.DELETE_TASK

    # Original behaviour: "delete/remove ... work" also deletes a task.
    if (
        re.search(r"\b(?:delete|remove)\b.*\bworks?\b", n)
        and not re.search(
            r"\bwork(?:ing)?\s+(?:hours?|time|from|day|days|week)\b", n
        )
        and not _other_module_nouns(n)
    ):
        return Intent.DELETE_TASK

    # ----- CREATE ------------------------------------------
    if has_task and (
        (
            re.search(
                r"\b(?:create|add|make|raise|register|insert|assign|"
                r"enter)\b",
                n,
            )
            and (not query or how_to)
        )
        or re.match(r"^" + _FILLER + r"(?:a\s+)?new\s+task\b", n)
        or re.search(
            r"\b(?:need|want|wish|like)\s+(?:to\s+)?(?:have\s+|get\s+|"
            r"be\s+given\s+)?(?:a\s+|an\s+)?new\s+task\b",
            n,
        )
    ):
        return Intent.CREATE_TASK

    # ----- UPDATE ------------------------------------------
    verbs = (
        r"(?:mark|set|change|update|edit|modify|complete|finish|close|"
        r"reopen|re open|reschedule|reassign|rename|postpone|extend|"
        r"start|begin|resume|pause|hold|put)"
    )

    if has_task and re.search(
        _CMD_PREFIX + verbs + r"\b(?!\s+on\b)", n
    ):
        return Intent.UPDATE_TASK

    # Statements: "I finished the animation task", "I started task X"
    if (
        has_task
        and "?" not in message
        and re.search(
            r"^" + _FILLER + r"i\s+(?:have\s+|just\s+|already\s+)*"
            r"(?:completed|finished|done|started|begun|resumed)\b",
            n,
        )
    ):
        return Intent.UPDATE_TASK

    # "Mark Animation Website as Completed" (existing extractor),
    # but never when the sentence is about another module.
    if not _other_module_nouns(n):

        if extract_task_status_update(text):
            return Intent.UPDATE_TASK

        if re.search(
            r"^\s*(?:please\s+)?mark\s+.+?\s+"
            r"(?:done|completed|complete|finished)\s*[.!?]*$",
            text,
        ):
            return Intent.UPDATE_TASK

    return None


# ---------------------------------------------------------
# 7. WHO-QUESTIONS (project team vs. live attendance)
# ---------------------------------------------------------

def _detect_who_intent(
    n: str,
    module: str | None,
) -> "Intent | None":

    if module not in (None, "attendance", "project"):
        return None

    # Existing phrases that always meant the project team.
    if re.search(
        r"\b(?:project team|project members|team members|my team|"
        r"members of (?:the )?(?:project|team))\b",
        n,
    ):
        return Intent.GET_PROJECT_TEAM

    # Existing phrases that always meant "who is working right now".
    if (
        module in (None, "attendance")
        and re.search(
            r"\b(?:active attendance|currently active|"
            r"currently working)\b",
            n,
        )
        and not re.search(r"\bworking\s+(?:on|under|with)\b", n)
    ):
        return Intent.GET_ACTIVE_ATTENDANCE

    # Existing phrase: "who is assigned" -> project team.
    if re.search(r"\bwho\s+(?:is|are)\s+assigned\b", n):
        return Intent.GET_PROJECT_TEAM

    asks_who = bool(
        re.search(r"\bwho\b|\b(?:anyone|anybody|someone|somebody)\b", n)
        or re.search(
            r"\bhow many\s+(?:employees|people|staff|members)\b", n
        )
    )

    if not asks_who:
        return None

    # who is working ON a project / who is assigned / who handles ...
    if re.search(
        r"\bwho\b.*\b(?:working\s+(?:on|under|with)|assigned|allocated|"
        r"handling|managing|leading|responsible|owner|in\s*charge|"
        r"part of|involved|member|members)\b",
        n,
    ) and (
        module == "project"
        or _RE_PROJECT_CUE.search(n)
        or re.search(r"working\s+(?:on|under|with)", n)
    ):
        return Intent.GET_PROJECT_TEAM

    if module not in (None, "attendance"):
        return None

    # who is absent / late today -> attendance records
    if re.search(
        r"\b(?:who|how many\s+(?:employees|people|staff))\b.*\b"
        r"(?:absent|late|not come|not login|missing|yet to login)\b",
        n,
    ):
        return Intent.GET_ATTENDANCE_HISTORY

    # who is present / online / working now
    if re.search(
        r"\b(?:who|anyone|anybody|someone|somebody|"
        r"how many\s+(?:employees|people|staff))\b.*\b"
        r"(?:present|online|login|in office|working|active|available|"
        r"here|on duty)\b",
        n,
    ):
        return Intent.GET_ACTIVE_ATTENDANCE

    return None


# ---------------------------------------------------------
# 8. ATTENDANCE HELPERS
# ---------------------------------------------------------

_MONTH_NAMES = (
    r"(?:january|february|march|april|june|july|august|september|"
    r"october|november|december)"
)

_RE_ATT_HISTORY = re.compile(
    r"\b(?:history|records|report|summary|log|logs|sheet|"
    r"all attendance|monthly|weekly)\b|"
    r"\b(?:this|last|previous|current|whole|entire|every)\s+"
    r"(?:week|month)\b|"
    r"\blast\s+(?:\d+\s+days|few\s+days|year)\b|"
    r"\b(?:previous|past)\s+(?:week|month|days|attendance|records)\b|"
    r"\b(?:in|for|during|of)\s+(?:the\s+)?(?:week|month)\b|"
    r"\b(?:in|for|of|during)\s+" + _MONTH_NAMES + r"\b|"
    r"\bhow many days\b|"
    r"\b(?:days present|days absent|present days|absent days|"
    r"total days|times late|late count)\b"
)

_RE_ATT_FIELD = re.compile(
    r"\b(?:login|logout|attendance id|attendance status|"
    r"break (?:start|started|end|ended|time|duration)|"
    r"working hours|work hours|work time|working time|hours worked|"
    r"worked hours|total hours|overtime)\b"
)

_RE_ATT_FIELD_DIRECT = re.compile(
    r"\b(?:attendance id|attendance status)\b"
)

_RE_TIME_QUESTION = re.compile(
    r"\b(?:what time|when|at what time|how long|"
    r"how many (?:hours|minutes)|how much time|time)\b"
)

_RE_ATT_ACTION = re.compile(
    _CMD_PREFIX +
    r"(?:mark|submit|regularize|regularise|correct|edit|update|"
    r"change|modify|delete|remove|add|create|login|logout)\b"
)


# ---------------------------------------------------------
# 9. LEAVE HELPERS
# ---------------------------------------------------------

_LEAVE_DATE = (
    r"\b(?:tomorrow|today|tonight|" + _WEEKDAYS + r"|next week|"
    r"this week|next month|day after tomorrow|"
    r"\d{1,2}(?:st|nd|rd|th)|\d{1,2}/\d{1,2})\b"
)

_LEAVE_INQUIRY_GUARD = re.compile(
    r"\b(?:status|balance|history|how many|taken|used|left|remaining|"
    r"available|approved|rejected|pending|record|records|details|list|"
    r"show|track|check|know|see|view|whether|if|entitled|eligible|"
    r"policy|count|total)\b"
)

_LEAVE_CREATE_VERBS = re.compile(
    r"\b(?:apply|applying|request|requesting|raise|submit|create|book|"
    r"file|need|want|require|wish|take|taking|sanction|"
    r"avail|availing|going on|planning|plan|looking to)\b|"
    r"\b(?:give|get|grant)\s+(?:me|us)\s+(?:a\s+|an\s+|one\s+|"
    r"some\s+)?(?:(?!my\b)[a-z]+\s+)?leave\b"
)

# Sentences that start with a question word are questions, not requests.
_INTERROGATIVE_START = re.compile(
    r"^" + _FILLER +
    r"(?:what|which|who|whom|whose|when|where|why|how|is|are|was|were|"
    r"do|does|did|have|has|had|any|am)\b"
)


def _leave_status_word(
    n: str,
) -> str | None:
    """Map any wording of a leave status to approved/rejected/pending."""

    if re.search(
        r"\b(?:not yet approved|yet to be approved|not approved yet|"
        r"awaiting|waiting|pending|under review|in review|unattended)\b",
        n,
    ):
        return "pending"

    if re.search(
        r"\b(?:rejected|declined|denied|refused|turned down|"
        r"not approved|unapproved)\b",
        n,
    ):
        return "rejected"

    if re.search(
        r"\b(?:approved|accepted|sanctioned|granted)\b", n
    ):
        return "approved"

    if re.search(r"\b(?:cancelled|canceled)\b", n):
        return "cancelled"

    return None


# ---------------------------------------------------------
# 10. PAYROLL HELPERS
# ---------------------------------------------------------

_RE_PAY_ACTION = re.compile(
    _CMD_PREFIX +
    r"(?:update|change|edit|increase|raise|revise|correct|modify|"
    r"delete|remove)\b"
)

_RE_PAY_ADJACENT_STATUS = re.compile(
    r"\b(?:paid|pending|unpaid|credited|processed|released|disbursed|"
    r"outstanding|delayed|received)\s+"
    r"(?:payroll|payslips?|salar(?:y|ies)|payments?|pay)\b"
)

_RE_PAY_LIST_START = re.compile(
    r"^" + _FILLER +
    r"(?:show|list|display|view|give|get|fetch|see|which|what|all)\b"
)

_RE_PAY_WHEN = re.compile(
    r"\bwhen\b.*\b(?:salary|payslip|payroll|paid|credit\w*|payday)\b|"
    r"\bpayday\b|\bstatus\b"
)

_RE_PAY_FIELD_WORDS = re.compile(
    r"\b(?:basic|medical|bonus|performance|conveyance|travel allowance|"
    r"pf|provident fund|esi|tds|professional tax|gross|net|take home|"
    r"in hand|deductions?|allowances?)\b"
)


def _safe_payslip_month(
    n: str,
) -> str | None:
    """Month named in the sentence (never the verb 'may')."""

    return extract_payslip_month(n)


# ---------------------------------------------------------
# 11. PROJECT HELPERS
# ---------------------------------------------------------

_RE_PROJECT_MUTATION = re.compile(
    _CMD_PREFIX +
    r"(?:create|add|delete|remove|update|edit|change|modify|mark|set|"
    r"close|assign|rename|archive)\b"
)


_RE_PROJECT_DEADLINE = re.compile(
    r"\b(?:deadlines?|due|overdue|delayed|behind schedule|"
    r"running late|past due|missed)\b|"
    r"\b(?:next|upcoming|nearest|earliest)\s+"
    r"(?:project\s+)?(?:deadline|due date)\b|"
    r"\bwhen\b.*\b(?:finish|finished|end|ends|complete|completed|"
    r"deliver|delivered|delivery|ready|launch|go live|submit|"
    r"submitted|done)\b"
)


_RE_PROJECT_PROGRESS = re.compile(
    r"\bprogress\b|"
    r"\bhow\s+much\b.*\b(?:done|completed|finished|complete|left|"
    r"remaining)\b|"
    r"\bhow\b.*\b(?:going|coming along|doing)\b|"
    r"\bwhere\s+are\s+we\b"
)

_RE_PROJECT_TEAM = re.compile(
    r"\b(?:team|members?|teammates|colleagues|crew|resources|people|"
    r"who)\b"
)

_RE_PROJECT_STATUSY = re.compile(
    r"\b(?:completed|complete|finished|done|pending|active|ongoing|"
    r"in progress|at risk|status|progress|deadline|due|going|team|"
    r"members|who|details|info|overview|milestone)\b"
)


# ---------------------------------------------------------
# 12. NAMED-ITEM STATUS FALLBACK
# "Is the animation completed?"  (no module word at all)
# ---------------------------------------------------------

_FALLBACK_AUX = re.compile(r"\b(?:is|are|was|were|has|have|did|do|am)\b")

_FALLBACK_DONE = re.compile(
    r"\b(?:completed|complete|finished|done|in progress|overdue|"
    r"incomplete|unfinished)\b"
)

_FALLBACK_PROJECT_STATUS = re.compile(
    r"\b(?:completed|complete|finished|done|pending|active|ongoing|"
    r"in progress|at risk)\b"
)

_FALLBACK_NOISE = set("""
is are was were has have had did do does am i my me we our the a an it
this that these those been being be yet already still now today
tomorrow yesterday completed complete finished done pending active
ongoing in progress overdue incomplete unfinished at risk all any
everything anything something not no yes please
""".split())


def _has_named_subject(
    n: str,
) -> bool:

    return any(
        w not in _FALLBACK_NOISE and len(w) >= 3
        for w in n.split()
    )


# =========================================================
# DETECT INTENT
#
# Order of decisions (same idea as before, but module words
# decide the module; status words never do on their own):
#
#   1. unwanted talk / human help                 (unchanged)
#   2. project notes                              (before tasks/projects)
#   3. explicit task create / update / delete
#   4. follow-ups                                 (unchanged detection)
#   5. meetings                                   (unchanged phrases)
#   6. who-questions (project team / live attendance)
#   7. module routing: tasks, attendance, leaves, payroll, projects
#   8. natural-language fallbacks (no module word in the sentence)
#   9. employee details                           (unchanged)
#  10. general chat
# =========================================================

def detect_intent(
    message: str,
) -> Intent:

    text = _normalize(message)

    # Canonical, typo-tolerant version used by the NLU layer.
    n = _nlu_normalize(message)

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
    # PROJECT NOTES
    # Checked before tasks, follow-ups and projects, so that
    # "Add note to Task Tracker: follow up with client" is a
    # project note and not a task or a follow-up.
    # =====================================================

    note_intent = _detect_project_note_intent(message, n)

    if note_intent:
        return note_intent

    # =====================================================
    # TASKS - EXPLICIT COMMANDS (create / update / delete)
    # Only real commands; "show new tasks" is NOT a create.
    # =====================================================

    task_mutation = _detect_task_mutation(message, text, n)

    if task_mutation:
        return task_mutation

    # =====================================================
    # FOLLOW-UPS (existing detection, unchanged)
    # Runs before the generic task / project / leave / payroll
    # rules so "which follow ups are pending?" stays a follow-up.
    # =====================================================

    if re.search(r"\bfollow[\s-]*ups?\b", text):
        return Intent.GET_FOLLOWUPS

    # =====================================================
    # MY MEETINGS (existing phrases, unchanged)
    # =====================================================

    if _contains_any(
        text,
        [
            "my meetings",
            "my meeting",
            "show my meetings",
            "show my meeting",
            "list my meetings",
            "list my meeting",
            "what are my meetings",
            "what is my meeting",
            "meetings assigned to me",
            "meeting assigned to me",
            "meetings for me",
            "meeting for me",
            "my upcoming meetings",
            "show my upcoming meetings",
            "my scheduled meetings",
            "show my scheduled meetings",
            "my meetings today",
            "show my meetings today",
        ],
    ):
        return Intent.GET_MEETINGS

    # =====================================================
    # WHICH MODULE IS THIS SENTENCE ABOUT?
    # Decided by module nouns (task, leave, salary, attendance,
    # project ...), never by "pending" / "completed" alone.
    # =====================================================

    module = _pick_module(n)

    query = _is_query(n, message)

    selfref = _has_self(n)

    # =====================================================
    # WHO-QUESTIONS
    # "Who is working on the Arushuvai website?" -> project team
    # "Who is working now?" / "who is present?"  -> live attendance
    # =====================================================

    who_intent = _detect_who_intent(n, module)

    if who_intent:
        return who_intent

    # =====================================================
    # TASKS
    # =====================================================

    if module == "task":
        
        if re.search(
            r"\b(?:how many|number of|count of)\b.*\b(?:tasks?|assignments?)\b",
            n,
        ):
            return Intent.GET_TASK_COUNT
        # One specific task (by id or by name).
        if _task_lookup_target(n):
            return Intent.GET_TASK

        # Another employee's tasks.
        task_employee = _find_person(
            n,
            text,
            r"tasks?",
            fallback=extract_task_employee_name,
        )

        if task_employee:
            return Intent.GET_TASKS_BY_EMPLOYEE

        # Everything else about tasks: my tasks, pending tasks,
        # status of a task, overdue tasks, today's tasks ...
        if query or _has_owner(n) or _is_short(n) or re.search(
            r"\b(?:pending|completed|complete|finished|done|"
            r"in progress|incomplete|unfinished|overdue|current|"
            r"previous|past|recent|all|status|progress|assigned|"
            r"today|tomorrow|deadline)\b",
            n,
        ):
            return Intent.GET_TASKS

        return Intent.GENERAL_CHAT

    # =====================================================
    # ATTENDANCE
    # =====================================================

    if module == "attendance":

        # Commands we cannot perform ("mark my attendance").
        if _RE_ATT_ACTION.search(n) and not query:
            return Intent.GENERAL_CHAT

        attendance_person = _find_person(
            n,
            text,
            r"(?:attendance|login|logout)",
            extra=_ATT_PERSON_EXTRA,
            fallback=extract_attendance_employee_name,
        )

        # Several days: history, report, this month, last week ...
        if _RE_ATT_HISTORY.search(n):
            return Intent.GET_ATTENDANCE_HISTORY

        # A specific value: login time, logout time, hours worked ...
        # A yes/no question about a person ("did rahul come today?")
        # is a plain attendance question, not a field lookup.
        yes_no = bool(re.match(
            r"^" + _FILLER + r"(?:did|is|was|has|does|will|are|were)\b",
            n,
        ))

        if _RE_ATT_FIELD_DIRECT.search(n) or (
            _RE_ATT_FIELD.search(n)
            and (
                _RE_TIME_QUESTION.search(n)
                or (attendance_person and not yes_no)
            )
        ):
            return Intent.GET_ATTENDANCE_FIELD

        # Present / absent / late today, my attendance, show X attendance
        return Intent.GET_ATTENDANCE

    # =====================================================
    # LEAVES
    # =====================================================

    if module == "leave":

        # ---- approve / reject / cancel (status change) -------
               # ---- status wording (approved / pending / rejected) ----
        leave_status = _leave_status_word(n)

        leave_person = _find_person(
            n,
            text,
            r"leaves?",
            extra=_LEAVE_PERSON_EXTRA,
            fallback=extract_leave_employee_name,
        )

        if leave_status:

            # Question-style checks:
            # "Is my leave approved?"
            # "Did my leave request get rejected?"
            # "Is my leave still pending?"
            if _is_status_check(n) or re.search(
                r"\b(?:did|has|have|was|is)\b.*\b(?:approve|reject|"
                r"decline|deny)\b",
                n,
            ):
                if leave_status == "approved":
                    return Intent.GET_APPROVED_LEAVES

                if leave_status == "pending":
                    return Intent.GET_PENDING_LEAVES

                if leave_status == "rejected":
                    return Intent.GET_REJECTED_LEAVES

            # List-style commands:
            # "Show my pending leave requests"
            # "Show my approved leaves"
            # "Show my rejected leave requests"
            if leave_status == "approved":
                return Intent.GET_APPROVED_LEAVES

            if leave_status == "pending":
                return Intent.GET_PENDING_LEAVES

            if leave_status == "rejected":
                return Intent.GET_REJECTED_LEAVES

            return Intent.GET_LEAVES_BY_EMPLOYEE

        # ---- everyone / the team vs. one employee ------------
        if leave_person:
            return Intent.GET_LEAVES_BY_EMPLOYEE

        if selfref:
            return Intent.GET_LEAVES_BY_EMPLOYEE

        # Balance questions without "my": "leave balance",
        # "how many leaves are left" -> the asking employee.
        if re.search(
            r"\b(?:balance|remaining|left|available|entitle\w*|quota|"
            r"how many|status)\b",
            n,
        ) and not _RE_TEAM_WORDS.search(n):
            return Intent.GET_LEAVES_BY_EMPLOYEE

        if query or _is_short(n) or _RE_TEAM_WORDS.search(n):
            return Intent.GET_LEAVES

        return Intent.GENERAL_CHAT

    # =====================================================
    # PAYROLL / PAYSLIP
    # =====================================================

    if module == "payroll":

        # Changing pay is not something this assistant does.
        if _RE_PAY_ACTION.search(n) and not query:
            return Intent.GENERAL_CHAT

        payroll_person = _find_person(
            n,
            text,
            r"(?:salary|salaries|payslips?|payroll|bonus|deductions?|"
            r"allowances?|pf|esi|tds)",
            extra=_PAYROLL_PERSON_EXTRA,
            fallback=extract_payroll_employee_name,
        )

        payroll_status = extract_payroll_status(n)

        payroll_field = extract_payroll_field(n)

        payslip_month = _safe_payslip_month(n)

        # ---- paid / pending / credited / when will I get it --
        if payroll_status:

            if _is_status_check(n) or re.search(r"\b(?:yet|still)\b", n):
                return Intent.GET_PAYROLL_STATUS

            if (
                _RE_PAY_ADJACENT_STATUS.search(n)
                or _RE_PAY_LIST_START.match(n)
            ):
                if payroll_status == "Paid":
                    return Intent.GET_PAID_PAYROLL

                return Intent.GET_PENDING_PAYROLL

            return Intent.GET_PAYROLL_STATUS

        if _RE_PAY_WHEN.search(n):
            return Intent.GET_PAYROLL_STATUS

        # ---- one salary component: PF, bonus, take-home ... --
        if payroll_field:
            return Intent.GET_PAYROLL_DETAILS

        # ---- payslip of a month ------------------------------
        if payslip_month and (
            payroll_person
            or selfref
            or re.search(r"\b(?:payslip|salary|payroll)\b", n)
        ):
            return Intent.GET_PAYSLIP_BY_EMPLOYEE_AND_MONTH

        # ---- another employee's payroll ----------------------
        if payroll_person:
            return Intent.GET_PAYROLL_BY_EMPLOYEE

        # ---- my payslip / everyone's payroll -----------------
        if query or selfref or _is_short(n):
            return Intent.GET_PAYROLL

        return Intent.GENERAL_CHAT

    # =====================================================
    # PROJECTS (explicit project / milestone word)
    # =====================================================

    if module == "project" or (
        module is None
        and _RE_PROJECT_CUE.search(n)
        and query
        and _RE_PROJECT_STATUSY.search(n)
    ):

        # We cannot create / edit / delete projects.
        if (
            module == "project"
            and _RE_PROJECT_MUTATION.search(n)
            and not query
        ):
            return Intent.GENERAL_CHAT

        if re.search(r"\bmilestones?\b", n):
            return Intent.GET_PROJECT_MILESTONES

        if _RE_PROJECT_DEADLINE.search(n):
            return Intent.GET_PROJECT_DEADLINES

        if _RE_PROJECT_TEAM.search(n) and re.search(
            r"\b(?:team|members?|teammates|colleagues|crew|resources|"
            r"people|who)\b",
            n,
        ):
            return Intent.GET_PROJECT_TEAM

        if _RE_PROJECT_PROGRESS.search(n):
            return Intent.GET_PROJECT_PROGRESS

        if module is None:
            return Intent.GET_PROJECTS

        if query or _has_owner(n) or _is_short(n):
            return Intent.GET_PROJECTS

        return Intent.GENERAL_CHAT

    # =====================================================
    # NO MODULE WORD IN THE SENTENCE
    # Natural phrasing that still clearly means one module.
    # =====================================================

    # "What should I do today?", "What's on my plate?",
    # "What do I have to finish?"
    if _RE_TASK_PHRASE.search(n) and (query or selfref):
        return Intent.GET_TASKS

    # "What am I working on?"  (no project word -> my tasks)
    if _RE_WORKING_ON.search(n):
        return Intent.GET_TASKS

    # "Have I finished everything?" / "Is the animation completed?"
    # Only for a completion question about a named item, and never
    # for things that are other entities (reimbursement, ticket ...).
    if (
        _FALLBACK_AUX.search(n)
        and _FALLBACK_DONE.search(n)
        and _has_named_subject(n)
        and not _RE_OTHER_ENTITY.search(n)
        and (query or selfref)
    ):
        return Intent.GET_TASKS

    # =====================================================
    # EMPLOYEES (unchanged)
    # =====================================================

    employee_list_field = extract_employee_list_field(text)

    if employee_list_field:
        return Intent.GET_EMPLOYEE_FIELD_LIST

    # =====================================================
    # MY EMPLOYEE DETAILS
    # =====================================================

    if _contains_any(
        text,
        [
            "my details",
            "my employee details",
            "my profile",
            "my employee information",
            "show my details",
            "show my employee details",
            "show my profile",
            "what are my employee details",
            "i want to know my employee details",
        ],
    ):
        return Intent.GET_MY_DETAILS

    # =====================================================
    # EMPLOYEE FIELD
    # =====================================================

    employee_field = extract_employee_field(text)

    employee_name = extract_employee_name(text)

    if (
        employee_field
        and employee_name
    ):
        return Intent.GET_EMPLOYEE_FIELD

    # =====================================================
    # EMPLOYEE DETAILS
    # =====================================================

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
    # EMPLOYEE LIST
    # "List all employees" / "employee list"
    # =====================================================

    if re.search(
        r"\b(?:all|list|show|display|get)\s+(?:of\s+)?(?:the\s+)?"
        r"(?:all\s+)?employees\b|\bemployees?\s+list\b|"
        r"\blist\s+of\s+employees\b",
        n,
    ):
        return Intent.GET_EMPLOYEES

    # =====================================================
    # GENERAL CHAT
    # =====================================================

    return Intent.GENERAL_CHAT

# =========================================================
# MODULE HELP / DYNAMIC FOLLOW-UP SUGGESTIONS
#
# This layer does not replace detect_intent(). It provides
# example questions for each existing CRM module so the chat
# service can show useful next questions after an answer.
# =========================================================

MODULE_FOLLOWUPS: dict[str, list[str]] = {
    "attendance": [
        "What time did I log in today?",
        "What time did I log out yesterday?",
        "How many hours did I work this week?",
        "Show my attendance history",
        "Was I present on Monday?",
        "Show my active attendance status",
    ],
    "leave": [
        "How many leaves do I have remaining?",
        "Show my pending leave requests",
        "Is my latest leave approved?",
        "Show my leave history",
        "How do I apply for leave?",
        "What leave types are available?",
    ],
    "project": [
        "Show all my projects",
        "What is the progress of my project?",
        "Which projects are overdue?",
        "What are my project deadlines?",
        "Who is working on my project?",
        "Show the project milestones",
        "Show my project notes",
    ],
    "task": [
        "Show my pending tasks",
        "What tasks have I completed?",
        "Show my tasks due today",
        "Show details of a specific task",
        "What is the status of my task?",
        "Update my task status",
    ],
    "payroll": [
        "Has my salary been credited?",
        "Show my latest payslip",
        "Show my payslip for October",
        "What is my net salary?",
        "Show my salary deductions",
        "Is my salary still pending?",
    ],
    "employee": [
        "Show my employee profile",
        "What is my department?",
        "Show my designation",
        "Show my contact details",
        "Show employee details",
    ],
    "followups": [
        "Show my pending follow-ups",
        "What follow-ups are overdue?",
        "Show my completed follow-ups",
        "What follow-ups are due today?",
    ],
    "meetings": [
        "Show my upcoming meetings",
        "Do I have a meeting today?",
        "What is my next meeting?",
        "Show my meeting history",
    ],
    "hr": [
        "How can I contact HR?",
        "I need help with a leave request",
        "I have an issue with my attendance",
        "I need help with my payroll",
    ],
}

_MODULE_KEYWORDS: dict[str, tuple[str, ...]] = {
    "attendance": (
        "attendance", "login", "logout", "check in", "check out",
        "working hours", "present", "absent", "punch in", "punch out",
    ),
    "leave": (
        "leave", "vacation", "day off", "time off", "leave balance",
    ),
    "project": (
        "project", "milestone", "deadline", "project progress",
    ),
    "task": ("task", "tasks", "to do", "todo", "work assigned"),
    "payroll": (
        "payroll", "salary", "payslip", "pay slip", "payday",
        "bonus", "deduction",
    ),
    "employee": (
        "employee", "profile", "designation", "department",
        "employee details",
    ),
    "followups": ("follow-up", "followup", "follow ups", "followups"),
    "meetings": ("meeting", "meetings", "calendar", "schedule"),
    "hr": ("hr", "human resources", "human help"),
}


def detect_help_module(message: str) -> str | None:
    """Identify which module the employee wants examples/help for."""
    normalized = _nlu_normalize(message)

    help_phrases = (
        "what can i ask", "what should i ask", "what questions",
        "what can you do", "show examples", "give examples",
        "help me with", "what information can i get",
        "what details can i see", "how can i use",
    )
    if not any(phrase in normalized for phrase in help_phrases):
        return None

    # Prefer the most specific module keyword match.
    matches = []
    for module, keywords in _MODULE_KEYWORDS.items():
        for keyword in keywords:
            if keyword in normalized:
                matches.append((len(keyword), module))
    if matches:
        return max(matches)[1]

    # A general "what can I ask?" request returns all supported modules.
    return "all"


def get_intent_followups(intent: Intent | str) -> list[str]:
    """Return useful example questions for the detected intent."""
    value = intent.value if isinstance(intent, Intent) else str(intent)
    value = value.strip().lower()

    if "attendance" in value or value in {
        "get_active_attendance", "get_attendance_history",
        "get_attendance_field",
    }:
        module = "attendance"
    elif "leave" in value:
        module = "leave"
    elif "project" in value:
        module = "project"
    elif "task" in value:
        module = "task"
    elif "payroll" in value or "payslip" in value:
        module = "payroll"
    elif "employee" in value or value == "get_my_details":
        module = "employee"
    elif "followup" in value:
        module = "followups"
    elif "meeting" in value:
        module = "meetings"
    elif "human" in value or value == "human_help":
        module = "hr"
    else:
        return []

    return MODULE_FOLLOWUPS.get(module, []).copy()


def build_module_help_response(module: str | None = None) -> str:
    """Build a WhatsApp-friendly help response for one or all modules."""
    if not module or module == "all":
        sections = [
            ("Attendance", "attendance"),
            ("Leave", "leave"),
            ("Projects", "project"),
            ("Tasks", "task"),
            ("Payroll", "payroll"),
            ("Employee details", "employee"),
            ("Follow-ups", "followups"),
            ("Meetings", "meetings"),
            ("HR assistance", "hr"),
        ]
        lines = ["Here are some things you can ask me:"]
        for label, key in sections:
            examples = MODULE_FOLLOWUPS[key][:3]
            lines.append(f"\n*{label}*")
            lines.extend(f"• {question}" for question in examples)
        lines.append(
            "\nYou can ask in your own words too. "
            "For example, 'Did I come to office yesterday?'"
        )
        return "\n".join(lines)

    label = module.replace("_", " ").title()
    questions = MODULE_FOLLOWUPS.get(module, [])
    if not questions:
        return "I can help with attendance, leave, projects, tasks, payroll, employee details, follow-ups and meetings."

    lines = [f"Here are some questions you can ask about *{label}*:"]
    lines.extend(f"• {question}" for question in questions)
    return "\n".join(lines)
