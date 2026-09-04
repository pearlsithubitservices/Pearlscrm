import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { IndustryProvider } from './context/IndustryContext';

// ============================================================
// ADMIN LAYOUT
// ============================================================

import Layout from './components/Layout';

// ============================================================
// ADMIN PAGES
// ============================================================

import Dashboard from './pages/Dashboard';
import LeadManagement from './pages/LeadManagement';
import Tasks from './pages/Tasks';
import FollowUps from './pages/FollowUps';
import Projects from './pages/Projects';
import Clients from './pages/Clients';
import Payments from './pages/Payments';
import Employees from './pages/Employees';
import CreateLead from './pages/CreateLead';
import CreateTask from './pages/createTask';
import TaskDetails from './pages/TaskDetails';
import Login from './pages/Login';
import ClientManagement from './pages/ClientManagement';
import AdminCommunication from './pages/CommunicationsAdmin/communication.jsx';
import ProtectedRoutes from './components/ProtectedRoutes.jsx';

// ============================================================
// COMMON / ADMIN DETAILS
// ============================================================

import AttendanceManagement from './pages/Admin/AttendanceManagement';
import Attendance from './pages/Attendance.jsx';
import Reports from './pages/Reports.jsx';
import LeadDetails from './pages/LeadDetails.jsx';
import EmployeeDetails from './pages/EmployeeDetails.jsx';
import TaskComponent from './pages/TaskComponents.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import ClientDetails from './pages/ClientDetails.jsx';
import FollowupDetails from './pages/FollowupDetails.jsx';

import Leave from './pages/LeaveAdmin/LeaveManagement.jsx';
import AdminPayroll from './pages/Payroll/PayrollDashboard.jsx';
import AcceptInvite from './components/AcceptInvite.jsx';
import PayslipAdmin from './pages/Payroll/PayslipAdmin.jsx';
import Performance from './pages/Performance & Growth/Performance.jsx';
import PerformanceList from './pages/Performance & Growth/PerformanceList.jsx';

import ProtectedRoute from './components/ProtectedRoutes.jsx';

// ============================================================
// EMPLOYEE
// ============================================================

import EmployeeLayout from './layouts/EmployeeLayout';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import EmployeeLeads from './pages/employee/EmployeeLeads';
import EmployeeFollowups from './pages/employee/EmployeeFollowups';

import MarketingActivities from './EmployeePages/MarketingActivities/MarketingActivities.jsx';
import ETaskDetails from './EmployeePages/Task/TaskDetails/ETaskDetails.jsx';

import EmpMyprofile from './EmployeePages/Profile/Myprofile.jsx';
import EmpLeave from './EmployeePages/LeaveManagement/Leave.jsx';
import EmpTask from './EmployeePages/Task/Task.jsx';
import EmpPayroll from './EmployeePages/Payroll/Payroll.jsx';
import EmpCommunication from './EmployeePages/Communication/communication.jsx';
import EmpPerformance from './EmployeePages/Performance/Performance.jsx';
import EmpReports from './EmployeePages/Report/ReportsStatements.jsx';
import EmpAttendance from './EmployeePages/AttendanceManagement/Attendance.jsx';
import EmpDocument from './EmployeePages/Document/Document.jsx';
import EmpSettings from './EmployeePages/Settings/settings.jsx';
import EmpDashboard from './EmployeePages/Dashboard/Dashboard.jsx';

import EmpFollowUps from './EmployeePages/FollowUps/FollowUps.jsx';
import EmpProjects from './EmployeePages/Projects/EmpProjects.jsx';
import EmployeeOverview from './pages/employee/EmployeeOverview.jsx';
import EmpGoalDetails from './EmployeePages/Performance/MyGoals/MyGoalDetails.jsx';
import EmpLead from './EmployeePages/Leads/Lead.jsx';
import EmpFollowupDetails from './EmployeePages/FollowUps/FollowupDetails/EmpFollowupDetails.jsx';
import EmpProjectDetails from './EmployeePages/Projects/EmpProjectDetails.jsx';
import Messager from './pages/Messager.jsx';

// ============================================================
// EXISTING WHATSAPP CAMPAIGN
// ============================================================

import WhatsAppLayout from './pages/WhatsApp/WhatsAppLayout.jsx';
import CampaignBuilder from './pages/WhatsApp/CampaignBuilder.jsx';
import Templates from './pages/WhatsApp/Templates.jsx';
import Broadcast from './pages/WhatsApp/Broadcast.jsx';
import LiveQueue from './pages/WhatsApp/LiveQueue.jsx';
import CampaignAnalytics from './pages/WhatsApp/CampaignAnalytics.jsx';
import ApiKeys from './pages/WhatsApp/ApiKeys.jsx';

// ============================================================
// WHATSAPP AI AUTOMATION
// ============================================================

import WhatsAppAutomationDashboard from './pages/WhatsApp Automation/Dashboard.jsx';
import Conversations from './pages/WhatsApp Automation/Conversations.jsx';
import Contacts from './pages/WhatsApp Automation/Contacts.jsx';
import AutomationRules from './pages/WhatsApp Automation/AutomationRules.jsx';
import MessageTemplates from './pages/WhatsApp Automation/MessageTemplates.jsx';
import AIConfig from './pages/WhatsApp Automation/AIConfig.jsx';
import AutomationReports from './pages/WhatsApp Automation/Reports.jsx';
import HumanHandoff from './pages/WhatsApp Automation/HumanHandoff.jsx';
import Integrations from './pages/WhatsApp Automation/Integrations.jsx';
import AutomationSettings from './pages/WhatsApp Automation/Settings.jsx';
import AIAssistant from './pages/WhatsApp Automation/AIAssistant.jsx';

import './WhatsappAutomation.css';

// ============================================================
// PLACEHOLDER
// ============================================================

function PlaceholderPage({ title }) {
  return (
    <div className="p-8 h-full flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {title}
        </h2>

        <p className="text-gray-500 italic">
          This module is coming soon in Phase 3 of the MVP.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// APP
// ============================================================

export default function App() {
  return (
    <AuthProvider>
      <IndustryProvider>
        <BrowserRouter>
          <Routes>

            {/* ==================================================
                LOGIN
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/accept-invite/:id"
              element={<AcceptInvite />}
            />

            {/* ==================================================
                ADMIN ROUTES
            ================================================== */}

            <Route
              element={
                <ProtectedRoute role="admin">
                  <Layout />
                </ProtectedRoute>
              }
            >

              {/* DASHBOARD */}

              <Route
                path="/"
                element={
                  <ProtectedRoute role="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* LEADS */}

              <Route
                path="/leads"
                element={<LeadManagement />}
              />

              <Route
                path="/leadDetails/:id"
                element={<LeadDetails />}
              />

              {/* EMPLOYEE DETAILS */}

              <Route
                path="/employeeDetails/:id"
                element={<EmployeeDetails />}
              />

              {/* TASK */}

              <Route
                path="/taskDetails/:id"
                element={<TaskComponent />}
              />

              <Route
                path="/edit-task/:id"
                element={<TaskDetails />}
              />

              {/* PROJECT */}

              <Route
                path="/projectDetails/:id"
                element={<ProjectDetails />}
              />

              {/* CLIENT */}

              <Route
                path="/clientDetails/:id"
                element={<ClientDetails />}
              />

              {/* FOLLOW UP */}

              <Route
                path="/followupDetails/:id"
                element={<FollowupDetails />}
              />

              <Route
                path="/empfollowupDetails/:id"
                element={<EmpFollowupDetails />}
              />

              {/* ATTENDANCE */}

              <Route
                path="/attendance"
                element={<Attendance />}
              />

              <Route
                path="/attendance-management"
                element={<AttendanceManagement />}
              />

              {/* TASKS */}

              <Route
                path="/tasks"
                element={<Tasks />}
              />

              {/* FOLLOW UPS */}

              <Route
                path="/follow-ups"
                element={<FollowUps />}
              />

              {/* PROJECTS */}

              <Route
                path="/projects"
                element={<Projects />}
              />

              {/* CLIENTS */}

              <Route
                path="/clients"
                element={<Clients />}
              />

              <Route
                path="/clientmanagement"
                element={<ClientManagement />}
              />

              {/* PAYMENTS */}

              <Route
                path="/payments"
                element={<Payments />}
              />

              {/* EMPLOYEES */}

              <Route
                path="/employees"
                element={<Employees />}
              />

              {/* CREATE LEAD */}

              <Route
                path="/create-lead"
                element={<CreateLead />}
              />

              {/* CREATE TASK */}

              <Route
                path="/createTask"
                element={<CreateTask />}
              />

              {/* REPORTS */}

              <Route
                path="/reports"
                element={<Reports />}
              />

              {/* COMMUNICATION */}

              <Route
                path="/communication"
                element={<AdminCommunication />}
              />

              {/* COLLABORATION */}

              <Route
                path="/collaboration"
                element={<Messager />}
              />

              {/* LEAVE */}

              <Route
                path="/leave"
                element={<Leave />}
              />

              {/* PAYROLL */}

              <Route
                path="/admin-payroll"
                element={<AdminPayroll />}
              />

              <Route
                path="/payslipadmin/:id"
                element={<PayslipAdmin />}
              />

              {/* PERFORMANCE */}

              <Route
                path="/admin-performance"
                element={<PerformanceList />}
              />

              <Route
                path="/admin-performance/:id"
                element={<Performance />}
              />

              {/* ==================================================
                  EXISTING WHATSAPP BUSINESS / CAMPAIGN
              ================================================== */}

              <Route
                path="/whatsapp"
                element={<WhatsAppLayout />}
              >
                <Route
                  path="campaign"
                  element={<CampaignBuilder />}
                />

                <Route
                  path="templates"
                  element={<Templates />}
                />

                <Route
                  path="broadcast"
                  element={<Broadcast />}
                />

                <Route
                  path="queue"
                  element={<LiveQueue />}
                />

                <Route
                  path="analytics"
                  element={<CampaignAnalytics />}
                />

                <Route
                  path="api-keys"
                  element={<ApiKeys />}
                />
              </Route>

              {/* ==================================================
                  WHATSAPP AI AUTOMATION
              ================================================== */}

              <Route
                path="/whatsapp-automation"
                element={<WhatsAppAutomationDashboard />}
              />

              <Route
                path="/whatsapp-automation/conversations"
                element={<Conversations />}
              />

              <Route
                path="/whatsapp-automation/contacts"
                element={<Contacts />}
              />

              <Route
                path="/whatsapp-automation/automation"
                element={<AutomationRules />}
              />

              <Route
                path="/whatsapp-automation/templates"
                element={<MessageTemplates />}
              />

              <Route
                path="/whatsapp-automation/ai"
                element={<AIConfig />}
              />

              <Route
                path="/whatsapp-automation/reports"
                element={<AutomationReports />}
              />

              <Route
                path="/whatsapp-automation/handoff"
                element={<HumanHandoff />}
              />

              <Route
                path="/whatsapp-automation/integrations"
                element={<Integrations />}
              />

              <Route
                path="/whatsapp-automation/settings"
                element={<AutomationSettings />}
              />

              <Route
                path="/whatsapp-automation/ai-assistant"
                element={<AIAssistant />}
              />

              {/* SYSTEM SETTINGS */}

              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="System Settings"
                  />
                }
              />

            </Route>

            {/* ==================================================
                EMPLOYEE ROUTES
            ================================================== */}

            <Route
              element={
                <ProtectedRoute role="employee">
                  <EmployeeLayout />
                </ProtectedRoute>
              }
            >

              <Route
                path="/employee-dashboard"
                element={<EmployeeDashboard />}
              />

              <Route
                path="/employee/tasks"
                element={<EmpTask />}
              />

              <Route
                path="/employee/projects"
                element={<EmpProjects />}
              />

              <Route
                path="/employee/marketing-activities"
                element={<MarketingActivities />}
              />

              <Route
                path="/employee/taskDetails/:id"
                element={<ETaskDetails />}
              />

              <Route
                path="/employee/leads"
                element={<EmployeeLeads />}
              />

              <Route
                path="/employee/followups"
                element={<EmployeeFollowups />}
              />

              <Route
                path="/employee/empfollowupDetails/:id"
                element={<EmpFollowupDetails />}
              />

              <Route
                path="/employee/followupDetails/:id"
                element={<EmpFollowupDetails />}
              />

              <Route
                path="/employee/myprofile"
                element={<EmpMyprofile />}
              />

              <Route
                path="/employee/attendance"
                element={<EmpAttendance />}
              />

              <Route
                path="/employee/communication"
                element={<EmpCommunication />}
              />

              <Route
                path="/employee/collaboration"
                element={<Messager />}
              />

              <Route
                path="/employee/reports"
                element={<EmpReports />}
              />

              <Route
                path="/employee/leave"
                element={<EmpLeave />}
              />

              <Route
                path="/employee/payroll"
                element={<EmpPayroll />}
              />

              <Route
                path="/employee/performance"
                element={<EmpPerformance />}
              />

              <Route
                path="/employee/settings"
                element={<EmpSettings />}
              />

              <Route
                path="/employee/task"
                element={<EmpTask />}
              />

              <Route
                path="/employee/dashboard"
                element={<EmpDashboard />}
              />

              <Route
                path="/employee/overview"
                element={<EmployeeOverview />}
              />

              <Route
                path="/employee/follow-ups"
                element={<EmpFollowUps />}
              />

              <Route
                path="/employee/performance/:id"
                element={<EmpGoalDetails />}
              />

              <Route
                path="/employee/lead"
                element={<EmpLead />}
              />

              <Route
                path="/employee/document"
                element={<EmpDocument />}
              />

              <Route
                path="/employee/projects"
                element={<EmpProjects />}
              />

              <Route
                path="/employee/projectDetails/:id"
                element={<EmpProjectDetails />}
              />

              <Route
                path="/employee/projects/:id"
                element={<EmpProjectDetails />}
              />

            </Route>

            {/* ==================================================
                FALLBACK
            ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

          </Routes>
        </BrowserRouter>
      </IndustryProvider>
    </AuthProvider>
  );
}