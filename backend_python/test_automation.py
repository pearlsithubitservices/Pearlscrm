
from app.services.automation_service import automation_service

rules = [
    {
        "name": "Leave Request",
        "status": "Active",
        "trigger": "Message",
        "condition": "leave request",
        "action": "handle leave request",
    }
]

messages = [
    "i need leave request",
    "I want leave",
    "apply for leave",
]

for message in messages:
    rule = automation_service.find_matching_rule(
        message,
        rules,
    )

    print(
        message,
        "->",
        rule["action"] if rule else "NO MATCH",
    )
