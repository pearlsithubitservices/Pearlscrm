"""
Thin, reusable HTTP client for talking to the existing Node/Express CRM.

Architecture:

    FastAPI
       ↓
    CrmService
       ↓
    httpx
       ↓
    Node/Express CRM
       ↓
    MongoDB
"""

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

    def _headers(self) -> dict[str, str]:

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
    # GET REQUEST
    # =====================================================

    async def _get(
        self,
        path: str,
    ) -> httpx.Response:

        url = f"{self.base_url}{path}"

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
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
                "CRM request to %s timed out: %s",
                url,
                exc,
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
                timeout=self.timeout
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
                "CRM request to %s timed out: %s",
                url,
                exc,
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
                timeout=self.timeout
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
                "CRM request to %s timed out: %s",
                url,
                exc,
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
    # RESPONSE VALIDATION
    # =====================================================

    def _validate_response(
        self,
        response: httpx.Response,
        url: str,
    ) -> httpx.Response:

        if response.status_code in (401, 403):

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
    # EMPLOYEES
    # =====================================================

    async def get_employees(self) -> list[dict]:

        """
        Get all employees.

        CRM:
            GET /api/employees
        """

        response = await self._get(
            "/api/employees"
        )

        try:

            data = response.json()

        except ValueError as exc:

            logger.error(
                "CRM returned invalid JSON from /api/employees"
            )

            raise CrmServiceError(
                "The CRM service returned an invalid response.",
                status_code=502,
            ) from exc

        if not isinstance(data, list):

            raise CrmServiceError(
                "The CRM service returned an unexpected response shape.",
                status_code=502,
            )

        return data

    # =====================================================
    # ATTENDANCE - ACTIVE
    # =====================================================

    async def get_active_attendance(
        self,
    ) -> list[dict]:

        """
        Get currently active attendance records.

        CRM:
            GET /api/attendance/active
        """

        response = await self._get(
            "/api/attendance/active"
        )

        try:

            data = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid attendance response.",
                status_code=502,
            ) from exc

        if not isinstance(data, list):

            raise CrmServiceError(
                "The CRM returned an unexpected attendance response.",
                status_code=502,
            )

        return data

    # =====================================================
    # ATTENDANCE - HISTORY
    # =====================================================

    async def get_attendance_history(
        self,
    ) -> list[dict]:

        """
        Get all attendance history.

        CRM:
            GET /api/attendance/history
        """

        response = await self._get(
            "/api/attendance/history"
        )

        try:

            data = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid attendance history response.",
                status_code=502,
            ) from exc

        if not isinstance(data, list):

            raise CrmServiceError(
                "The CRM returned an unexpected attendance history response.",
                status_code=502,
            )

        return data

    # =====================================================
    # ATTENDANCE - BY EMPLOYEE
    # =====================================================

    async def get_attendance_by_employee(
        self,
        employee_uid: str,
        employee_name : str|None = None,
    ) -> list[dict]:

      
    

        attendance = await self.get_attendance_history()

        requested_uid = str(
            employee_uid or ""
        ).strip()
        requested_name = str(employee_name or "").strip().lower()

        result = []

        for record in attendance:

            record_uid = str(
                record.get(
                    "employee_uid",
                    "",
                )
            ).strip()
            record_name=str(record.get("employee_name", "")).strip().lower()
            if requested_uid and record_uid == requested_uid:
                result.append(record)
                continue
            if requested_name and record_name == requested_name:
                result.append(record)
                continue
            
        return result

    # =====================================================
    # ATTENDANCE - LOGIN
    # =====================================================

    async def attendance_login(
        self,
        employee_uid: str | None = None,
        employee_name: str | None = None,
    ) -> dict:

        """
        Login an employee.

        CRM:
            POST /api/attendance/login
        """

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
                "The CRM returned an invalid attendance login response.",
                status_code=502,
            ) from exc

    # =====================================================
    # ATTENDANCE - BREAK
    # =====================================================

    async def attendance_break(
        self,
        attendance_id: str,
    ) -> dict:

        """
        Put an employee on break.

        CRM:
            PUT /api/attendance/break/:id
        """

        response = await self._put(
            f"/api/attendance/break/{attendance_id}"
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid attendance break response.",
                status_code=502,
            ) from exc

    # =====================================================
    # ATTENDANCE - RESUME
    # =====================================================

    async def attendance_resume(
        self,
        attendance_id: str,
    ) -> dict:

        """
        Resume an employee after break.

        CRM:
            PUT /api/attendance/resume/:id
        """

        response = await self._put(
            f"/api/attendance/resume/{attendance_id}"
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid attendance resume response.",
                status_code=502,
            ) from exc

    # =====================================================
    # ATTENDANCE - LOGOUT
    # =====================================================

    async def attendance_logout(
        self,
        attendance_id: str,
        total_seconds: int,
    ) -> dict:

        """
        Logout an employee.

        CRM:
            PUT /api/attendance/logout/:id
        """

        payload = {
            "totalSeconds": total_seconds
        }

        response = await self._put(
            f"/api/attendance/logout/{attendance_id}",
            payload,
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid attendance logout response.",
                status_code=502,
            ) from exc

    # =====================================================
    # TASKS - GET ALL
    # =====================================================

    async def get_tasks(
        self,
    ) -> list[dict]:

        """
        Get all tasks.

        CRM:
            GET /api/tasks
        """

        response = await self._get(
            "/api/tasks"
        )

        try:

            data = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid tasks response.",
                status_code=502,
            ) from exc

        if not isinstance(data, list):

            raise CrmServiceError(
                "The CRM returned an unexpected tasks response.",
                status_code=502,
            )

        return data

    # =====================================================
    # TASKS - RECENT
    # =====================================================

    async def get_recent_tasks(
        self,
        employee_uid: str,
    ) -> list[dict]:

        """
        Get recent tasks for an employee.

        CRM:
            GET /api/tasks/recent/:employee_uid
        """

        response = await self._get(
            f"/api/tasks/recent/{employee_uid}"
        )

        try:

            result = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid recent tasks response.",
                status_code=502,
            ) from exc

        if isinstance(result, dict):

            data = result.get(
                "data",
                [],
            )

            if isinstance(data, list):

                return data

        raise CrmServiceError(
            "The CRM returned an unexpected recent tasks response.",
            status_code=502,
        )

    # =====================================================
    # TASKS - GET BY ID
    # =====================================================

    async def get_task(
        self,
        task_id: str,
    ) -> dict:

        """
        Get one task by ID.

        CRM:
            GET /api/tasks/:id
        """

        response = await self._get(
            f"/api/tasks/{task_id}"
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid task response.",
                status_code=502,
            ) from exc

    # =====================================================
    # TASKS - CREATE
    # =====================================================

    async def create_task(
        self,
        task_data: dict[str, Any],
    ) -> dict:

        """
        Create a new task.

        CRM:
            POST /api/tasks
        """

        response = await self._post(
            "/api/tasks",
            task_data,
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid task creation response.",
                status_code=502,
            ) from exc

    # =====================================================
    # TASKS - UPDATE
    # =====================================================

    async def update_task(
        self,
        task_id: str,
        task_data: dict[str, Any],
    ) -> dict:

        """
        Update an existing task.

        CRM:
            PUT /api/tasks/:id
        """

        response = await self._put(
            f"/api/tasks/{task_id}",
            task_data,
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid task update response.",
                status_code=502,
            ) from exc

    # =====================================================
    # LEAVE - CREATE
    # =====================================================

    async def create_leave(
        self,
        leave_data: dict,
    ) -> dict:

        """
        Create a leave request.

        CRM:
            POST /api/leave
        """

        response = await self._post(
            "/api/leave",
            leave_data,
        )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM service returned an invalid leave response.",
                status_code=502,
            ) from exc

    # =====================================================
    # LEAVE - UPDATE STATUS
    # =====================================================

    async def update_leave_status(
        self,
        leave_id: str,
        status: str,
    ) -> dict:

        """
        Update leave status.

        CRM:
            PATCH /api/leave/:id/status
        """

        url = (
            f"{self.base_url}"
            f"/api/leave/{leave_id}/status"
        )

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.patch(
                    url,
                    json={
                        "status": status
                    },
                    headers=self._headers(),
                )

        except httpx.ConnectError as exc:

            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        if response.status_code == 404:

            raise CrmServiceError(
                "Leave request not found.",
                status_code=404,
            )

        if response.status_code >= 400:

            raise CrmServiceError(
                "The CRM service rejected the leave status update.",
                status_code=(
                    502
                    if response.status_code >= 500
                    else response.status_code
                ),
            )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM service returned an invalid response.",
                status_code=502,
            ) from exc

    # =====================================================
    # LEAVE - UPDATE
    # =====================================================

    async def update_leave(
        self,
        leave_id: str,
        leave_data: dict,
    ) -> dict:

        """
        Update a leave.

        CRM:
            PUT /api/leave/:id
        """

        url = (
            f"{self.base_url}"
            f"/api/leave/{leave_id}"
        )

        try:

            async with httpx.AsyncClient(
                timeout=self.timeout
            ) as client:

                response = await client.put(
                    url,
                    json=leave_data,
                    headers=self._headers(),
                )

        except httpx.ConnectError as exc:

            raise CrmServiceError(
                "Could not connect to the CRM service.",
                status_code=503,
            ) from exc

        except httpx.TimeoutException as exc:

            raise CrmServiceError(
                "The CRM service took too long to respond.",
                status_code=504,
            ) from exc

        except httpx.HTTPError as exc:

            raise CrmServiceError(
                "Unexpected error while contacting the CRM service.",
                status_code=502,
            ) from exc

        if response.status_code == 404:

            raise CrmServiceError(
                "Leave request not found.",
                status_code=404,
            )

        if response.status_code >= 400:

            raise CrmServiceError(
                "The CRM service rejected the leave update.",
                status_code=(
                    502
                    if response.status_code >= 500
                    else response.status_code
                ),
            )

        try:

            return response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM service returned an invalid response.",
                status_code=502,
            ) from exc

    # =====================================================
    # LEAVE - GET ALL
    # =====================================================

    async def get_leaves(
        self,
    ) -> list[dict]:

        """
        Get all leaves.

        CRM:
            GET /api/leave
        """

        response = await self._get(
            "/api/leave"
        )

        try:

            result = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid leaves response.",
                status_code=502,
            ) from exc

        if isinstance(result, list):

            return result

        if isinstance(result, dict):

            leaves = result.get(
                "leaves"
            )

            if isinstance(leaves, list):

                return leaves

        raise CrmServiceError(
            "The CRM returned an unexpected leaves response.",
            status_code=502,
        )

    # =====================================================
    # LEAVE - BY EMPLOYEE
    # =====================================================

    async def get_leaves_by_employee(
        self,
        employee_id: str,
    ) -> list[dict]:

        """
        Get leaves for one employee.

        CRM:
            POST /api/leave/by-employee
        """

        response = await self._post(
            "/api/leave/by-employee",
            {
                "employeeId": employee_id
            },
        )

        try:

            result = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid employee leave response.",
                status_code=502,
            ) from exc

        if isinstance(result, dict):

            leaves = result.get(
                "leaves"
            )

            if isinstance(leaves, list):

                return leaves

        raise CrmServiceError(
            "The CRM returned an unexpected employee leave response.",
            status_code=502,
        )


# =========================================================
# FASTAPI DEPENDENCY
# =========================================================

def get_crm_service() -> CrmService:
    """
    FastAPI dependency factory.
    """

    return CrmService()