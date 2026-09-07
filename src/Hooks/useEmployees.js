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
                        // Deep merge additional fields if registered user exists
                        const existing = map.get(key);
                        const extractSal = (o) => {
                            if (!o) return {};
                            const s1 = o.salary && typeof o.salary === "object" ? o.salary : {};
                            const s2 = o.profile?.salary && typeof o.profile?.salary === "object" ? o.profile.salary : {};
                            const hasS1 = Boolean(s1.basicSalary || s1.grossSalary || s1.netSalary || (s1.allowances && Object.keys(s1.allowances).length > 0) || (s1.deductions && Object.keys(s1.deductions).length > 0));
                            const hasS2 = Boolean(s2.basicSalary || s2.grossSalary || s2.netSalary || (s2.allowances && Object.keys(s2.allowances).length > 0) || (s2.deductions && Object.keys(s2.deductions).length > 0));
                            return {
                                ...s1,
                                ...s2,
                                allowances: (hasS2 && s2.allowances ? s2.allowances : null) || (hasS1 && s1.allowances ? s1.allowances : null) || s2.allowances || s1.allowances || o.profile?.allowances || o.allowances,
                                deductions: (hasS2 && s2.deductions ? s2.deductions : null) || (hasS1 && s1.deductions ? s1.deductions : null) || s2.deductions || s1.deductions || o.profile?.deductions || o.deductions,
                                basicSalary: s2.basicSalary ?? s1.basicSalary ?? o.basicSalary,
                                grossSalary: s2.grossSalary ?? s1.grossSalary ?? o.grossSalary,
                                netSalary: s2.netSalary ?? s1.netSalary ?? o.netSalary,
                            };
                        };

                        const empSalary = extractSal(emp);
                        const userSalary = extractSal(existing);
                        const mergedSalary = {
                            ...empSalary,
                            ...userSalary,
                            allowances: userSalary.allowances || empSalary.allowances || existing.allowances || emp.allowances,
                            deductions: userSalary.deductions || empSalary.deductions || existing.deductions || emp.deductions,
                            basicSalary: userSalary.basicSalary ?? empSalary.basicSalary,
                            grossSalary: userSalary.grossSalary ?? empSalary.grossSalary,
                            netSalary: userSalary.netSalary ?? empSalary.netSalary,
                        };

                        const mergedProfile = {
                            ...(emp.profile || {}),
                            ...(existing.profile || {}),
                            salary: mergedSalary,
                            bankDetails: {
                                ...(emp.profile?.bankDetails || emp.bankDetails || {}),
                                ...(existing.profile?.bankDetails || existing.bankDetails || {}),
                            },
                        };

                        map.set(key, {
                            ...emp,
                            ...existing,
                            originalEmployeeId: emp._id || emp.id,
                            originalUserId: existing._id || existing.id,
                            profile: mergedProfile,
                            salary: mergedSalary,
                        });
                    }
                }
            });

            const extractFinalSal = (o) => {
                if (!o) return {};
                const s1 = o.salary && typeof o.salary === "object" ? o.salary : {};
                const s2 = o.profile?.salary && typeof o.profile?.salary === "object" ? o.profile.salary : {};
                const hasS1 = Boolean(s1.basicSalary || s1.grossSalary || s1.netSalary || (s1.allowances && Object.keys(s1.allowances).length > 0) || (s1.deductions && Object.keys(s1.deductions).length > 0));
                const hasS2 = Boolean(s2.basicSalary || s2.grossSalary || s2.netSalary || (s2.allowances && Object.keys(s2.allowances).length > 0) || (s2.deductions && Object.keys(s2.deductions).length > 0));
                return {
                    ...s1,
                    ...s2,
                    allowances: (hasS2 && s2.allowances ? s2.allowances : null) || (hasS1 && s1.allowances ? s1.allowances : null) || s2.allowances || s1.allowances || o.profile?.allowances || o.allowances,
                    deductions: (hasS2 && s2.deductions ? s2.deductions : null) || (hasS1 && s1.deductions ? s1.deductions : null) || s2.deductions || s1.deductions || o.profile?.deductions || o.deductions,
                    basicSalary: s2.basicSalary ?? s1.basicSalary ?? o.basicSalary,
                    grossSalary: s2.grossSalary ?? s1.grossSalary ?? o.grossSalary,
                    netSalary: s2.netSalary ?? s1.netSalary ?? o.netSalary,
                };
            };

            const mergedList = Array.from(map.values()).map((emp, index) => {
                const existingEmpId = emp.profile?.empId || emp.empId || emp.employeeCode;
                const finalEmpId = existingEmpId || `EMP-${1001 + index}`;
                const unifiedSalary = extractFinalSal(emp);
                return {
                    ...emp,
                    empId: finalEmpId,
                    displayEmpId: finalEmpId,
                    salary: unifiedSalary,
                    profile: {
                        ...(emp.profile || {}),
                        salary: unifiedSalary,
                    },
                };
            });

            setEmployees(mergedList);
        } catch (err) {
            console.error("Fetch employees/users error:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    // Create single Employee in MongoDB
    const createEmployee = async (employeeData) => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl("/employees"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(employeeData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to create employee");
            }
            await fetchEmployees();
            return data.data;
        } finally {
            setLoading(false);
        }
    };

    // Update single Employee in MongoDB
    const updateEmployee = async (id, updatedData) => {
        try {
            setLoading(true);
            const response = await fetch(apiUrl(`/employees/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Failed to update employee");
            }
            await fetchEmployees();
            return data.data;
        } finally {
            setLoading(false);
        }
    };

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
        const targetEmp = employees.find((e) => (e.id === id || e._id === id || e.uid === id));
        const currentStatus = targetEmp?.status || "Active";
        const newStatus = currentStatus === "Suspended" ? "Active" : "Suspended";

        let success = false;
        // 1. Update in auth/users if user exists
        try {
            const res = await fetch(apiUrl(`/auth/users/${id}/status`), {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                },
            });
            if (res.ok) success = true;
        } catch (_) {}

        // 2. Update in employees collection
        try {
            const resEmp = await fetch(apiUrl(`/employees/${id}`), {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (resEmp.ok) success = true;
        } catch (_) {}

        setEmployees((prev) => prev.map((employee) => (employee.id === id || employee._id === id || employee.uid === id) ? { ...employee, status: newStatus } : employee));
        return { status: newStatus };
    };

    return { employees, loading, refetch: fetchEmployees, createEmployee, updateEmployee, deleteEmployee, toggleEmployeeStatus };
};

export default useEmployees;