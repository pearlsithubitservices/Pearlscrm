from pydantic import BaseModel, Field, field_validator
class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The user's message to the AI assistant.",
        examples=["Hello"],
    )
    conversation_id: str | None = None
    employee_name: str | None = None
    employee_phone: str | None = None


    

    @field_validator("message")
    @classmethod
    def message_must_not_be_blank(
        cls,
        value: str,
    ) -> str:

        if not value.strip():

            raise ValueError(
                "message must not be empty or whitespace only"
            )

        return value


class ChatResponse(BaseModel):

    response: str