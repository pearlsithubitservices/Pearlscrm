import { useEffect, useRef, useState } from "react";
import { ArrowLeft, LoaderCircle, Video } from "lucide-react";
import { LiveKitRoom, RoomAudioRenderer, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";
import toast from "react-hot-toast";
import api from "../lib/api";

export default function LiveMeetingRoom({ meetingId, onLeave }) {
  const [credentials, setCredentials] = useState(null);
  const [error, setError] = useState("");
  const [mediaWarning, setMediaWarning] = useState("");
  const lastRoomErrorRef = useRef("");

  useEffect(() => {
    let active = true;
    api.post(`/meetings/${meetingId}/livekit-token`)
      .then((response) => {
        if (active) setCredentials(response.data?.data);
      })
      .catch((requestError) => {
        if (!active) return;
        const message = requestError.response?.data?.message || "Unable to join the live meeting.";
        setError(message);
      });

    return () => {
      active = false;
    };
  }, [meetingId]);

  const handleRoomError = (roomError) => {
    console.error("Live meeting connection failed:", roomError);
    const errorName = roomError?.name || "";
    const errorDetail = roomError?.message || "";
    const errorText = `${errorName} ${errorDetail}`;
    let message;

    if (/notallowed|permission|deviceerror|notfound|notreadable/i.test(errorText)) {
      setMediaWarning("Allow microphone and camera access in your browser settings, then use the meeting controls to turn them on.");
      return;
    } else if (/401|403|token|unauthorized|forbidden/i.test(`${errorName} ${errorDetail}`)) {
      message = "LiveKit rejected the meeting token. Verify that the backend API key and secret match the configured LiveKit server.";
    } else if (/unsupported|doesn't seem to be supported|not supported/i.test(errorText)) {
      message = `This browser cannot run LiveKit WebRTC: ${errorDetail || errorName}. Open the meeting in an up-to-date Chrome, Edge, Firefox, or Safari browser.`;
    } else if (/websocket|connect|network|timeout/i.test(`${errorName} ${errorDetail}`)) {
      message = `Could not establish a LiveKit connection to ${credentials?.serverUrl}. Check the browser console for the exact connection error; a proxy, firewall, browser extension, or network may be blocking WebSocket/WebRTC traffic.`;
    } else {
      message = errorDetail
        ? `LiveKit connection failed (${errorName || "error"}): ${errorDetail}`
        : "LiveKit connection failed. Check the browser console for details.";
    }

    if (lastRoomErrorRef.current === message) return;
    lastRoomErrorRef.current = message;
    setError(message);
    toast.error(message);
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
        <div className="max-w-lg rounded-2xl bg-white p-6 text-center shadow-xl">
          <Video className="mx-auto h-10 w-10 text-indigo-600" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">Unable to join meeting</h1>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
          <button onClick={onLeave} className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white">
            Back to meetings
          </button>
        </div>
      </main>
    );
  }

  if (!credentials?.token || !credentials?.serverUrl) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex items-center gap-3 text-sm">
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Preparing your meeting...
        </div>
      </main>
    );
  }

  return (
    <main className="flex h-dvh flex-col bg-slate-950">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-900 px-4 py-3 text-white">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600">
            <Video className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">{credentials.meeting.title}</h1>
            <p className="text-xs text-slate-400">Pearls CRM live meeting</p>
          </div>
        </div>
        <button
          onClick={onLeave}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-white hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Leave meeting
        </button>
      </header>

      <div className="relative min-h-0 flex-1">
        <LiveKitRoom
          token={credentials.token}
          serverUrl={credentials.serverUrl}
          connect
          onError={handleRoomError}
          data-lk-theme="default"
          className="h-full"
          style={{ height: "100%" }}
        >
          {mediaWarning && (
            <div role="status" className="absolute z-10 m-4 rounded-xl bg-amber-100 px-4 py-3 text-sm text-amber-900 shadow-lg">
              {mediaWarning}
            </div>
          )}
          <VideoConference />
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </main>
  );
}
