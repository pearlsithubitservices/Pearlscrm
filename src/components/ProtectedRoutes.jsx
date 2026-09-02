import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import useEmployees from "../Hooks/useEmployees";

export default function ProtectedRoute({
    children,
    role,
}) {
    const { user, loading, isAdmin } = useAuth();
    const { employees, loading: employeesLoading } = useEmployees();

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

    // Protect admin-only routes
    if (role === "admin" && !isAdmin) {
        return <Navigate to="/employee-dashboard" replace />;
    }

    // Protect employee routes  
    if (role === "employee" && isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Wait until employees are loaded
    if (employeesLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                Loading employee data...
            </div>
        );
    }

    // Find logged-in employee (optional - for getting additional employee details)
    const userIds = [user.uid, user.id, user._id]
        .filter(Boolean)
        .map(String);
    const employee = employees?.find((item) => {
        const employeeIds = [item.uid, item.id, item._id]
            .filter(Boolean)
            .map(String);

        return employeeIds.some((id) => userIds.includes(id)) ||
            (item.email && user.email && item.email.toLowerCase() === user.email.toLowerCase());
    });

    // Allow users through even if employee profile is not found
    // (useful for newly created admin users)
    if (!employee && role === "employee") {
        return <Navigate to="/employee-dashboard" replace />;
    }

    return children;
}

// export default function ProtectedRoute({ children }) {
//     return children;
// }