import re
from typing import Optional


class AutomationService:
    """Matches incoming messages against active admin automation rules."""

    CONDITION_KEYWORDS = {
        "leave request": ["leave", "leave request", "apply for leave", "need leave", "want leave", "take leave"],
        "attendance": ["attendance", "check attendance", "attendance record", "my attendance"],
        "leave balance": ["leave balance", "remaining leave", "available leave"],
        "leave status": ["leave status", "status of my leave", "leave application status"],
        "payslip": ["payslip", "pay slip", "salary slip", "payroll", "my payroll", "show my payroll"],
        "paid payslip": ["paid payslip", "paid payslips", "show my paid payslips", "show my paid payroll", "paid payroll"],
        "pending payslip": ["pending payslip", "pending payslips", "show my pending payslips", "show my pending payroll", "pending payroll"],
        "hr help": [
            "hr help", "help from hr", "i need help from hr", "i need hr help",
            "hr i need help", "hr need help", "i need help hr", "need help from hr",
            "need help hr", "help me hr", "hr assistance", "i need hr assistance",
            "need hr assistance", "can hr help me", "can you help me hr",
        ],
        "talk to hr": [
            "talk to hr", "contact hr", "speak to hr", "speak with hr",
            "can i speak with hr", "can i speak to hr", "could i speak with hr",
            "could i speak to hr", "i want to talk to hr", "i want to speak with hr",
            "i want to speak to hr", "connect me to hr", "connect me with hr",
            "please connect me to hr", "please connect me with hr", "let me talk to hr",
            "let me speak with hr", "i need to talk to hr", "i need to speak with hr",
        ],
        "task": ["my task", "my tasks", "show tasks", "show my tasks", "list my tasks", "task details"],
        "task update": ["update task", "update my task", "mark my task", "mark task", "complete task", "complete my task", "finish task", "task status"],
        "update task status": ["update task", "update my task", "mark my task", "mark task", "complete task", "complete my task", "finish task", "task status"],
        "create task": ["create task", "create a task", "add task", "add a task", "new task"],
        "delete task": ["delete task", "delete my task", "delete my tasks", "remove task", "remove my task"],
        "project": ["my project", "my projects", "show projects", "show my projects", "list projects", "list my projects"],
        "project progress": ["project progress", "progress of my project", "my project progress", "project status"],
        "project deadlines": ["project deadline", "project deadlines", "my project deadlines", "project due date"],
        "project team": ["project team", "my project team", "team members"],
        "project milestones": ["project milestone", "project milestones", "my project milestones"],
    }

    def find_matching_rule(self, message: str, rules: list[dict]) -> Optional[dict]:
        if not message or not rules:
            return None

        normalized_message = self._normalize(message)
        matching_rules = []

        for rule in rules:
            if str(rule.get("status", "")).strip().lower() != "active":
                continue
            if str(rule.get("trigger", "")).strip().lower() != "message":
                continue

            condition = rule.get("condition", "")
            if not condition:
                continue

            normalized_condition = self._normalize(str(condition))
            if self._contains_phrase(normalized_message, normalized_condition):
                matching_rules.append(rule)
                continue

            keywords = self.CONDITION_KEYWORDS.get(normalized_condition, [])
            if any(self._contains_phrase(normalized_message, keyword) for keyword in keywords):
                matching_rules.append(rule)

        if not matching_rules:
            return None

        matching_rules.sort(
            key=lambda rule: len(self._normalize(str(rule.get("condition", "")))),
            reverse=True,
        )
        return matching_rules[0]

    @staticmethod
    def _contains_phrase(message: str, phrase: str) -> bool:
        """Match a whole phrase after punctuation/case normalization."""
        normalized_message = AutomationService._normalize(message)
        normalized_phrase = AutomationService._normalize(phrase)
        if not normalized_phrase:
            return False
        return bool(re.search(r"(?<!\w)" + re.escape(normalized_phrase) + r"(?!\w)", normalized_message))

    @staticmethod
    def _normalize(text: str) -> str:
        """Normalize case, punctuation and whitespace for matching."""
        text = str(text).lower().strip()
        text = re.sub(r"[^\w\s]", " ", text)
        return re.sub(r"\s+", " ", text)


# Shared service instance
automation_service = AutomationService()
