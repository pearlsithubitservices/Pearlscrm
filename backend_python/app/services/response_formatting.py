
from typing import Any
from datetime import datetime, timezone, timedelta


# =========================================================
# COMMON DATE AND TIME HELPERS
# =========================================================

IST = timezone(timedelta(hours=5, minutes=30))


def _parse_attendance_datetime(value: Any):
    """
    Parse MongoDB datetime values safely.
    MongoDB ISO timestamps are normally stored in UTC.
    """

    if value is None or value == "":
        return None

    if isinstance(value, datetime):
        dt = value
    else:
        value = str(value).strip()

        try:
            dt = datetime.fromisoformat(
                value.replace("Z", "+00:00")
            )
        except (ValueError, TypeError):
            return None

    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)

    return dt


def _format_date(value: Any) -> str:
    """
    Convert timestamp dates into Indian Standard Time.
    """

    if value is None or value == "":
        return "Not available"

    value_str = str(value).strip()

    # Keep date-only values unchanged.
    if len(value_str) == 10 and "T" not in value_str:
        return value_str

    dt = _parse_attendance_datetime(value)

    if dt is None:
        return value_str

    return dt.astimezone(IST).strftime("%Y-%m-%d")


def _format_datetime(value: Any) -> str:
    """
    Convert UTC datetime into Indian Standard Time.
    """

    if value is None or value == "":
        return "Not available"

    dt = _parse_attendance_datetime(value)

    if dt is None:
        return str(value)

    return dt.astimezone(IST).strftime(
        "%Y-%m-%d %I:%M:%S %p"
    )


def _format_seconds(value: Any) -> str:
    """
    Convert total seconds into readable working time.
    """

    if value is None or value == "":
        return "Not available"

    try:
        total_seconds = max(0, int(float(value)))
    except (ValueError, TypeError):
        return str(value)

    hours = total_seconds // 3600
    minutes = (total_seconds % 3600) // 60
    seconds = total_seconds % 60

    return (
        f"{hours} hour(s), "
        f"{minutes} minute(s), "
        f"{seconds} second(s)"
    )


# =========================================================
# LIVE ATTENDANCE WORKING HOURS
# =========================================================

def _calculate_live_working_seconds(
    record: dict[str, Any],
) -> int | None:
    """
    Calculate live working seconds for an employee
    who has clocked in but has not clocked out.

    Completed and currently active breaks are deducted.
    The database is not modified.
    """

    clock_in = _parse_attendance_datetime(
        record.get("clockIn")
        or record.get("login_time")
    )

    clock_out = _parse_attendance_datetime(
        record.get("clockOut")
        or record.get("logout_time")
    )

    if clock_in is None:
        return None

    # For completed attendance, use saved working hours.
    if clock_out is not None:

        saved_hours = record.get("workingHours")

        if saved_hours is None:
            saved_hours = record.get("total_work_seconds")

        if saved_hours is not None:
            try:
                return max(0, int(float(saved_hours)))
            except (ValueError, TypeError):
                return None

        return max(
            0,
            int((clock_out - clock_in).total_seconds())
        )

    now = datetime.now(timezone.utc)

    total_seconds = max(
        0,
        int((now - clock_in).total_seconds())
    )

    break_seconds = 0

    breaks = record.get("breaks")

    if isinstance(breaks, list):

        for break_record in breaks:

            if not isinstance(break_record, dict):
                continue

            break_start = _parse_attendance_datetime(
                break_record.get("start")
                or break_record.get("break_start")
            )

            break_end = _parse_attendance_datetime(
                break_record.get("end")
                or break_record.get("break_end")
            )

            duration = break_record.get("duration")

            if duration is not None:
                try:
                    duration_seconds = max(
                        0,
                        int(float(duration))
                    )
                except (ValueError, TypeError):
                    duration_seconds = 0
            else:
                duration_seconds = 0

            if duration_seconds == 0 and break_start:

                end_time = break_end or now

                duration_seconds = max(
                    0,
                    int(
                        (end_time - break_start).total_seconds()
                    )
                )

            break_seconds += duration_seconds

    return max(
        0,
        total_seconds - break_seconds
    )


# =========================================================
# EMPLOYEE NAME HELPERS
# =========================================================

def _employee_name(
    employee: dict[str, Any],
) -> str:

    return str(
        employee.get("employeeName")
        or employee.get("name")
        or employee.get("employee_name")
        or "Unnamed employee"
    )


def _attendance_employee_name(
    attendance: dict[str, Any],
) -> str:

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

        name = _employee_name(employee)

        lines.append(f"{index}. {name}")

        if employee.get("_id"):
            lines.append(
                f"   Employee ID: {employee['_id']}"
            )

        if employee.get("employeeRole"):
            lines.append(
                f"   Role: {employee['employeeRole']}"
            )

        if employee.get("email"):
            lines.append(
                f"   Email: {employee['email']}"
            )

        if employee.get("contact"):
            lines.append(
                f"   Contact: {employee['contact']}"
            )

        if employee.get("location"):
            lines.append(
                f"   Location: {employee['location']}"
            )

        if employee.get("joinDate"):
            lines.append(
                "   Joining Date: "
                f"{_format_date(employee['joinDate'])}"
            )

        if employee.get("notes"):
            lines.append(
                f"   Notes: {employee['notes']}"
            )

        lines.append("")

    return "\n".join(lines).rstrip()


# =========================================================
# EMPLOYEE DETAILS
# =========================================================

def format_employee_details(
    employee: dict[str, Any],
) -> str:

    name = _employee_name(employee)

    profile = employee.get("profile")

    if not isinstance(profile, dict):
        profile = {}

    lines = [
        "Employee Details",
        "",
        f"Name: {name}",
    ]

    employee_id = (
        profile.get("empId")
        or employee.get("empId")
    )

    if employee_id:
        lines.append(f"Employee ID: {employee_id}")

    crm_id = employee.get("_id")

    if crm_id and str(crm_id) != str(employee_id):
        lines.append(f"CRM ID: {crm_id}")

    email = employee.get("email")

    if email:
        lines.append(f"Email: {email}")

    phone = (
        profile.get("phone")
        or employee.get("phone")
        or employee.get("contact")
        or employee.get("mobile")
        or employee.get("mobileNumber")
    )

    if phone:
        lines.append(f"Phone: {phone}")

    emergency_number = profile.get("emergencyNo")

    if emergency_number:
        lines.append(
            f"Emergency Number: {emergency_number}"
        )

    designation = (
        profile.get("designation")
        or employee.get("designation")
    )

    if designation:
        lines.append(f"Designation: {designation}")

    department = (
        profile.get("department")
        or employee.get("department")
    )

    if department:
        lines.append(f"Department: {department}")

    role = (
        employee.get("employeeRole")
        or employee.get("role")
        or profile.get("role")
    )

    if role:
        lines.append(f"Role: {role}")

    status = (
        employee.get("status")
        or profile.get("status")
    )

    if status:
        lines.append(f"Status: {status}")

    work_location = (
        profile.get("workLocation")
        or employee.get("workLocation")
        or employee.get("location")
    )

    if work_location:
        lines.append(f"Work Location: {work_location}")

    reporting_manager = (
        profile.get("reportingManager")
        or employee.get("reportingManager")
    )

    if reporting_manager:
        lines.append(
            f"Reporting Manager: {reporting_manager}"
        )

    gender = profile.get("gender")

    if gender:
        lines.append(f"Gender: {gender}")

    date_of_birth = (
        profile.get("dob")
        or employee.get("dob")
    )

    if date_of_birth:
        lines.append(
            f"Date of Birth: {_format_date(date_of_birth)}"
        )

    address = (
        profile.get("address")
        or employee.get("address")
    )

    if address:
        lines.append(f"Address: {address}")

    joining_date = (
        profile.get("joiningDate")
        or employee.get("joinDate")
    )

    if joining_date:
        lines.append(
            f"Joining Date: {_format_date(joining_date)}"
        )

    description = (
        profile.get("description")
        or employee.get("description")
    )

    if description:
        lines.append(f"Description: {description}")

    notes = employee.get("notes")

    if notes:
        lines.append(f"Notes: {notes}")

    return "\n".join(lines)


# =========================================================
# EMPLOYEE FIELD
# =========================================================

def format_employee_field(
    employee: dict[str, Any],
    field: str,
) -> str:

    name = _employee_name(employee)

    profile = employee.get("profile")

    if not isinstance(profile, dict):
        profile = {}

    field_map = {

        "employee_id": (
            "Employee ID",
            profile.get("empId") or employee.get("empId"),
        ),

        "email": (
            "Email",
            employee.get("email"),
        ),

        "contact": (
            "Contact",
            (
                profile.get("phone")
                or employee.get("phone")
                or employee.get("contact")
            ),
        ),

        "join_date": (
            "Joining Date",
            _format_date(
                profile.get("joiningDate")
                or employee.get("joinDate")
            ),
        ),

        "location": (
            "Location",
            (
                profile.get("workLocation")
                or employee.get("workLocation")
                or employee.get("location")
            ),
        ),

        "role": (
            "Role",
            (
                employee.get("employeeRole")
                or employee.get("role")
                or profile.get("role")
            ),
        ),

        "designation": (
            "Designation",
            (
                profile.get("designation")
                or employee.get("designation")
            ),
        ),

        "department": (
            "Department",
            (
                profile.get("department")
                or employee.get("department")
            ),
        ),

        "status": (
            "Status",
            (
                employee.get("status")
                or profile.get("status")
            ),
        ),

        "gender": (
            "Gender",
            profile.get("gender"),
        ),

        "address": (
            "Address",
            (
                profile.get("address")
                or employee.get("address")
            ),
        ),

        "reporting_manager": (
            "Reporting Manager",
            (
                profile.get("reportingManager")
                or employee.get("reportingManager")
            ),
        ),

        "emergency_number": (
            "Emergency Number",
            profile.get("emergencyNo"),
        ),
    }

    label, value = field_map.get(
        field,
        ("Information", None),
    )

    if value in (None, ""):
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

        "employee_id": ("Employee ID", "_id"),
        "email": ("Email", "email"),
        "contact": ("Contact", "contact"),
        "join_date": ("Joining Date", "joinDate"),
        "location": ("Location", "location"),
        "role": ("Role", "employeeRole"),
    }

    label, key = field_map.get(
        field,
        ("Information", ""),
    )

    lines = [
        f"Employee {label}:",
        "",
    ]

    for index, employee in enumerate(
        employees,
        start=1,
    ):

        name = _employee_name(employee)

        value = employee.get(key)

        if field == "join_date":
            value = _format_date(value)

        if value in (None, ""):
            value = "Not available"

        lines.append(f"{index}. {name}")
        lines.append(f"   {label}: {value}")
        lines.append("")

    return "\n".join(lines).rstrip()


# =========================================================
# ATTENDANCE RECORD HELPER
# =========================================================

def _format_attendance_record(
    attendance: dict[str, Any],
    index: int,
) -> list[str]:

    lines = [f"Record {index}:"]

    attendance_id = (
        attendance.get("_id")
        or attendance.get("id")
        or "Not available"
    )

    employee_uid = (
        attendance.get("employee_uid")
        or attendance.get("employeeUid")
        or "Not available"
    )

    clock_in = (
        attendance.get("clockIn")
        or attendance.get("login_time")
    )

    clock_out = (
        attendance.get("clockOut")
        or attendance.get("logout_time")
    )

    lines.append(f"Attendance ID: {attendance_id}")
    lines.append(f"Employee UID: {employee_uid}")
    lines.append(
        f"Date: {_format_date(attendance.get('date'))}"
    )
    lines.append(
        f"Login Time: {_format_datetime(clock_in)}"
    )
    lines.append(
        f"Logout Time: {_format_datetime(clock_out)}"
    )

    # Break information
    breaks = attendance.get("breaks")

    if isinstance(breaks, list) and breaks:
        for break_index, item in enumerate(breaks, start=1):
            if not isinstance(item, dict):
                continue

            start = item.get("start") or item.get("break_start")
            end = item.get("end") or item.get("break_end")

            lines.append(f"Break {break_index} Start: {_format_datetime(start)}")
            lines.append(f"Break {break_index} End: {_format_datetime(end)}")
    else:
        lines.append("Break Details: No break records")

    # Working time
    live_seconds = _calculate_live_working_seconds(attendance)

    if live_seconds is not None:
        working_time = _format_seconds(live_seconds)
    else:
        saved_time = (
            attendance.get("workingHours")
            if attendance.get("workingHours") is not None
            else attendance.get("total_work_seconds")
        )
        working_time = _format_seconds(saved_time)

    lines.append(f"Total Work Time: {working_time}")

    status = (
        attendance.get("attendanceState")
        or attendance.get("status")
        or "Not available"
    )

    lines.append(f"Status: {status}")

    if attendance.get("location"):
        lines.append(f"Location: {attendance['location']}")

    return lines

# =========================================================
# SPECIFIC EMPLOYEE ATTENDANCE
# =========================================================

def format_attendance(
    employee: dict[str, Any],
    attendance: list[dict[str, Any]],
) -> str:

    name = _employee_name(employee)

    lines = [
        "Attendance Details",
        "",
        f"Employee: {name}",
        "",
    ]

    if not attendance:
        lines.append("No attendance records found.")
        return "\n".join(lines)

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

    return "\n".join(lines).rstrip()


# =========================================================
# SPECIFIC ATTENDANCE FIELD
# =========================================================

def format_attendance_field(
    employee: dict[str, Any],
    attendance: list[dict[str, Any]],
    field: str,
) -> str:

    name = _employee_name(employee)

    if not attendance:
        return (
            "Attendance Details\n\n"
            f"Employee: {name}\n\n"
            "No attendance records found."
        )

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
                record.get("clockIn")
                or record.get("login_time")
            ),
        ),

        "logout_time": (
            "Logout Time",
            _format_datetime(
                record.get("clockOut")
                or record.get("logout_time")
            ),
        ),

        "break_start": (
            "Break Start",
            _format_datetime(
                record.get("break_start")
            ),
        ),

        "break_end": (
            "Break End",
            _format_datetime(
                record.get("break_end")
            ),
        ),

        "total_work_seconds": (
            "Total Work Time",
            _format_seconds(
                _calculate_live_working_seconds(record)
                if record.get("clockIn")
                else record.get("total_work_seconds")
            ),
        ),

        "status": (
            "Status",
            (
                record.get("attendanceState")
                or record.get("status")
                or "Not available"
            ),
        ),
    }

    label, value = field_map.get(
        field,
        ("Information", "Not available"),
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

        name = _attendance_employee_name(record)

        lines.append(f"{index}. {name}")

        lines.append(
            "   Status: "
            f"{record.get('attendanceState') or record.get('status') or 'Not available'}"
        )

        lines.append(
            "   Login Time: "
            f"{_format_datetime(record.get('clockIn') or record.get('login_time'))}"
        )

        lines.append("")

    return "\n".join(lines).rstrip()


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

        name = _attendance_employee_name(record)

        attendance_id = (
            record.get("_id")
            or record.get("id")
            or "Not available"
        )

        date = _format_date(
            record.get("date")
        )

        login_time = _format_datetime(
            record.get("clockIn")
            or record.get("login_time")
        )

        logout_time = _format_datetime(
            record.get("clockOut")
            or record.get("logout_time")
        )

        live_seconds = _calculate_live_working_seconds(
            record
        )

        if live_seconds is not None:
            working_hours = _format_seconds(live_seconds)
        else:
            stored_seconds = (
                record.get("workingHours")
                if record.get("workingHours") is not None
                else record.get("total_work_seconds")
            )

            working_hours = _format_seconds(stored_seconds)

        status = (
            record.get("attendanceState")
            or record.get("status")
            or "Not available"
        )

        location = (
            record.get("location")
            or "Not available"
        )

        lines.append(f"Record {index}:")
        lines.append(f"Employee: {name}")
        lines.append(f"Attendance ID: {attendance_id}")
        lines.append(f"Date: {date}")
        lines.append(f"Login Time: {login_time}")
        lines.append(f"Logout Time: {logout_time}")
        lines.append(f"Working Hours: {working_hours}")
        lines.append(f"Status: {status}")
        lines.append(f"Location: {location}")

        # Break details
        breaks = record.get("breaks")

        if isinstance(breaks, list) and breaks:

            lines.append("Break Details:")

            for break_index, break_record in enumerate(
                breaks,
                start=1,
            ):

                if not isinstance(break_record, dict):
                    continue

                break_start_value = (
                    break_record.get("start")
                    or break_record.get("break_start")
                )

                break_end_value = (
                    break_record.get("end")
                    or break_record.get("break_end")
                )

                break_start = _format_datetime(
                    break_start_value
                )

                break_end = _format_datetime(
                    break_end_value
                )

                duration = break_record.get("duration")

                if duration is None:

                    start_dt = _parse_attendance_datetime(
                        break_start_value
                    )

                    end_dt = _parse_attendance_datetime(
                        break_end_value
                    )

                    if start_dt:

                        if end_dt:
                            duration = max(
                                0,
                                int(
                                    (end_dt - start_dt).total_seconds()
                                )
                            )
                        else:
                            duration = max(
                                0,
                                int(
                                    (
                                        datetime.now(timezone.utc)
                                        - start_dt
                                    ).total_seconds()
                                )
                            )

                break_duration = _format_seconds(duration)

                lines.append(f"  Break {break_index}:")
                lines.append(f"    Start: {break_start}")
                lines.append(f"    End: {break_end}")
                lines.append(f"    Duration: {break_duration}")

        else:

            break_start = record.get("break_start")
            break_end = record.get("break_end")

            if break_start or break_end:

                lines.append(
                    "Break Start: "
                    f"{_format_datetime(break_start)}"
                )

                lines.append(
                    "Break End: "
                    f"{_format_datetime(break_end)}"
                )

            else:
                lines.append("Break Details: No break records")

        lines.append("")

    return "\n".join(lines).rstrip()
