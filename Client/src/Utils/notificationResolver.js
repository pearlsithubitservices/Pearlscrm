// Bulletproof Notification Resolver for Pearls CRM
// Triggers Audio Chime, In-App Floating Toast, and Desktop Popups simultaneously

export const triggerNotification = ({ title, body, icon }) => {
  // 1. Audio Notification Chime (Web Audio API)
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      if (ctx.state === "suspended") {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch (e) {
    console.warn("Audio chime play error:", e);
  }

  // 2. Dispatch Global In-App Toast Event
  window.dispatchEvent(
    new CustomEvent("appNotification", {
      detail: {
        title: title || "New Notification",
        body: body || "",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    })
  );

  // 3. Desktop Browser Popup (if permitted)
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title || "Pearls CRM Alert", {
        body: body || "",
        icon: icon || "/favicon.ico",
      });
    } catch (e) {
      console.warn("Desktop notification popup error:", e);
    }
  }
};

// Permission Request Resolver Function
export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return { status: "unsupported", message: "Browser does not support notifications." };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      triggerNotification({
        title: "Notifications Enabled!",
        body: "Live audio, toast, and desktop alerts are now active.",
      });
      return { status: "granted", message: "Desktop Notifications Enabled!" };
    } else {
      return { status: permission, message: `Notification permission: ${permission}` };
    }
  } catch (err) {
    return { status: "error", message: err.message };
  }
};
