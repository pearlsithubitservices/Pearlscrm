import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEmployees from "../Hooks/useEmployees";

export default function ProtectedRoute({
    children,
    role,
}) {

    const {
        user,
        loading,
    } = useAuth();

    const {
        employees,

    } = useEmployees();

    // Wait until auth and employees are loaded
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

    // Find logged in employee
    const employee = employees.find(
        (item) => item.id === user.uid
    );
    console.log(employees);
    // Employee document not found
    if (!employee) {
        return (
            <div className="h-screen flex items-center justify-center">
                Employee profile not found...
            </div>
        );
    }

    // Get role from either field
    const employeeRole =
        employee.role || employee.employeeRole;

    // Role mismatch
    if (
        role &&
        employeeRole?.toLowerCase() !== role.toLowerCase()
    ) {
        return (
            <Navigate
                to={
                    employeeRole.toLowerCase() === "admin" 
                        ? "/"
                        : "/employee/dashboard"
                }
                replace
            />
        );
    }

    return children;
}