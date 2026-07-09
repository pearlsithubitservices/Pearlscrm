import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEmployees from "../Hooks/useEmployees";

export default function ProtectedRoute({
    children,
    role,
}) {
    const { user, loading } = useAuth();
    const { employees } = useEmployees();
    console.log(employees);

    console.log(user?.uid)
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
    if (!employees) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading employee data...
            </div>
        );
    }
    console.log(employees);
    // Find logged-in employee
    const employee = employees.find(
        (item) => item.uid == user.uid
    );

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