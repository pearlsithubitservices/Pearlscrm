import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Wifi, WifiOff } from "lucide-react";
import useWhatsApp from "../../Hooks/useWhatsApp";

export default function WhatsAppLayout() {
  const { connection, fetchConnection } = useWhatsApp();

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#FBFBFA]">
      <header className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-end shrink-0 sticky top-0 z-10">
        {connection?.connected ? (
          <span className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
            <Wifi className="w-3.5 h-3.5" />
            WhatsApp Connected
            {connection.phoneNumber && (
              <span className="text-green-600 font-medium">+{connection.phoneNumber}</span>
            )}
          </span>
        ) : (
          <span className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border">
            <WifiOff className="w-3.5 h-3.5" />
            WhatsApp Not Connected
          </span>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
