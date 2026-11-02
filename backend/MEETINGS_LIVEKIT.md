# Live meetings

The Meetings module uses LiveKit as its SFU for in-app group audio/video. The CRM backend issues short-lived, room-scoped access tokens only to the meeting organizer and invited, active CRM users. The LiveKit API secret must remain on the backend.

## Configure the backend

Set these environment variables on the backend host and in `backend/.env` for local development:

```dotenv
LIVEKIT_URL=wss://your-livekit-host.example.com
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret
```

Use the WebSocket URL reachable from users' browsers. Do not put the API secret in a `VITE_` variable or commit it to source control. Restart the backend after setting the values.

## Deploy LiveKit

Deploy a LiveKit server that is reachable from both the CRM backend and user browsers. Configure HTTPS/WSS with a valid certificate and allow LiveKit's required signaling and WebRTC media ports through the host firewall and any reverse proxy. For production, use LiveKit's current self-hosting guide for the selected deployment environment and verify connectivity from outside the server network.

## Use a live meeting

Create or edit a meeting, enable **In-app live meeting**, and add CRM employees as participants. The organizer and those invited employees can join from the meeting details page. Each person needs to allow microphone/camera access in their browser. Meetings marked completed or cancelled cannot be joined.

The CRM token endpoint is `POST /api/meetings/:id/livekit-token`; it returns a short-lived LiveKit token only after checking the authenticated user against the meeting's organizer and internal participant IDs.
