import asyncio

from app.services.ai_service import AiService


async def main():
    service = AiService()

    try:
        response = await service.get_chat_response("Hello")

        print("\n===== GEMINI RESPONSE =====")
        print(response)
        print("===========================\n")

    except Exception as error:
        print("\n===== GEMINI ERROR =====")
        print(type(error).__name__)
        print(error)
        print("========================\n")


if __name__ == "__main__":
    asyncio.run(main())