import React from "react";
import { Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();

  const getPageInfo = () => {
    const path = location.pathname;

    if (path === "/") {
      return {
        title: "Dashboard",
        subtitle: "Overview of WhatsApp Automation",
      };
    }

    if (path.includes("conversations")) {
      return {
        title: "Conversations",
        subtitle: "Manage all WhatsApp conversations",
      };
    }

    if (path.includes("contacts")) {
      return {
        title: "Contacts",
        subtitle: "Manage your contacts",
      };
    }

    if (path.includes("automation")) {
      return {
        title: "Automation Rules",
        subtitle: "Create and manage automation rules",
      };
    }

    if (path.includes("templates")) {
      return {
        title: "Message Templates",
        subtitle: "Create and manage WhatsApp message templates",
      };
    }

    if (path === "/ai") {
      return {
        title: "AI Configuration",
        subtitle: "Configure AI automation settings",
      };
    }

    if (path.includes("reports")) {
      return {
        title: "Reports & Analytics",
        subtitle: "Analyze WhatsApp automation performance",
      };
    }

    if (path.includes("ai-assistant")) {
      return {
        title: "AI Assistant",
        subtitle: "Manage your AI assistant",
      };
    }

    if (path.includes("handoff")) {
      return {
        title: "Human Handoff",
        subtitle: "Manage conversations transferred to human agents",
      };
    }

    if (path.includes("integrations")) {
      return {
        title: "Integrations",
        subtitle: "Manage external service integrations",
      };
    }

    if (path.includes("settings")) {
      return {
        title: "Settings",
        subtitle: "Manage system settings",
      };
    }

    return {
      title: "Dashboard",
      subtitle: "Overview of WhatsApp Automation",
    };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="topbar-content">

      {/* PAGE TITLE */}
      <div className="topbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* TOPBAR ACTIONS */}
      <div className="topbar-actions">

        <button className="date-button">
          <span>12 Aug 2024 - 18 Aug 2024</span>
          <ChevronDown size={14} />
        </button>

        <button className="notification-button">
          <Bell size={19} />
          <span className="notification-dot"></span>
        </button>

        <div className="profile-circle">
          A
        </div>

      </div>

    </div>
  );
}