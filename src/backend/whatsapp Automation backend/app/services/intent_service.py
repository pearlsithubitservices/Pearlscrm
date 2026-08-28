"""
Deterministic intent detection for CRM chatbot requests.

This service:
- Detects what the user is asking for.
- Does NOT call Gemini.
- Does NOT call the CRM.
- Extracts employee names and requested fields.

Supported areas:
    Employee
    Attendance
    General Chat
"""

import re
from enum import Enum


# =========================================================
# INTENT
# =========================================================

class Intent(str, Enum):

    # -----------------------------------------------------
    # EMPLOYEE
    # -----------------------------------------------------

    GET_EMPLOYEES = "GET_EMPLOYEES"

    GET_EMPLOYEE_DETAILS = "GET_EMPLOYEE_DETAILS"

    GET_EMPLOYEE_FIELD = "GET_EMPLOYEE_FIELD"

    GET_EMPLOYEE_FIELD_LIST = "GET_EMPLOYEE_FIELD_LIST"

    GET_MY_DETAILS = "GET_MY_DETAILS"

    # -----------------------------------------------------
    # ATTENDANCE
    # -----------------------------------------------------

    # Example:
    # show Pavithra attendance
    GET_ATTENDANCE = "GET_ATTENDANCE"

    # Example:
    # show Pavithra login time
    # show Pavithra status
    GET_ATTENDANCE_FIELD = "GET_ATTENDANCE_FIELD"

    # Example:
    # show active attendance
    GET_ACTIVE_ATTENDANCE = "GET_ACTIVE_ATTENDANCE"

    # Example:
    # show attendance history
    GET_ATTENDANCE_HISTORY = "GET_ATTENDANCE_HISTORY"

    # -----------------------------------------------------
    # GENERAL
    # -----------------------------------------------------

    GENERAL_CHAT = "GENERAL_CHAT"


# =========================================================
# ALL EMPLOYEES
# =========================================================

_EMPLOYEE_LIST_PATTERNS = [

    r"\bshow\s+all\s+employees?\b",

    r"\blist\s+(all\s+)?employees?\b",

    r"\bwho\s+are\s+the\s+employees?\b",

    r"\ball\s+employees?\b",

    r"\bemployee\s+list\b",
]


# =========================================================
# ALL EMPLOYEES + FIELD
# =========================================================

_EMPLOYEE_FIELD_LIST_PATTERNS = [

    # Email
    r"\bshow\s+all\s+employee\s+(emails?|email\s+addresses?)\b",

    r"\blist\s+all\s+employee\s+(emails?|email\s+addresses?)\b",

    # Contact
    r"\bshow\s+all\s+employee\s+(contacts?|phone\s+numbers?)\b",

    r"\blist\s+all\s+employee\s+(contacts?|phone\s+numbers?)\b",

    # ID
    r"\bshow\s+all\s+employee\s+(ids?|employee\s+ids?)\b",

    r"\blist\s+all\s+employee\s+(ids?|employee\s+ids?)\b",

    # Joining date
    r"\bshow\s+all\s+employee\s+(join(?:ing)?\s+dates?)\b",

    r"\blist\s+all\s+employee\s+(join(?:ing)?\s+dates?)\b",

    # Location
    r"\bshow\s+all\s+employee\s+(locations?)\b",

    r"\blist\s+all\s+employee\s+(locations?)\b",

    # Role
    r"\bshow\s+all\s+employee\s+(roles?|designations?)\b",

    r"\blist\s+all\s+employee\s+(roles?|designations?)\b",
]


# =========================================================
# SPECIFIC EMPLOYEE + FIELD
# =========================================================

_EMPLOYEE_FIELD_PATTERNS = [

    # Email
    r"\bshow\s+(.+?)\s+(email|email\s+address)\b",

    r"\bget\s+(.+?)\s+(email|email\s+address)\b",

    # Contact
    r"\bshow\s+(.+?)\s+(contact|phone|phone\s+number)\b",

    r"\bget\s+(.+?)\s+(contact|phone|phone\s+number)\b",

    # Employee ID
    r"\bshow\s+(.+?)\s+(employee\s+id|employeeid|id)\b",

    r"\bget\s+(.+?)\s+(employee\s+id|employeeid|id)\b",

    # Joining date
    r"\bshow\s+(.+?)\s+(join(?:ing)?\s+date)\b",

    r"\bget\s+(.+?)\s+(join(?:ing)?\s+date)\b",

    # Location
    r"\bshow\s+(.+?)\s+(location)\b",

    r"\bget\s+(.+?)\s+(location)\b",

    # Role
    r"\bshow\s+(.+?)\s+(role|designation|position)\b",

    r"\bget\s+(.+?)\s+(role|designation|position)\b",
]


# =========================================================
# SPECIFIC EMPLOYEE DETAILS
# =========================================================

_EMPLOYEE_DETAILS_PATTERNS = [

    r"\bshow\s+(.+?)\s+details?\b",

    r"\bget\s+(.+?)\s+details?\b",

    r"\bshow\s+details?\s+of\s+(.+?)\b",

    r"\bget\s+details?\s+of\s+(.+?)\b",
]


# =========================================================
# MY DETAILS
# =========================================================

_MY_DETAILS_PATTERNS = [

    r"\bshow\s+my\s+employee\s+id\b",

    r"\bshow\s+my\s+id\b",

    r"\bshow\s+my\s+email\b",

    r"\bshow\s+my\s+contact\b",

    r"\bshow\s+my\s+phone\b",

    r"\bshow\s+my\s+joining\s+date\b",

    r"\bshow\s+my\s+location\b",

    r"\bshow\s+my\s+role\b",

    r"\bshow\s+my\s+details?\b",
]


# =========================================================
# ATTENDANCE FIELD
# =========================================================
#
# Examples:
#
# show Pavithra login time
# show Pavithra logout time
# show Pavithra status
# show Pavithra break start
# show Pavithra break end
# show Pavithra attendance id
# show Pavithra total work seconds
# show Pavithra total work time
#
# =========================================================

_ATTENDANCE_FIELD_PATTERNS = [

    # -----------------------------------------------------
    # LOGIN TIME
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+login\s+time\b",

    r"\bget\s+(.+?)\s+login\s+time\b",

    # -----------------------------------------------------
    # LOGOUT TIME
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+logout\s+time\b",

    r"\bget\s+(.+?)\s+logout\s+time\b",

    # -----------------------------------------------------
    # BREAK START
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+break\s+start\b",

    r"\bget\s+(.+?)\s+break\s+start\b",

    # -----------------------------------------------------
    # BREAK END
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+break\s+end\b",

    r"\bget\s+(.+?)\s+break\s+end\b",

    # -----------------------------------------------------
    # STATUS
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+status\b",

    r"\bget\s+(.+?)\s+status\b",

    # -----------------------------------------------------
    # ATTENDANCE ID
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+attendance\s+id\b",

    r"\bget\s+(.+?)\s+attendance\s+id\b",

    # -----------------------------------------------------
    # TOTAL WORK SECONDS
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+total\s+work\s+seconds\b",

    r"\bget\s+(.+?)\s+total\s+work\s+seconds\b",

    # -----------------------------------------------------
    # TOTAL WORK TIME
    # -----------------------------------------------------

    r"\bshow\s+(.+?)\s+total\s+work\s+time\b",

    r"\bget\s+(.+?)\s+total\s+work\s+time\b",
]


# =========================================================
# ACTIVE ATTENDANCE
# =========================================================

_ACTIVE_ATTENDANCE_PATTERNS = [

    r"\bshow\s+active\s+attendance\b",

    r"\bget\s+active\s+attendance\b",

    r"\bshow\s+currently\s+active\s+employees?\b",

    r"\bget\s+currently\s+active\s+employees?\b",

    r"\bshow\s+online\s+employees?\b",

    r"\bget\s+online\s+employees?\b",
]


# =========================================================
# ATTENDANCE HISTORY
# =========================================================

_ATTENDANCE_HISTORY_PATTERNS = [

    r"\bshow\s+attendance\s+history\b",

    r"\bget\s+attendance\s+history\b",

    r"\blist\s+attendance\s+history\b",

    r"\bshow\s+all\s+attendance\b",

    r"\bget\s+all\s+attendance\b",

    r"\blist\s+all\s+attendance\b",
]


# =========================================================
# SPECIFIC EMPLOYEE ATTENDANCE
# =========================================================
#
# Examples:
#
# show Pavithra attendance
# show Deepan Raj C attendance
# get Venkat attendance
#
# =========================================================

_ATTENDANCE_PATTERNS = [

    r"\bshow\s+(.+?)\s+attendance\b",

    r"\bget\s+(.+?)\s+attendance\b",
]


# =========================================================
# COMPILE PATTERNS
# =========================================================

_COMPILED_EMPLOYEE_LIST_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _EMPLOYEE_LIST_PATTERNS
]


_COMPILED_EMPLOYEE_FIELD_LIST_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _EMPLOYEE_FIELD_LIST_PATTERNS
]


_COMPILED_EMPLOYEE_FIELD_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _EMPLOYEE_FIELD_PATTERNS
]


_COMPILED_EMPLOYEE_DETAILS_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _EMPLOYEE_DETAILS_PATTERNS
]


_COMPILED_MY_DETAILS_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _MY_DETAILS_PATTERNS
]


_COMPILED_ATTENDANCE_FIELD_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _ATTENDANCE_FIELD_PATTERNS
]


_COMPILED_ACTIVE_ATTENDANCE_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _ACTIVE_ATTENDANCE_PATTERNS
]


_COMPILED_ATTENDANCE_HISTORY_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _ATTENDANCE_HISTORY_PATTERNS
]


_COMPILED_ATTENDANCE_PATTERNS = [

    re.compile(
        pattern,
        re.IGNORECASE,
    )

    for pattern in _ATTENDANCE_PATTERNS
]


# =========================================================
# DETECT INTENT
# =========================================================

def detect_intent(
    message: str,
) -> Intent:

    normalized = message.strip()

    if not normalized:

        return Intent.GENERAL_CHAT

    # =====================================================
    # MY DETAILS
    # =====================================================

    for pattern in _COMPILED_MY_DETAILS_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_MY_DETAILS

    # =====================================================
    # ALL EMPLOYEE + FIELD
    # =====================================================

    for pattern in _COMPILED_EMPLOYEE_FIELD_LIST_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_EMPLOYEE_FIELD_LIST

    # =====================================================
    # ATTENDANCE FIELD
    #
    # IMPORTANT:
    # This must be checked BEFORE normal attendance.
    #
    # Example:
    #
    # show Pavithra login time
    #
    # should become:
    #
    # GET_ATTENDANCE_FIELD
    #
    # NOT:
    #
    # GENERAL_CHAT
    #
    # =====================================================

    for pattern in _COMPILED_ATTENDANCE_FIELD_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_ATTENDANCE_FIELD

    # =====================================================
    # SPECIFIC EMPLOYEE + FIELD
    # =====================================================

    for pattern in _COMPILED_EMPLOYEE_FIELD_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_EMPLOYEE_FIELD

    # =====================================================
    # SPECIFIC EMPLOYEE DETAILS
    # =====================================================

    for pattern in _COMPILED_EMPLOYEE_DETAILS_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_EMPLOYEE_DETAILS

    # =====================================================
    # ACTIVE ATTENDANCE
    # =====================================================

    for pattern in _COMPILED_ACTIVE_ATTENDANCE_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_ACTIVE_ATTENDANCE

    # =====================================================
    # ATTENDANCE HISTORY
    # =====================================================

    for pattern in _COMPILED_ATTENDANCE_HISTORY_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_ATTENDANCE_HISTORY

    # =====================================================
    # SPECIFIC EMPLOYEE ATTENDANCE
    # =====================================================

    for pattern in _COMPILED_ATTENDANCE_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_ATTENDANCE

    # =====================================================
    # ALL EMPLOYEES
    # =====================================================

    for pattern in _COMPILED_EMPLOYEE_LIST_PATTERNS:

        if pattern.search(normalized):

            return Intent.GET_EMPLOYEES

    # =====================================================
    # GENERAL CHAT
    # =====================================================

    return Intent.GENERAL_CHAT


# =========================================================
# EXTRACT EMPLOYEE NAME
# =========================================================

def extract_employee_name(
    message: str,
) -> str | None:

    normalized = message.strip()

    # -----------------------------------------------------
    # Specific employee + field
    # -----------------------------------------------------

    for pattern in _COMPILED_EMPLOYEE_FIELD_PATTERNS:

        match = pattern.search(normalized)

        if match:

            name = match.group(1).strip()

            if name:

                return name

    # -----------------------------------------------------
    # Employee details
    # -----------------------------------------------------

    for pattern in _COMPILED_EMPLOYEE_DETAILS_PATTERNS:

        match = pattern.search(normalized)

        if match:

            name = match.group(1).strip()

            if name:

                return name

    return None


# =========================================================
# EXTRACT EMPLOYEE FIELD
# =========================================================

def extract_employee_field(
    message: str,
) -> str | None:

    normalized = message.strip()

    for pattern in _COMPILED_EMPLOYEE_FIELD_PATTERNS:

        match = pattern.search(normalized)

        if not match:

            continue

        field = match.group(2).strip().lower()

        # Email
        if field in (
            "email",
            "email address",
        ):

            return "email"

        # Contact
        if field in (
            "contact",
            "phone",
            "phone number",
        ):

            return "contact"

        # Employee ID
        if field in (
            "employee id",
            "employeeid",
            "id",
        ):

            return "employee_id"

        # Joining date
        if field in (
            "join date",
            "joining date",
        ):

            return "join_date"

        # Location
        if field == "location":

            return "location"

        # Role
        if field in (
            "role",
            "designation",
            "position",
        ):

            return "role"

    return None


# =========================================================
# EXTRACT EMPLOYEE LIST FIELD
# =========================================================

def extract_employee_list_field(
    message: str,
) -> str | None:

    normalized = message.strip().lower()

    # Email
    if "email" in normalized:

        return "email"

    # Contact
    if (
        "contact" in normalized
        or "phone" in normalized
    ):

        return "contact"

    # Employee ID
    if (
        "employee id" in normalized
        or "employeeid" in normalized
    ):

        return "employee_id"

    # Joining date
    if (
        "joining date" in normalized
        or "join date" in normalized
    ):

        return "join_date"

    # Location
    if "location" in normalized:

        return "location"

    # Role
    if (
        "role" in normalized
        or "designation" in normalized
    ):

        return "role"

    return None


# =========================================================
# EXTRACT ATTENDANCE EMPLOYEE NAME
# =========================================================
#
# Examples:
#
# show Pavithra attendance
# show Pavithra login time
# show Pavithra status
# show Deepan Raj C logout time
#
# =========================================================

def extract_attendance_employee_name(
    message: str,
) -> str | None:

    normalized = message.strip()

    # -----------------------------------------------------
    # First check attendance field requests
    # -----------------------------------------------------

    for pattern in _COMPILED_ATTENDANCE_FIELD_PATTERNS:

        match = pattern.search(normalized)

        if not match:

            continue

        # The first capture group is the employee name.
        name = match.group(1).strip()

        if name:

            return name

    # -----------------------------------------------------
    # Then check normal attendance request
    # -----------------------------------------------------

    for pattern in _COMPILED_ATTENDANCE_PATTERNS:

        match = pattern.search(normalized)

        if not match:

            continue

        name = match.group(1).strip()

        if name:

            return name

    return None


# =========================================================
# EXTRACT ATTENDANCE FIELD
# =========================================================
#
# Returns:
#
# login_time
# logout_time
# break_start
# break_end
# status
# attendance_id
# total_work_seconds
#
# =========================================================

def extract_attendance_field(
    message: str,
) -> str | None:

    normalized = message.strip().lower()

    # -----------------------------------------------------
    # Login
    # -----------------------------------------------------

    if "login time" in normalized:

        return "login_time"

    # -----------------------------------------------------
    # Logout
    # -----------------------------------------------------

    if "logout time" in normalized:

        return "logout_time"

    # -----------------------------------------------------
    # Break start
    # -----------------------------------------------------

    if "break start" in normalized:

        return "break_start"

    # -----------------------------------------------------
    # Break end
    # -----------------------------------------------------

    if "break end" in normalized:

        return "break_end"

    # -----------------------------------------------------
    # Attendance ID
    # -----------------------------------------------------

    if "attendance id" in normalized:

        return "attendance_id"

    # -----------------------------------------------------
    # Total work seconds
    # -----------------------------------------------------

    if "total work seconds" in normalized:

        return "total_work_seconds"

    # -----------------------------------------------------
    # Total work time
    # -----------------------------------------------------

    if "total work time" in normalized:

        return "total_work_seconds"

    # -----------------------------------------------------
    # Status
    # -----------------------------------------------------

    if re.search(
        r"\bstatus\b",
        normalized,
    ):

        return "status"

    return None