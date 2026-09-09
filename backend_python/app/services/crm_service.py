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

        response = await self._get(
            "/api/employees"
        )

        try:

            result = response.json()

        except ValueError as exc:

            raise CrmServiceError(
                "The CRM returned an invalid employee response.",
                status_code=502,
            ) from exc

        employees = self._extract_list(
            result,
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

        return employees

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
            "/api/attendance/history"
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
            [
                "attendance",
                "data",
            ],
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

        attendance = (
            await self.get_attendance_history()
        )

        requested_uid = str(
            employee_uid or ""
        ).strip().lower()

        requested_name = str(
            employee_name or ""
        ).strip().lower()

        result = []

        for record in attendance:

            record_uid = str(
                record.get(
                    "employee_uid",
                    record.get(
                        "employeeId",
                        record.get(
                            "employee_id",
                            "",
                        ),
                    ),
                )
            ).strip().lower()

            record_name = str(
                record.get(
                    "employee_name",
                    record.get(
                        "employeeName",
                        "",
                    ),
                )
            ).strip().lower()

            if (
                requested_uid
                and record_uid == requested_uid
            ):

                result.append(record)

                continue

            if (
                requested_name
                and record_name == requested_name
            ):

                result.append(record)

        return result

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
    # PAYSLIPS - BY EMPLOYEE
    # =====================================================

    async def get_payslips_by_employee(
        self,
        employee_id: str,
    ) -> list[dict]:

        payslips = await self.get_payslips()

        requested_id = str(
            employee_id or ""
        ).strip().lower()

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
                requested_id
                and payslip_employee_id == requested_id
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

        requested_month = str(
            month or ""
        ).strip().lower()

        for payslip in payslips:

            payslip_month = str(
                payslip.get(
                    "month",
                    payslip.get(
                        "payMonth",
                        "",
                    ),
                )
            ).strip().lower()

            if (
                payslip_month
                == requested_month
            ):

                return payslip

        return None

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


# =========================================================
# FASTAPI DEPENDENCY
# =========================================================

def get_crm_service() -> CrmService:
    """
    FastAPI dependency factory.
    """

    return CrmService()