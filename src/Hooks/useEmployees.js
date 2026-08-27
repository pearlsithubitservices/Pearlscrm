import { useEffect, useState, useCallback } from "react";
import { apiUrl } from "../config/api";

const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            let apiEmployees = [];
            let registeredUsers = [];

            // 1. Fetch from /employees endpoint (Employee model)
            try {
                const res = await fetch(apiUrl("/employees"));
                if (res.ok) {
                    const data = await res.json();
                    const rawList = Array.isArray(data) ? data : (data?.data || data?.employees || []);
                    apiEmployees = rawList.map((emp) => {
                        const empName = emp.employeeName || emp.name || emp.displayName || emp.fullName || (emp.email ? emp.email.split('@')[0] : "Employee");
                        return {
                            id: emp._id || emp.id || emp.uid,
                            _id: emp._id || emp.id,
                            uid: emp.uid || emp._id,
                            name: empName,
                            employeeName: empName,
                            email: emp.email || "",
                            role: emp.employeeRole || emp.role || "Employee",
                            ...emp,
                        };
                    });
                }
            } catch (err) {
                console.error("MongoDB employees fetch error:", err);
            }

            // 2. Fetch from /auth/users endpoint (User model)
            try {
                const resUsers = await fetch(apiUrl("/auth/users"));
                if (resUsers.ok) {
                    const userData = await resUsers.json();
                    const rawUsers = Array.isArray(userData) ? userData : (userData?.data || []);
                    registeredUsers = rawUsers.map((u) => {
                        const uName = u.name || u.employeeName || u.displayName || (u.email ? u.email.split('@')[0] : "User");
                        return {
                            id: u._id || u.id,
                            _id: u._id || u.id,
                            uid: u.uid || u._id,
                            name: uName,
                            employeeName: uName,
                            email: u.email || "",
                            role: u.role || "Employee",
                            ...u,
                        };
                    });
                }
            } catch (err) {
                console.error("MongoDB users fetch error:", err);
            }

            // Merge both lists avoiding duplicates (key by lowercase email or ID)
            const map = new Map();

            registeredUsers.forEach((u) => {
                const key = String(u.email || u._id || u.id).toLowerCase();
                if (key) map.set(key, u);
            });

            apiEmployees.forEach((emp) => {
                const key = String(emp.email || emp._id || emp.id).toLowerCase();
                if (key) {
                    if (!map.has(key)) {
                        map.set(key, emp);
                    } else {
                        // Merge additional fields if registered user exists
                        const existing = map.get(key);
                        map.set(key, { ...emp, ...existing });
                    }
                }
            });

            setEmployees(Array.from(map.values()));
        } catch (err) {
            console.error("Fetch employees/users error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Delete single Employee from MongoDB
    const deleteEmployee = async (id) => {
        try {
            const res = await fetch(apiUrl(`/employees/${id}`), { method: "DELETE" });
            if (res.ok) {
                setEmployees((prev) => prev.filter((emp) => (emp._id || emp.id || emp.uid) !== id));
                console.log("Employee deleted successfully from MongoDB");
            }
        } catch (error) {
            console.error("Error deleting employee from MongoDB:", error);
        }
    };

    const toggleEmployeeStatus = async (id) => {
        const res = await fetch(apiUrl(`/auth/users/${id}/status`), {
            method: "PUT",
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to update employee status");
        setEmployees((prev) => prev.map((employee) => (employee.id === id || employee._id === id) ? { ...employee, status: data.status } : employee));
        return data;
    };

    return { employees, loading, refetch: fetchEmployees, deleteEmployee, toggleEmployeeStatus };
};

export default useEmployees;