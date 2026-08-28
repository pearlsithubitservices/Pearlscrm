import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Topbar from '../components/Topbar'
import '../../WhatsappAutomation.css';
export default function AdminLayout() {
  return (
    <div className="app-shell">

      <aside
        className="sidebar"
        style={{
          width: "260px",
          minHeight: "100vh",
          backgroundColor: "#062B5C",
          padding: "20px",
          color: "white"
        }}
      >

        {/* CRM BRAND */}
        <div className="brand">

          <div className="brand-icon">
            
          </div>

          <div className="brand-text">
            <div className="brand-title">
              CRM
            </div>

            <div className="brand-subtitle">
              AI WhatsApp Automation
            </div>
          </div>

        </div>

        {/* SIDEBAR MENU */}
        <Sidebar />

        {/* ADMIN USER */}
        <div className="admin-user">

          <div className="admin-avatar">
            
          </div>

          <div className="admin-info">
            <div className="admin-name">
              Admin User
            </div>

            <div className="admin-role">
              Super Admin
            </div>
          </div>

          <div className="online-dot"></div>

        </div>

      </aside>

      {/* MAIN CONTENT */}
      <div className="content">

        <header className="topbar">
          <Topbar />
        </header>

        <main className="main">
          <Outlet />
        </main>

      </div>

    </div>
  )
}