import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEmployees from "../Hooks/useEmployees";

export default function ProtectedRoute({
    children,
    role,
}) {
    const { user, loading } = useAuth();
    const { employees, loading: employeesLoading } = useEmployees();

    console.log(employees);

    console.log(user)
    // Wait for auth to complete
    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading...
            </div>
        );
    }

    // User not logged in
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Wait until employees are loaded
    if (employeesLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading employee data...
            </div>
        );
    }
    console.log(employees);
    // Find logged-in employee
    const userIds = [user.uid, user.id, user._id]
        .filter(Boolean)
        .map(String);
    const employee = employees.find((item) => {
        const employeeIds = [item.uid, item.id, item._id]
            .filter(Boolean)
            .map(String);

        return employeeIds.some((id) => userIds.includes(id)) ||
            (item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase());
    });

    console.log(employee);
    // Employee document not found
    if (!employee) {
        return (
            <div className="h-screen flex items-center justify-center">
                Employee profile not found...
            </div>
        );
    }

    // Get employee role
    const employeeRole = (
        employee.role ||
        employee.employeeRole ||
        ""
    ).toLowerCase();
    console.log(employeeRole);
    console.log(role);
    

    // Protect admin-only routes
    if (role === "admin" && employeeRole !== "admin") {
        return <Navigate to="/employee/dashboard" replace />;
    }

    // Protect employee routes (optional)
    if (role === "employee" && employeeRole === "admin") {
        return <Navigate to="/" replace />;
    }

    return children;
}

// export default function ProtectedRoute({ children }) {
//     return children;
// }