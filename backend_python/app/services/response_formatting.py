from typing import Any


# =========================================================
# COMMON HELPERS
# =========================================================

def _format_date(value: Any) -> str:
    """
    Format date values.

    Example:
        2026-05-30T06:05:38.736Z
        ->
        2026-05-30
    """

    if value is None or value == "":
        return "Not available"

    value = str(value)

    if "T" in value:
        return value.split("T")[0]

    return value


def _format_datetime(value: Any) -> str:
    """
    Format date + time values.

    Example:
        2026-05-30T06:05:38.736Z
        ->
        2026-05-30 06:05:38
    """

    if value is None or value == "":
        return "Not available"

    value = str(value)

    # Remove milliseconds
    if "." in value:
        value = value.split(".")[0]

    value = value.replace("T", " ")
    value = value.replace("Z", "")

    return value


def _format_seconds(value: Any) -> str:
    """
    Convert total working seconds into readable format.

    Example:
        3665
        ->
        1 hour(s), 1 minute(s), 5 second(s)
    """

    if value is None or value == "":
        return "Not available"

    try:
        total_seconds = int(value)

    except (ValueError, TypeError):
        return str(value)

    hours = total_seconds // 3600

    minutes = (
        total_seconds % 3600
    ) // 60

    seconds = total_seconds % 60

    return (
        f"{hours} hour(s), "
        f"{minutes} minute(s), "
        f"{seconds} second(s)"
    )


def _employee_name(
    employee: dict[str, Any],
) -> str:
    """
    Get employee name safely.
    """

    return str(
        employee.get("employeeName")
        or employee.get("name")
        or employee.get("employee_name")
        or "Unnamed employee"
    )


def _attendance_employee_name(
    attendance: dict[str, Any],
) -> str:
    """
    Get employee name from attendance record.
    """

    return str(
        attendance.get("employee_name")
        or attendance.get("employeeName")
        or attendance.get("name")
        or "Unknown employee"
    )


# =========================================================
# EMPLOYEE LIST
# =========================================================

def format_employee_list(
    employees: list[dict[str, Any]],
) -> str:

    if not employees:

        return (
            "There are no employees currently "
            "available in the CRM."
        )

    lines = [
        "Employees currently available in the CRM:",
        "",
    ]

    for index, employee in enumerate(
        employees,
        start=1,
    ):

        name = _employee_name(
            employee
        )

        lines.append(
            f"{index}. {name}"
        )

        if employee.get("_id"):

            lines.append(
                f"   Employee ID: "
                f"{employee['_id']}"
            )

        if employee.get("employeeRole"):

            lines.append(
                f"   Role: "
                f"{employee['employeeRole']}"
            )

        if employee.get("email"):

            lines.append(
                f"   Email: "
                f"{employee['email']}"
            )

        if employee.get("contact"):

            lines.append(
                f"   Contact: "
                f"{employee['contact']}"
            )

        if employee.get("location"):

            lines.append(
                f"   Location: "
                f"{employee['location']}"
            )

        if employee.get("joinDate"):

            lines.append(
                "   Joining Date: "
                f"{_format_date(employee['joinDate'])}"
            )

        if employee.get("notes"):

            lines.append(
                f"   Notes: "
                f"{employee['notes']}"
            )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# EMPLOYEE DETAILS
# =========================================================

def format_employee_details(
    employee: dict[str, Any],
) -> str:

    name = _employee_name(
        employee
    )

    lines = [
        "Employee Details",
        "",
        f"Name: {name}",
    ]

    if employee.get("_id"):

        lines.append(
            f"Employee ID: "
            f"{employee['_id']}"
        )

    if employee.get("employeeRole"):

        lines.append(
            f"Role: "
            f"{employee['employeeRole']}"
        )

    if employee.get("email"):

        lines.append(
            f"Email: "
            f"{employee['email']}"
        )

    if employee.get("contact"):

        lines.append(
            f"Contact: "
            f"{employee['contact']}"
        )

    if employee.get("location"):

        lines.append(
            f"Location: "
            f"{employee['location']}"
        )

    if employee.get("joinDate"):

        lines.append(
            "Joining Date: "
            f"{_format_date(employee['joinDate'])}"
        )

    if employee.get("notes"):

        lines.append(
            f"Notes: "
            f"{employee['notes']}"
        )

    return "\n".join(
        lines
    )


# =========================================================
# EMPLOYEE FIELD
# =========================================================

def format_employee_field(
    employee: dict[str, Any],
    field: str,
) -> str:

    name = _employee_name(
        employee
    )

    field_map = {

        "employee_id": (
            "Employee ID",
            employee.get("_id"),
        ),

        "email": (
            "Email",
            employee.get("email"),
        ),

        "contact": (
            "Contact",
            employee.get("contact"),
        ),

        "join_date": (
            "Joining Date",
            _format_date(
                employee.get(
                    "joinDate"
                )
            ),
        ),

        "location": (
            "Location",
            employee.get("location"),
        ),

        "role": (
            "Role",
            employee.get(
                "employeeRole"
            ),
        ),
    }

    label, value = field_map.get(
        field,
        (
            "Information",
            None,
        ),
    )

    if value in (
        None,
        "",
        "Not available",
    ):

        return (
            f"{label} for {name} "
            "is not available in the CRM."
        )

    return (
        f"{name}\n"
        f"{label}: {value}"
    )


# =========================================================
# ALL EMPLOYEES + FIELD
# =========================================================

def format_employee_field_list(
    employees: list[dict[str, Any]],
    field: str,
) -> str:

    if not employees:

        return (
            "There are no employees currently "
            "available in the CRM."
        )

    field_map = {

        "employee_id": (
            "Employee ID",
            "_id",
        ),

        "email": (
            "Email",
            "email",
        ),

        "contact": (
            "Contact",
            "contact",
        ),

        "join_date": (
            "Joining Date",
            "joinDate",
        ),

        "location": (
            "Location",
            "location",
        ),

        "role": (
            "Role",
            "employeeRole",
        ),
    }

    label, key = field_map.get(
        field,
        (
            "Information",
            "",
        ),
    )

    lines = [
        f"Employee {label}:",
        "",
    ]

    for index, employee in enumerate(
        employees,
        start=1,
    ):

        name = _employee_name(
            employee
        )

        value = employee.get(
            key
        )

        if field == "join_date":

            value = _format_date(
                value
            )

        if value in (
            None,
            "",
        ):

            value = "Not available"

        lines.append(
            f"{index}. {name}"
        )

        lines.append(
            f"   {label}: "
            f"{value}"
        )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# ATTENDANCE RECORD HELPER
# =========================================================

def _format_attendance_record(
    attendance: dict[str, Any],
    index: int,
) -> list[str]:

    lines = [
        f"Record {index}:",
    ]

    attendance_id = (
        attendance.get("_id")
        or attendance.get("id")
    )

    lines.append(
        "Attendance ID: "
        f"{attendance_id or 'Not available'}"
    )

    employee_uid = attendance.get(
        "employee_uid"
    )

    lines.append(
        "Employee UID: "
        f"{employee_uid or 'Not available'}"
    )

    lines.append(
        "Login Time: "
        f"{_format_datetime(attendance.get('login_time'))}"
    )

    lines.append(
        "Logout Time: "
        f"{_format_datetime(attendance.get('logout_time'))}"
    )

    lines.append(
        "Break Start: "
        f"{_format_datetime(attendance.get('break_start'))}"
    )

    lines.append(
        "Break End: "
        f"{_format_datetime(attendance.get('break_end'))}"
    )

    lines.append(
        "Total Work Time: "
        f"{_format_seconds(attendance.get('total_work_seconds'))}"
    )

    lines.append(
        "Status: "
        f"{attendance.get('status') or 'Not available'}"
    )

    return lines


# =========================================================
# SPECIFIC EMPLOYEE ATTENDANCE
# =========================================================

def format_attendance(
    employee: dict[str, Any],
    attendance: list[dict[str, Any]],
) -> str:

    name = _employee_name(
        employee
    )

    lines = [
        "Attendance Details",
        "",
        f"Employee: {name}",
        "",
    ]

    if not attendance:

        lines.append(
            "No attendance records found."
        )

        return "\n".join(
            lines
        )

    for index, record in enumerate(
        attendance,
        start=1,
    ):

        lines.extend(
            _format_attendance_record(
                record,
                index,
            )
        )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# SPECIFIC ATTENDANCE FIELD
# =========================================================

def format_attendance_field(
    employee: dict[str, Any],
    attendance: list[dict[str, Any]],
    field: str,
) -> str:

    name = _employee_name(
        employee
    )

    if not attendance:

        return (
            "Attendance Details\n\n"
            f"Employee: {name}\n\n"
            "No attendance records found."
        )

    # Latest record
    record = attendance[0]

    field_map = {

        "attendance_id": (
            "Attendance ID",
            record.get("_id")
            or record.get("id")
            or "Not available",
        ),

        "login_time": (
            "Login Time",
            _format_datetime(
                record.get(
                    "login_time"
                )
            ),
        ),

        "logout_time": (
            "Logout Time",
            _format_datetime(
                record.get(
                    "logout_time"
                )
            ),
        ),

        "break_start": (
            "Break Start",
            _format_datetime(
                record.get(
                    "break_start"
                )
            ),
        ),

        "break_end": (
            "Break End",
            _format_datetime(
                record.get(
                    "break_end"
                )
            ),
        ),

        "total_work_seconds": (
            "Total Work Time",
            _format_seconds(
                record.get(
                    "total_work_seconds"
                )
            ),
        ),

        "status": (
            "Status",
            record.get("status")
            or "Not available",
        ),
    }

    label, value = field_map.get(
        field,
        (
            "Information",
            "Not available",
        ),
    )

    return (
        "Attendance Details\n\n"
        f"Employee: {name}\n\n"
        f"{label}: {value}"
    )


# =========================================================
# ACTIVE ATTENDANCE
# =========================================================

def format_active_attendance(
    attendance: list[dict[str, Any]],
) -> str:

    if not attendance:

        return (
            "Currently Active Employees\n\n"
            "No employees are currently active."
        )

    lines = [
        "Currently Active Employees",
        "",
    ]

    for index, record in enumerate(
        attendance,
        start=1,
    ):

        name = _attendance_employee_name(
            record
        )

        lines.append(
            f"{index}. {name}"
        )

        lines.append(
            "   Status: "
            f"{record.get('status') or 'Not available'}"
        )

        lines.append(
            "   Login Time: "
            f"{_format_datetime(record.get('login_time'))}"
        )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()


# =========================================================
# ATTENDANCE HISTORY
# =========================================================

def format_attendance_history(
    attendance: list[dict[str, Any]],
) -> str:

    if not attendance:

        return (
            "Attendance History\n\n"
            "No attendance history found."
        )

    lines = [
        "Attendance History",
        "",
    ]

    for index, record in enumerate(
        attendance,
        start=1,
    ):

        name = _attendance_employee_name(
            record
        )

        lines.append(
            f"Record {index}:"
        )

        lines.append(
            f"Employee: {name}"
        )

        attendance_id = (
            record.get("_id")
            or record.get("id")
        )

        lines.append(
            "Attendance ID: "
            f"{attendance_id or 'Not available'}"
        )

        lines.append(
            "Login Time: "
            f"{_format_datetime(record.get('login_time'))}"
        )

        lines.append(
            "Logout Time: "
            f"{_format_datetime(record.get('logout_time'))}"
        )

        lines.append(
            "Break Start: "
            f"{_format_datetime(record.get('break_start'))}"
        )

        lines.append(
            "Break End: "
            f"{_format_datetime(record.get('break_end'))}"
        )

        lines.append(
            "Total Work Time: "
            f"{_format_seconds(record.get('total_work_seconds'))}"
        )

        lines.append(
            "Status: "
            f"{record.get('status') or 'Not available'}"
        )

        lines.append("")

    return "\n".join(
        lines
    ).rstrip()