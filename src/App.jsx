import React from 'react';

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import {
  AuthProvider
} from './context/AuthContext';

import {
  IndustryProvider
} from './context/IndustryContext';

// ADMIN LAYOUT

import Layout from './components/Layout';

// ADMIN PAGES

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

// EMPLOYEE

import EmployeeLayout from './layouts/EmployeeLayout';

import EmployeeDashboard from './pages/employee/EmployeeDashboard';



import EmployeeLeads from './pages/employee/EmployeeLeads';

import EmployeeFollowups from './pages/employee/EmployeeFollowups';

import AttendanceManagement from './pages/Admin/AttendanceManagement';
import Attendance from './pages/Attendance.jsx';

import Reports from './pages/Reports.jsx'
import LeadDetails from './pages/LeadDetails.jsx';
import EmployeeDetails from './pages/EmployeeDetails.jsx';
import TaskComponent from './pages/TaskComponents.jsx'
import ProjectDetails from './pages/ProjectDetails.jsx'
import ClientDetails from './pages/ClientDetails.jsx'
import ETaskDetails from './EmployeePages/Task/TaskDetails/ETaskDetails.jsx';

// EMPLOYEE PAGES
import EmpMyprofile from './EmployeePages/Profile/Myprofile.jsx';
import EmpLeave from './EmployeePages/LeaveManagement/Leave.jsx';
import EmpTask from './EmployeePages/Task/Task.jsx';
import EmpPayroll from './EmployeePages/Payroll/Payroll.jsx';
import EmpCommunication from './EmployeePages/Communication/communication.jsx';
import EmpPerformance from './EmployeePages/Performance/Performance.jsx';
import EmpReports from './EmployeePages/Report/Report.jsx';
import EmpAttendance from './EmployeePages/AttendanceManagement/Attendance.jsx';
import EmpDocument from './EmployeePages/Document/Document.jsx';
import EmpSettings from './EmployeePages/Settings/settings.jsx';
import EmpDashboard from './EmployeePages/Dashboard/Dashboard.jsx';
import EmpFollowUps from './EmployeePages/FollowUps/FollowUps.jsx'



import FollowupDetails from './pages/FollowupDetails.jsx';
// PLACEHOLDER

function PlaceholderPage({
  title
}) {

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

export default function App() {

  return (

    <AuthProvider>

      <IndustryProvider>

        <BrowserRouter>

          <Routes>

            {/* LOGIN */}

            <Route
              path="/login"
              element={<Login />}
            />

            {/* ADMIN ROUTES */}

            <Route element={<Layout />}>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/leads"
                element={<LeadManagement />}
              />
              <Route path='/leadDetails/:id'
                element={<LeadDetails />} />

              <Route path='/employeeDetails/:id'
                element={<EmployeeDetails />} />

              <Route path='/taskDetails/:id'
                element={<TaskComponent />} />

              <Route path="/projectDetails/:id"
                element={<ProjectDetails />} />

              <Route path="/clientDetails/:id"
                element={<ClientDetails />} />
              <Route path="/followupDetails/:id"
                element={<FollowupDetails />} />

              <Route
                path="/attendance"
                element={<Attendance />}
              />
              <Route
                path="/attendance-management"
                element={<AttendanceManagement />}
              />

              <Route
                path="/tasks"
                element={<Tasks />}
              />

              <Route
                path="/follow-ups"
                element={<FollowUps />}
              />

              <Route
                path="/projects"
                element={<Projects />}
              />

              <Route
                path="/clients"
                element={<Clients />}
              />
              <Route path="/clientmanagement"
                element={<ClientManagement />} />

              <Route
                path="/payments"
                element={<Payments />}
              />

              <Route
                path="/employees"
                element={<Employees />}
              />

              <Route
                path="/create-lead"
                element={<CreateLead />}
              />

              <Route
                path="/createTask"
                element={<CreateTask />}
              />


              <Route
                path="/edit-task/:id"
                element={<TaskDetails />}
              />

              <Route
                path="/reports"
                element={
                  <Reports />
                }
              />

              <Route
                path="/settings"
                element={
                  <PlaceholderPage
                    title="System Settings"
                  />
                }
              />

            </Route>

            {/* EMPLOYEE ROUTES */}

            <Route element={<EmployeeLayout />}>

              <Route
                path="/employee-dashboard"
                element={
                  <EmployeeDashboard />
                }
              />

              <Route
                path="/employee/tasks"
                element={
                  <EmpTask />
                }
              />
              <Route
                path="/employee/taskDetails/:id"
                element={
                  <ETaskDetails />
                }
              />

              <Route
                path="/employee/leads"
                element={
                  <EmployeeLeads />
                }
              />

              <Route
                path="/employee/followups"
                element={
                  <EmployeeFollowups />
                }
              />
              <Route
                path="/employee/myprofile"
                element={
                  <EmpMyprofile />
                }
              />
              <Route path="/employee/attendance" element={<EmpAttendance />} />
              <Route path="/employee/communication" element={<EmpCommunication />} />
              <Route path="/employee/reports" element={<EmpReports />} />
              <Route path="/employee/leave" element={<EmpLeave />} />
              <Route path="/employee/payroll" element={<EmpPayroll/>} />
              <Route path="/employee/performance" element={<EmpPerformance />} />
              <Route path="/employee/settings" element={<EmpSettings />} />
              <Route path="/employee/task" element={<EmpTask />} />
              <Route path="/employee/dashboard" element={<EmpDashboard />} />
              <Route path="/employee/follow-ups" element={<EmpFollowUps />} />

              <Route
                path="/employee/attendance"
                element={
                  <Attendance />
                }
              />
            </Route>

            {/* FALLBACK */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
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