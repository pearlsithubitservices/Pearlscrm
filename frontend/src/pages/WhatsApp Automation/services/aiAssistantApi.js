const API_BASE_URL = "http://127.0.0.1:8000";

export async function sendMessage(message) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v1/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`
      );
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("AI API Error:", error);
    throw error;
  }
}