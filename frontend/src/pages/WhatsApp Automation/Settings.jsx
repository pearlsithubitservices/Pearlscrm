import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Mail,
  Phone,
  Globe,
  Clock3,
  CalendarDays,
  DollarSign,
  Bell,
  Save,
  CheckCircle,
} from "lucide-react";

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    timeZone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    currency: "INR",
    emailNotifications: true,
    systemNotifications: true,
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    console.log("Settings:", settings);

    // Backend integration will be added later.
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="settings-page">

      {/* ================= HEADER ================= */}

      <div className="settings-header">
        <div className="header-icon">
          <SettingsIcon size={25} />
        </div>

        <div>
          <h1>Settings</h1>
          <p>
            Manage your CRM preferences and application settings.
          </p>
        </div>
      </div>

      {/* ================= SUCCESS MESSAGE ================= */}

      {saved && (
        <div className="success-message">
          <CheckCircle size={17} />
          Settings saved successfully.
        </div>
      )}

      {/* ================= COMPANY INFORMATION ================= */}

      <div className="settings-card">

        <div className="card-header">
          <div className="section-icon">
            <Building2 size={20} />
          </div>

          <div>
            <h2>Company Information</h2>
            <p>
              Manage your company's basic information.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="form-grid">

          {/* Company Name */}
          <div className="form-group">
            <label>
              <Building2 size={15} />
              Company Name
            </label>

            <input
              type="text"
              name="companyName"
              value={settings.companyName}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          {/* Company Email */}
          <div className="form-group">
            <label>
              <Mail size={15} />
              Company Email
            </label>

            <input
              type="email"
              name="companyEmail"
              value={settings.companyEmail}
              onChange={handleChange}
              placeholder="Enter company email"
            />
          </div>

          {/* Company Phone */}
          <div className="form-group">
            <label>
              <Phone size={15} />
              Company Phone
            </label>

            <input
              type="text"
              name="companyPhone"
              value={settings.companyPhone}
              onChange={handleChange}
              placeholder="Enter company phone"
            />
          </div>

          {/* Company Website */}
          <div className="form-group">
            <label>
              <Globe size={15} />
              Company Website
            </label>

            <input
              type="text"
              name="companyWebsite"
              value={settings.companyWebsite}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

        </div>
      </div>

      {/* ================= REGIONAL SETTINGS ================= */}

      <div className="settings-card">

        <div className="card-header">
          <div className="section-icon">
            <Clock3 size={20} />
          </div>

          <div>
            <h2>Regional Settings</h2>
            <p>
              Configure timezone, date format and currency.
            </p>
          </div>
        </div>

        <div className="divider" />

        <div className="form-grid">

          {/* Time Zone */}
          <div className="form-group">
            <label>
              <Clock3 size={15} />
              Time Zone
            </label>

            <select
              name="timeZone"
              value={settings.timeZone}
              onChange={handleChange}
            >
              <option value="Asia/Kolkata">
                India Standard Time (IST)
              </option>

              <option value="Asia/Dubai">
                Gulf Standard Time (GST)
              </option>

              <option value="Asia/Singapore">
                Singapore Time (SGT)
              </option>

              <option value="Europe/London">
                London Time (GMT)
              </option>

              <option value="America/New_York">
                Eastern Time (ET)
              </option>
            </select>
          </div>

          {/* Date Format */}
          <div className="form-group">
            <label>
              <CalendarDays size={15} />
              Date Format
            </label>

            <select
              name="dateFormat"
              value={settings.dateFormat}
              onChange={handleChange}
            >
              <option value="DD/MM/YYYY">
                DD/MM/YYYY
              </option>

              <option value="MM/DD/YYYY">
                MM/DD/YYYY
              </option>

              <option value="YYYY-MM-DD">
                YYYY-MM-DD
              </option>
            </select>
          </div>

          {/* Currency */}
          <div className="form-group">
            <label>
              <DollarSign size={15} />
              Currency
            </label>

            <select
              name="currency"
              value={settings.currency}
              onChange={handleChange}
            >
              <option value="INR">
                INR - Indian Rupee
              </option>

              <option value="USD">
                USD - US Dollar
              </option>

              <option value="EUR">
                EUR - Euro
              </option>

              <option value="GBP">
                GBP - British Pound
              </option>
            </select>
          </div>

        </div>
      </div>

      {/* ================= NOTIFICATIONS ================= */}

      <div className="settings-card">

        <div className="card-header">
          <div className="section-icon">
            <Bell size={20} />
          </div>

          <div>
            <h2>Notifications</h2>
            <p>
              Choose which CRM notifications you want to receive.
            </p>
          </div>
        </div>

        <div className="divider" />

        {/* Email Notifications */}
        <div className="notification-row">

          <div className="notification-content">

            <div className="notification-icon">
              <Mail size={18} />
            </div>

            <div>
              <strong>Email Notifications</strong>

              <span>
                Receive important CRM updates and alerts through email.
              </span>
            </div>

          </div>

          <label className="switch">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />

            <span className="slider" />
          </label>

        </div>

        {/* System Notifications */}
        <div className="notification-row">

          <div className="notification-content">

            <div className="notification-icon">
              <Bell size={18} />
            </div>

            <div>
              <strong>System Notifications</strong>

              <span>
                Receive notifications about CRM activities and updates.
              </span>
            </div>

          </div>

          <label className="switch">
            <input
              type="checkbox"
              name="systemNotifications"
              checked={settings.systemNotifications}
              onChange={handleChange}
            />

            <span className="slider" />
          </label>

        </div>

      </div>

      {/* ================= SAVE ================= */}

      <div className="save-section">

        <button
          className="save-button"
          onClick={handleSave}
        >
          <Save size={17} />
          Save Settings
        </button>

      </div>

      {/* ================= CSS ================= */}

      <style>{`

        .settings-page {
          padding: 28px;
          max-width: 1100px;
          margin: 0 auto;
        }

        /* Header */

        .settings-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 25px;
        }

        .header-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2ff;
          color: #4f46e5;
        }

        .settings-header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
          color: #111827;
        }

        .settings-header p {
          margin: 6px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        /* Success */

        .success-message {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 18px;
          padding: 11px 14px;
          border-radius: 9px;
          background: #dcfce7;
          color: #15803d;
          font-size: 13px;
          font-weight: 500;
        }

        /* Card */

        .settings-card {
          background: var(--card-bg, #ffffff);
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.04);
        }

        /* Card Header */

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .section-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #475569;
        }

        .card-header h2 {
          margin: 0;
          font-size: 16px;
          font-weight: 650;
          color: #1f2937;
        }

        .card-header p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }

        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 20px 0;
        }

        /* Form */

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group label {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-size: 13px;
          font-weight: 600;
        }

        .form-group input,
        .form-group select {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          padding: 11px 13px;
          outline: none;
          font-size: 13px;
          background: #ffffff;
          color: #1f2937;
          transition: 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        /* Notifications */

        .notification-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .notification-row:last-child {
          border-bottom: none;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .notification-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          color: #64748b;
        }

        .notification-content strong {
          display: block;
          color: #1f2937;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .notification-content span {
          display: block;
          color: #64748b;
          font-size: 12px;
        }

        /* Toggle */

        .switch {
          position: relative;
          width: 44px;
          height: 24px;
          flex-shrink: 0;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          inset: 0;
          background: #cbd5e1;
          border-radius: 20px;
          transition: 0.25s;
        }

        .slider::before {
          content: "";
          position: absolute;
          width: 18px;
          height: 18px;
          left: 3px;
          top: 3px;
          background: white;
          border-radius: 50%;
          transition: 0.25s;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }

        .switch input:checked + .slider {
          background: #4f46e5;
        }

        .switch input:checked + .slider::before {
          transform: translateX(20px);
        }

        /* Save */

        .save-section {
          display: flex;
          justify-content: flex-end;
          padding-bottom: 30px;
        }

        .save-button {
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          border-radius: 9px;
          padding: 11px 17px;
          background: #4f46e5;
          color: white;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }

        .save-button:hover {
          background: #4338ca;
        }

        /* Responsive */

        @media (max-width: 750px) {

          .settings-page {
            padding: 18px;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .notification-row {
            align-items: flex-start;
          }

          .notification-content {
            align-items: flex-start;
          }

        }

      `}</style>
    </div>
  );
}