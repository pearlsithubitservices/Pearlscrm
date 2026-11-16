

import logging
from typing import Any

import httpx

from app.core.config import Settings, get_settings


logger = logging.getLogger("app.crm_service")


# =========================================================
# CRM SERVICE ERROR
# =========================================================

class CrmServiceError(Exception):
    """
    Raised whenever communication with the existing CRM fails.
    """

    def __init__(
        self,
        message: str,
        status_code: int = 502,
    ):
        super().__init__(message)

        self.message = message
        self.status_code = status_code


# =========================================================
# CRM SERVICE
# =========================================================

class CrmService:
    """
    Reusable async HTTP client for the existing Node/Express CRM.
    """

    def __init__(
        self,
        settings: Settings | None = None,
    ):
        self.settings = settings or get_settings()

        self.base_url = (
            self.settings.CRM_BASE_URL.rstrip("/")
        )

        self.timeout = (
            self.settings.CRM_REQUEST_TIMEOUT_SECONDS
        )

    # =====================================================
    # HEADERS
    # =====================================================

    def _headers(
        self,
    ) -> dict[str, str]:

        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        if self.settings.CRM_API_TOKEN:
            headers["Authorization"] = (
                f"Bearer {self.settings.CRM_API_TOKEN}"
            )

        return headers

    # =====================================================
    # RESPONSE VALIDATION
    # =====================================================

    def _validate_response(
        self,
        response: httpx.Response,
        url: str,
    ) -> httpx.Response:

        if response.status_code in (
            401,
            403,
        ):

            logger.warning(
                "CRM authentication failure (%s): %s",
                response.status_code,
                url,
            )

            raise CrmServiceError(
                "Not authorized to access the CRM service.",
                status_code=response.status_code,
            )

        if response.status_code == 404:

            logger.warning(
                "CRM endpoint not found: %s",
                url,
            )

            raise CrmServiceError(
                "The requested CRM resource was not found.",
                status_code=404,
            )

        if response.status_code >= 500:

            logger.error(
                "CRM server error (%s): %s",
                response.status_code,
                url,
            )

            raise CrmServiceError(
                "The CRM service returned an internal error.",
                status_code=502,
            )

        if response.status_code >= 400:

            logger.error(
                "CRM client error (%s): %s",
                response.status_code,
                url,
            )

            raise CrmServiceError(
                "The CRM service rejected the request.",
                status_code=response.status_code,
            )

        return response

    # =====================================================
    # GET REQUEST
    # =====================================================

    async def _get(
        self,
        path: str,
    ) -> httpx.Response:

        url = f"{self.base_url}{path}"

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout,
            ) as client:

                response = await client.get(
                    url,
                    headers=self._headers(),
                )

        except httpx.ConnectError as exc:

            logger.error(
                "CRM unreachable at %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            logger.error(
                "CRM request timed out: %s",
                url,
            )

            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            logger.error(
                "HTTP error calling %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        return self._validate_response(
            response,
            url,
        )
    
    # =====================================================
    # PUT REQUEST
    # =====================================================

    async def _put(
        self,
        path: str,
        payload: dict,
    ) -> httpx.Response:

        url = f"{self.base_url}{path}"

        try:
            async with httpx.AsyncClient(
                timeout=self.timeout,
            ) as client:
                response = await client.put(
                    url,
                    json=payload,
                    headers=self._headers(),
                )

        except httpx.ConnectError as exc:
            logger.error(
                "CRM unreachable at %s: %s",
                url,
                exc,
            )
            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:
            logger.error(
                "CRM request timed out: %s",
                url,
            )
            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:
            logger.error(
                "HTTP error calling %s: %s",
                url,
                exc,
            )
            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        return self._validate_response(
            response,
            url,
        )

    # =====================================================
    # POST REQUEST
    # =====================================================

    async def _post(
        self,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> httpx.Response:

        url = f"{self.base_url}{path}"

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout,
            ) as client:

                response = await client.post(
                    url,
                    headers=self._headers(),
                    json=data or {},
                )

        except httpx.ConnectError as exc:

            logger.error(
                "CRM unreachable at %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            logger.error(
                "CRM request timed out: %s",
                url,
            )

            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            logger.error(
                "HTTP error calling %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        return self._validate_response(
            response,
            url,
        )

    # =====================================================
    # PUT REQUEST
    # =====================================================

    async def _put(
        self,
        path: str,
        data: dict[str, Any] | None = None,
    ) -> httpx.Response:

        url = f"{self.base_url}{path}"

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout,
            ) as client:

                response = await client.put(
                    url,
                    headers=self._headers(),
                    json=data or {},
                )

        except httpx.ConnectError as exc:

            logger.error(
                "CRM unreachable at %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            logger.error(
                "CRM request timed out: %s",
                url,
            )

            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            logger.error(
                "HTTP error calling %s: %s",
                url,
                exc,
            )

            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        return self._validate_response(
            response,
            url,
        )

    # =====================================================
    # RESPONSE HELPERS
    # =====================================================

    @staticmethod
    def _extract_list(
        result: Any,
        keys: list[str],
    ) -> list[dict] | None:

        if isinstance(
            result,
            list,
        ):
            return result

        if isinstance(
            result,
            dict,
        ):

            for key in keys:

                value = result.get(key)

                if isinstance(
                    value,
                    list,
                ):
                    return value

        return None

    # =====================================================
    # EMPLOYEES
    # =====================================================

    async def get_employees(
        self,
    ) -> list[dict]:

        employees_response = await self._get(
            "/api/employees"
        )

        try:
            employees_result = employees_response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "The CRM returned an invalid employee response.",
                status_code=502,
            ) from exc

        employees = self._extract_list(
            employees_result,
            [
                "employees",
                "data",
            ],
        )

        if employees is None:
            raise CrmServiceError(
                "The CRM returned an unexpected employee response.",
                status_code=502,
            )

        users_response = await self._get(
            "/api/auth/users"
        )

        try:
            users_result = users_response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "The CRM returned an invalid user response.",
                status_code=502,
            ) from exc

        users = self._extract_list(
            users_result,
            [
                "users",
                "data",
            ],
        )

        if users is None:
            raise CrmServiceError(
                "The CRM returned an unexpected user response.",
                status_code=502,
            )

        merged: dict[str, dict] = {}

        for employee in employees:

            employee_id = str(
                employee.get("_id")
                or employee.get("id")
                or ""
            ).strip()

            email = str(
                employee.get("email")
                or ""
            ).strip().lower()

            key = email or employee_id

            if not key:
                continue

            merged[key] = dict(employee)

        for user in users:

            user_id = str(
                user.get("_id")
                or user.get("id")
                or ""
            ).strip()

            email = str(
                user.get("email")
                or ""
            ).strip().lower()

            key = email or user_id

            if not key:
                continue

            user_record = dict(user)

            profile = user_record.get("profile")

            if not isinstance(
                profile,
                dict,
            ):
                profile = {}

            phone = (
                user_record.get("phone")
                or profile.get("phone")
                or ""
            )

            name = (
                user_record.get("name")
                or user_record.get("employeeName")
                or ""
            )

            if not name:

                first_name = str(
                    user_record.get("firstName")
                    or ""
                ).strip()

                last_name = str(
                    user_record.get("lastName")
                    or ""
                ).strip()

                name = " ".join(
                    part
                    for part in [
                        first_name,
                        last_name,
                    ]
                    if part
                )

            normalized_user = {
                **user_record,
                "employeeName": name,
                "phone": phone,
                "profile": profile,
            }

            if key in merged:

                existing = merged[key]

                merged[key] = {
                    **existing,
                    **{
                        k: v
                        for k, v in normalized_user.items()
                        if v not in (None, "")
                    },
                    "profile": {
                        **(
                            existing.get("profile")
                            if isinstance(
                                existing.get("profile"),
                                dict,
                            )
                            else {}
                        ),
                        **profile,
                    },
                }

            else:
                merged[key] = normalized_user

        result = list(
            merged.values()
        )

        logger.info(
            "CRM employees loaded: employee_records=%s user_records=%s merged_records=%s",
            len(employees),
            len(users),
            len(result),
        )

        return result

    # =====================================================
    # ATTENDANCE - ACTIVE
    # =====================================================

    async def get_active_attendance(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/attendance/active"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid active attendance response.",
                status_code=502,
            ) from exc

        attendance = self._extract_list(
            result,
            [
                "attendance",
                "data",
            ],
        )

        if attendance is None:
            raise CrmServiceError(
                "Unexpected active attendance response.",
                status_code=502,
            )

        return attendance

    # =====================================================
    # ATTENDANCE - HISTORY
    # =====================================================

    async def get_attendance_history(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/empattendancenew/history"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid attendance history response.",
                status_code=502,
            ) from exc

        attendance = self._extract_list(
            result,
            ["attendance", "data"],
        )

        if attendance is None:
            raise CrmServiceError(
                "Unexpected attendance history response.",
                status_code=502,
            )

        return attendance

   

    # =====================================================
    # ATTENDANCE - GET ALL
    # =====================================================

    async def get_attendance(
        self,
    ) -> list[dict]:

        return await self.get_attendance_history()

    # =====================================================
    # ATTENDANCE - BY EMPLOYEE
    # =====================================================

    
    async def get_attendance_by_employee(
        self,
        employee_uid: str,
        employee_name: str | None = None,
    ) -> list[dict]:

        if not employee_uid:
            return []

        response = await self._get(
            f"/api/empattendancenew/employee/{employee_uid}"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid employee attendance response.",
                status_code=502,
            ) from exc

        attendance = self._extract_list(
            result,
            ["attendance", "data"],
        )

        if attendance is None:
            raise CrmServiceError(
                "Unexpected employee attendance response.",
                status_code=502,
            )
        for record in attendance:
          print("\n===== ATTENDANCE DEBUG =====")
          print("Date:", record.get("date"))
          print("Clock In:", record.get("clockIn"))
          print("Login Time:", record.get("login_time"))
          print("Clock Out:", record.get("clockOut"))
          print("Logout Time:", record.get("logout_time"))
          print("Created At:", record.get("createdAt"))
          print("============================\n")
        return attendance

    # =====================================================
    # ATTENDANCE - LOGIN
    # =====================================================

    async def attendance_login(
        self,
        employee_uid: str | None = None,
        employee_name: str | None = None,
    ) -> dict:

        payload: dict[str, Any] = {}

        if employee_uid:
            payload["employee_uid"] = employee_uid

        if employee_name:
            payload["employee_name"] = employee_name

        response = await self._post(
            "/api/attendance/login",
            payload,
        )

        try:
            return response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid attendance login response.",
                status_code=502,
            ) from exc

    # =====================================================
    # TASKS - GET ALL
    # =====================================================

    async def get_tasks(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/tasks"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid tasks response.",
                status_code=502,
            ) from exc

        tasks = self._extract_list(
            result,
            [
                "tasks",
                "data",
            ],
        )

        if tasks is None:
            raise CrmServiceError(
                "Unexpected tasks response.",
                status_code=502,
            )

        return tasks

    # =====================================================
    # TASKS - BY EMPLOYEE
    # =====================================================

    async def get_tasks_by_employee(
        self,
        employee_uid: str,
    ) -> list[dict]:

        tasks = await self.get_tasks()

        requested_uid = str(
            employee_uid
        ).strip().lower()

        result = []

        for task in tasks:

            task_employee_uid = str(
                task.get(
                    "employee_uid",
                    task.get(
                        "employeeId",
                        task.get(
                            "employee_id",
                            "",
                        ),
                    ),
                )
            ).strip().lower()

            if (
                task_employee_uid
                == requested_uid
            ):

                result.append(task)

        return result

    # =====================================================
    # TASKS - RECENT
    # =====================================================

    async def get_recent_tasks(
        self,
        employee_uid: str,
    ) -> list[dict]:

        response = await self._get(
            f"/api/tasks/recent/{employee_uid}"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid recent tasks response.",
                status_code=502,
            ) from exc

        tasks = self._extract_list(
            result,
            [
                "tasks",
                "data",
            ],
        )

        if tasks is None:
            raise CrmServiceError(
                "Unexpected recent tasks response.",
                status_code=502,
            )

        return tasks
        # =====================================================
    # TASKS - ALL TASKS FOR AN EMPLOYEE
    # =====================================================

    async def get_employee_tasks(
        self,
        employee_uid: str,
    ) -> list[dict]:

        all_tasks = await self.get_tasks()

        employee_tasks = []

        for task in all_tasks:
            assigned_to = task.get("assignedTo")

            # Handle assignedTo stored as an employee ID
            if isinstance(assigned_to, str):
                if assigned_to == employee_uid:
                    employee_tasks.append(task)

            # Handle assignedTo returned as an object
            elif isinstance(assigned_to, dict):
                assigned_id = (
                    assigned_to.get("_id")
                    or assigned_to.get("id")
                    or assigned_to.get("employee_uid")
                )

                if str(assigned_id) == str(employee_uid):
                    employee_tasks.append(task)

        return employee_tasks
    # =====================================================
    # TASK - BY ID
    # =====================================================

    async def get_task(
        self,
        task_id: str,
    ) -> dict:

        response = await self._get(
            f"/api/tasks/{task_id}"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid task response.",
                status_code=502,
            ) from exc

        if isinstance(
            result,
            dict,
        ):
            return result

        raise CrmServiceError(
            "Unexpected task response.",
            status_code=502,
        )
    
    # =====================================================
    # UPDATE TASK STATUS
    # =====================================================

    async def update_task_status(
        self,
        task_id: str,
        status: str,
    ) -> dict:

        allowed_statuses = {
            "Pending",
            "In Progress",
            "Completed",
        }

        if status not in allowed_statuses:
            raise ValueError(
                f"Unsupported task status: {status}"
            )

        response = await self._put(
            f"/api/tasks/{task_id}",
            {"status": status},
        )

        try:
            result = response.json()
        except ValueError as exc:
            raise CrmServiceError(
                "Invalid task update response.",
                status_code=502,
            ) from exc

        if not isinstance(result, dict):
            raise CrmServiceError(
                "Unexpected task update response.",
                status_code=502,
            )

        if result.get("message") and not result.get("_id"):
            raise CrmServiceError(
                result["message"],
                status_code=502,
            )

        if not result.get("_id"):
            raise CrmServiceError(
                "CRM did not confirm the task update.",
                status_code=502,
            )

        return result

    # =====================================================
    # TASK - CREATE
    # =====================================================

    async def create_task(
        self,
        task_data: dict[str, Any],
    ) -> dict:

        response = await self._post(
            "/api/tasks",
            task_data,
        )

        try:
            return response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid task creation response.",
                status_code=502,
            ) from exc

    # =====================================================
    # TASK - UPDATE
    # =====================================================

    async def update_task(
        self,
        task_id: str,
        task_data: dict[str, Any],
    ) -> dict:

        response = await self._put(
            f"/api/tasks/{task_id}",
            task_data,
        )

        try:
            return response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid task update response.",
                status_code=502,
            ) from exc

    # =====================================================
    # LEAVES - GET ALL
    # =====================================================

    async def get_leaves(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/leave"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid leaves response.",
                status_code=502,
            ) from exc

        leaves = self._extract_list(
            result,
            [
                "leaves",
                "data",
            ],
        )

        if leaves is None:
            raise CrmServiceError(
                "Unexpected leaves response.",
                status_code=502,
            )

        return leaves

    # =====================================================
    # LEAVES - BY EMPLOYEE
    # =====================================================

    async def get_leaves_by_employee(
        self,
        employee_id: str,
    ) -> list[dict]:

        response = await self._post(
            "/api/leave/by-employee",
            {
                "employeeId": employee_id,
            },
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid employee leaves response.",
                status_code=502,
            ) from exc

        leaves = self._extract_list(
            result,
            [
                "leaves",
                "data",
            ],
        )

        if leaves is None:
            raise CrmServiceError(
                "Unexpected employee leaves response.",
                status_code=502,
            )

        return leaves

    # =====================================================
    # LEAVES - APPROVED
    # =====================================================

    async def get_approved_leaves(
        self,
    ) -> list[dict]:

        leaves = await self.get_leaves()

        return [
            leave
            for leave in leaves
            if str(
                leave.get(
                    "status",
                    "",
                )
            ).strip().lower()
            == "approved"
        ]

    # =====================================================
    # LEAVES - PENDING
    # =====================================================

    async def get_pending_leaves(
        self,
    ) -> list[dict]:

        leaves = await self.get_leaves()

        return [
            leave
            for leave in leaves
            if str(
                leave.get(
                    "status",
                    "",
                )
            ).strip().lower()
            == "pending"
        ]

    # =====================================================
    # LEAVES - REJECTED
    # =====================================================

    async def get_rejected_leaves(
        self,
    ) -> list[dict]:

        leaves = await self.get_leaves()

        return [
            leave
            for leave in leaves
            if str(
                leave.get(
                    "status",
                    "",
                )
            ).strip().lower()
            == "rejected"
        ]

    # =====================================================
    # LEAVE - CREATE
    # =====================================================

    async def create_leave(
        self,
        leave_data: dict[str, Any],
    ) -> dict:

        response = await self._post(
            "/api/leave",
            leave_data,
        )

        try:
            return response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid leave creation response.",
                status_code=502,
            ) from exc

    # =====================================================
    # PAYSLIPS - GET ALL
    # =====================================================

    async def get_payslips(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/payslip"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "The CRM returned an invalid payslip response.",
                status_code=502,
            ) from exc

        payslips = self._extract_list(
            result,
            [
                "payslips",
                "data",
                "payroll",
            ],
        )

        if payslips is None:
            raise CrmServiceError(
                "The CRM returned an unexpected payslip response.",
                status_code=502,
            )

        return payslips
  
    # =====================================================
    # LEAVE BALANCE - GET BY EMPLOYEE ID
    # =====================================================

    async def get_leave_balance(
        self,
        employee_id: str,
    ) -> dict:

        response = await self._get(
            f"/api/totalLeave/{employee_id}"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "The CRM returned an invalid leave balance response.",
                status_code=502,
            ) from exc

        if not isinstance(result, dict):
            raise CrmServiceError(
                "The CRM returned an unexpected leave balance response.",
                status_code=502,
            )

        return result

    # =====================================================
    # PAYSLIPS - BY EMPLOYEE
    # =====================================================

    async def get_payslips_by_employee(
        self,
        employee_id: str,
    ) -> list[dict]:

        payslips = await self.get_payslips()

        raw_ids = employee_id if isinstance(employee_id, (list, tuple, set)) else [employee_id]
        requested_ids = {
            str(value).strip().lower()
            for value in raw_ids
            if value not in (None, "")
        }

        result = []

        for payslip in payslips:

            payslip_employee_id = str(
                payslip.get(
                    "employeeId",
                    payslip.get(
                        "employee_id",
                        payslip.get(
                            "employee_uid",
                            payslip.get(
                                "empId",
                                payslip.get(
                                    "emp_id",
                                    "",
                                ),
                            ),
                        ),
                    ),
                )
            ).strip().lower()

            if (
                requested_ids
                and payslip_employee_id in requested_ids
            ):

                result.append(
                    payslip
                )

        return result

    # =====================================================
    # PAYSLIPS - BY EMPLOYEE NAME
    # =====================================================

    async def get_payslips_by_employee_name(
        self,
        employee_name: str,
    ) -> list[dict]:

        payslips = await self.get_payslips()

        requested_name = str(
            employee_name or ""
        ).strip().lower()

        result = []

        for payslip in payslips:

            payslip_employee_name = str(
                payslip.get(
                    "employeeName",
                    payslip.get(
                        "employee_name",
                        payslip.get(
                            "empName",
                            payslip.get(
                                "name",
                                "",
                            ),
                        ),
                    ),
                )
            ).strip().lower()

            if (
                requested_name
                and payslip_employee_name == requested_name
            ):

                result.append(
                    payslip
                )

        return result

    # =====================================================
    # PAYSLIP - BY EMPLOYEE AND MONTH
    # =====================================================

    async def get_payslip_by_employee_and_month(
        self,
        employee_id: str,
        month: str,
    ) -> dict | None:

        payslips = (
            await self.get_payslips_by_employee(
                employee_id
            )
        )

        import re
        from datetime import datetime

        requested_month = str(month or "").strip().casefold()
        month_aliases = {
            "jan": 1, "january": 1,
            "feb": 2, "february": 2,
            "mar": 3, "march": 3,
            "apr": 4, "april": 4,
            "may": 5,
            "jun": 6, "june": 6,
            "jul": 7, "july": 7,
            "aug": 8, "august": 8,
            "sep": 9, "sept": 9, "september": 9,
            "oct": 10, "october": 10,
            "nov": 11, "november": 11,
            "dec": 12, "december": 12,
        }

        def parse_month_value(value):
            value = str(value or "").strip().casefold()
            match = re.search(r"([a-z]{3,9})\D*(20\d{2})?", value)
            if not match:
                return None, None
            month_number = month_aliases.get(match.group(1))
            year = int(match.group(2)) if match.group(2) else None
            return month_number, year

        requested_number, requested_year = parse_month_value(requested_month)
        matches = []

        for payslip in payslips:
            stored_month = (
                payslip.get("month")
                or payslip.get("payMonth")
                or payslip.get("pay_period")
                or ""
            )
            stored_number, stored_year = parse_month_value(stored_month)

            if requested_number is not None:
                month_matches = stored_number == requested_number
                year_matches = requested_year is None or stored_year == requested_year
                if month_matches and year_matches:
                    matches.append(payslip)
            elif str(stored_month).strip().casefold() == requested_month:
                matches.append(payslip)

        if not matches:
            return None

        # If the employee asks only for a month (e.g. "October"),
        # return the newest matching payslip period.
        def payslip_sort_key(item):
            _, year = parse_month_value(
                item.get("month") or item.get("payMonth") or ""
            )
            created = item.get("createdAt") or item.get("created_at") or ""
            return (year or 0, str(created))

        return sorted(matches, key=payslip_sort_key, reverse=True)[0]
    # =====================================================
    # AUTOMATION RULES - GET ACTIVE RULES
    # =====================================================

    async def get_active_automation_rules(self) -> list[dict]:

        response = await self._get(
            "/api/automation-rules/active"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid automation rules response.",
                status_code=502,
            ) from exc

        if not isinstance(result, dict):
            raise CrmServiceError(
                "Unexpected automation rules response.",
                status_code=502,
            )

        if not result.get("success"):
            raise CrmServiceError(
                "Could not retrieve active automation rules.",
                status_code=502,
            )

        rules = result.get("data", [])

        if not isinstance(rules, list):
            raise CrmServiceError(
                "Invalid automation rules data.",
                status_code=502,
            )

        return rules
    # =====================================================
    # CONVERSATIONS - GET ALL
    # =====================================================

    async def get_conversations(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/conversations"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid conversations response.",
                status_code=502,
            ) from exc

        conversations = self._extract_list(
            result,
            [
                "conversations",
                "data",
            ],
        )

        if conversations is None:
            raise CrmServiceError(
                "Unexpected conversations response.",
                status_code=502,
            )

        return conversations

    # =====================================================
    # CONVERSATION - GET BY ID
    # =====================================================

    async def get_conversation(
        self,
        conversation_id: str,
    ) -> dict:

        response = await self._get(
            f"/api/conversations/{conversation_id}"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid conversation response.",
                status_code=502,
            ) from exc

        if not isinstance(
            result,
            dict,
        ):
            raise CrmServiceError(
                "Unexpected conversation response.",
                status_code=502,
            )

        data = result.get(
            "data",
            result,
        )

        if isinstance(
            data,
            dict,
        ):
            return data

        raise CrmServiceError(
            "Unexpected conversation response.",
            status_code=502,
        )

    # =====================================================
    # CONVERSATION - CREATE
    # =====================================================

    async def create_conversation(
        self,
        conversation_data: dict[str, Any],
    ) -> dict:

        response = await self._post(
            "/api/conversations",
            conversation_data,
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid conversation creation response.",
                status_code=502,
            ) from exc

        if not isinstance(
            result,
            dict,
        ):
            raise CrmServiceError(
                "Unexpected conversation creation response.",
                status_code=502,
            )

        data = result.get(
            "data",
            result,
        )

        if isinstance(
            data,
            dict,
        ):
            return data

        raise CrmServiceError(
            "Unexpected conversation creation response.",
            status_code=502,
        )

    # =====================================================
    # CONVERSATION - ADD MESSAGE
    # =====================================================

    async def add_conversation_message(
        self,
        conversation_id: str,
        sender: str,
        message: str,
    ) -> dict:

        response = await self._post(
            f"/api/conversations/{conversation_id}/messages",
            {
                "sender": sender,
                "message": message,
            },
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid conversation message response.",
                status_code=502,
            ) from exc

        if isinstance(
            result,
            dict,
        ):
            return result.get(
                "data",
                result,
            )

        raise CrmServiceError(
            "Unexpected conversation message response.",
            status_code=502,
        )

    # =====================================================
    # CONVERSATION - TAKE OVER
    # =====================================================

    async def take_over_conversation(
        self,
        conversation_id: str,
    ) -> dict:

        response = await self._put(
            f"/api/conversations/{conversation_id}/take-over"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid take-over response.",
                status_code=502,
            ) from exc

        if isinstance(
            result,
            dict,
        ):
            return result.get(
                "data",
                result,
            )

        raise CrmServiceError(
            "Unexpected take-over response.",
            status_code=502,
        )

    # =====================================================
    # CONVERSATION - RESOLVE
    # =====================================================

    async def resolve_conversation(
        self,
        conversation_id: str,
    ) -> dict:

        response = await self._put(
            f"/api/conversations/{conversation_id}/resolve"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid resolve response.",
                status_code=502,
            ) from exc

        if isinstance(
            result,
            dict,
        ):
            return result.get(
                "data",
                result,
            )

        raise CrmServiceError(
            "Unexpected resolve response.",
            status_code=502,
        )

    # =====================================================
    # PROJECTS - BY EMPLOYEE
    # =====================================================

    async def get_projects_by_employee(
        self,
        employee_id: str,
    ) -> list[dict]:
        """
        Get projects assigned to a specific employee.

        Projects store employee assignments in:
        project.members[].uid
        """

        response = await self._get(
            "/api/projects"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid projects response.",
                status_code=502,
            ) from exc

        projects = self._extract_list(
            result,
            [
                "projects",
                "data",
            ],
        )

        if projects is None:
            raise CrmServiceError(
                "Unexpected projects response.",
                status_code=502,
            )

        raw_ids = employee_id if isinstance(employee_id, (list, tuple, set)) else [employee_id]
        employee_ids = {
            str(value).strip().lower()
            for value in raw_ids
            if value not in (None, "")
        }

        if not employee_ids:
            return []

        matched_projects = []

        for project in projects:

            if not isinstance(
                project,
                dict,
            ):
                continue

            members = project.get(
                "members"
            )

            if not isinstance(
                members,
                list,
            ):
                continue

            for member in members:

                if not isinstance(
                    member,
                    dict,
                ):
                    continue

                member_uid = str(
                    member.get("uid")
                    or ""
                ).strip()

                if member_uid.lower() in employee_ids:
                   
                    
                  
                    matched_projects.append(
                        project
                    )

                    break

        logger.info(
            "CRM projects loaded: "
            "total=%s employee_id=%s matched=%s",
            len(projects),
            employee_id,
            len(matched_projects),
        )

        return matched_projects

    # =====================================================
    # FOLLOW-UPS - GET ALL
    # =====================================================

    async def get_followups(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/followups"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid follow-ups response.",
                status_code=502,
            ) from exc

        followups = self._extract_list(
            result,
            [
                "followups",
                "followUps",
                "data",
            ],
        )

        if followups is None:
            raise CrmServiceError(
                "Unexpected follow-ups response.",
                status_code=502,
            )

        logger.info(
            "CRM follow-ups loaded: total=%s",
            len(followups),
        )

        return followups

    # =====================================================
    # FOLLOW-UPS - BY EMPLOYEE
    # =====================================================

    async def get_followups_by_employee(
        self,
        employee: dict,
    ) -> list[dict]:
        """
        Get follow-ups assigned to the current employee.

        Follow-ups use the assignedTo field, which may contain
        the employee ID, name, or email.
        """

        followups = await self.get_followups()

        employee_id = str(
            employee.get("_id")
            or employee.get("id")
            or ""
        ).strip()

        employee_name = str(
            employee.get("employeeName")
            or employee.get("name")
            or ""
        ).strip().lower()

        employee_email = str(
            employee.get("email")
            or ""
        ).strip().lower()

        matched_followups = []

        for followup in followups:

            if not isinstance(
                followup,
                dict,
            ):
                continue

            assigned_to = followup.get(
                "assignedTo"
            )

            if assigned_to is None:
                continue

            assigned_value = str(
                assigned_to
            ).strip()

            if not assigned_value:
                continue

            assigned_lower = (
                assigned_value.lower()
            )

            if (
                assigned_value == employee_id
                or assigned_lower == employee_name
                or assigned_lower == employee_email
            ):
                matched_followups.append(
                    followup
                )

        logger.info(
            "CRM follow-ups filtered: "
            "employee=%s total=%s matched=%s",
            employee_name,
            len(followups),
            len(matched_followups),
        )

        return matched_followups

    # =====================================================
    # MEETINGS - GET ALL
    # =====================================================

    async def get_meetings(
        self,
    ) -> list[dict]:

        response = await self._get(
            "/api/meetings"
        )

        try:
            result = response.json()

        except ValueError as exc:
            raise CrmServiceError(
                "Invalid meetings response.",
                status_code=502,
            ) from exc

        meetings = self._extract_list(
            result,
            [
                "meetings",
                "data",
            ],
        )

        if meetings is None:
            raise CrmServiceError(
                "Unexpected meetings response.",
                status_code=502,
            )

        logger.info(
            "CRM meetings loaded: total=%s",
            len(meetings),
        )

        return meetings

    # =====================================================
    # MEETINGS - BY EMPLOYEE
    # =====================================================

    async def get_meetings_by_employee(
        self,
        employee: dict,
    ) -> list[dict]:
        """
        Get meetings related to the current employee.

        An employee can appear as:
        - organizer
        - participant
        """

        meetings = await self.get_meetings()

        employee_id = str(
            employee.get("_id")
            or employee.get("id")
            or ""
        ).strip()

        employee_email = str(
            employee.get("email")
            or ""
        ).strip().lower()

        employee_name = str(
            employee.get("employeeName")
            or employee.get("name")
            or ""
        ).strip().lower()

        matched_meetings = []

        for meeting in meetings:

            if not isinstance(
                meeting,
                dict,
            ):
                continue

            # -------------------------------------------------
            # Check organizer
            # -------------------------------------------------

            organizer = meeting.get(
                "organizer"
            )

            if isinstance(
                organizer,
                dict,
            ):

                organizer_id = str(
                    organizer.get("_id")
                    or organizer.get("id")
                    or ""
                ).strip()

                organizer_email = str(
                    organizer.get("email")
                    or ""
                ).strip().lower()

                if (
                    organizer_id == employee_id
                    or (
                        employee_email
                        and organizer_email
                        == employee_email
                    )
                ):
                    matched_meetings.append(
                        meeting
                    )

                    continue

            # -------------------------------------------------
            # Check participants
            # -------------------------------------------------

            participants = meeting.get(
                "participants"
            )

            if not isinstance(
                participants,
                list,
            ):
                continue

            employee_found = False

            for participant in participants:

                if not isinstance(
                    participant,
                    dict,
                ):
                    continue

                participant_id = str(
                    participant.get("_id")
                    or participant.get("id")
                    or participant.get("uid")
                    or ""
                ).strip()

                participant_email = str(
                    participant.get("email")
                    or ""
                ).strip().lower()

                participant_name = str(
                    participant.get("name")
                    or ""
                ).strip().lower()

                if (
                    participant_id == employee_id
                    or (
                        employee_email
                        and participant_email
                        == employee_email
                    )
                    or (
                        employee_name
                        and participant_name
                        == employee_name
                    )
                ):
                    employee_found = True
                    break

            if employee_found:
                matched_meetings.append(
                    meeting
                )

        logger.info(
            "CRM meetings filtered: "
            "employee=%s total=%s matched=%s",
            employee_name,
            len(meetings),
            len(matched_meetings),
        )

        return matched_meetings

    # =====================================================
    # ADD NOTE TO PROJECT
    # =====================================================

    async def add_project_note(
        self,
        project_id: str,
        title: str,
        description: str,
    ) -> dict:

        response = await self._put(
            f"/api/projects/{project_id}",
            {
                "notes": [
                    {
                        "title": title,
                        "description": description,
                        "date": "",
                    }
                ],
            },
        )

        try:
            result = response.json()
        except ValueError as exc:
            raise CrmServiceError(
                "Invalid project note response.",
                status_code=502,
            ) from exc

        if not isinstance(result, dict):
            raise CrmServiceError(
                "Unexpected project note response.",
                status_code=502,
            )

        if not result.get("_id"):
            raise CrmServiceError(
                "CRM did not confirm the project note update.",
                status_code=502,
            )

        return result

    # =====================================================
    # UPDATE PROJECT NOTE
    # =====================================================

    async def update_project_note(
        self,
        project_id: str,
        notes: list[dict],
    ) -> dict:

        response = await self._put(
            f"/api/projects/{project_id}",
            {"notes": notes},
        )

        try:
            result = response.json()
        except ValueError as exc:
            raise CrmServiceError(
                "Invalid project note update response.",
                status_code=502,
            ) from exc

        if not isinstance(result, dict):
            raise CrmServiceError(
                "Unexpected project note update response.",
                status_code=502,
            )

        if not result.get("_id"):
            raise CrmServiceError(
                "CRM did not confirm the project note update.",
                status_code=502,
            )

        return result


# =========================================================
# FASTAPI DEPENDENCY
# =========================================================

def get_crm_service() -> CrmService:
    """
    FastAPI dependency factory.
    """

    return CrmService()