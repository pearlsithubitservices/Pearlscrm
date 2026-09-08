import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../lib/firebase";
import useEmployees from "../Hooks/useEmployees";
import { apiUrl } from "../config/api";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function AcceptInvite() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fetchingEmployee, setFetchingEmployee] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const { employees, loading: hookLoading } = useEmployees();

    useEffect(() => {
        let isMounted = true;

        const loadEmployee = async () => {
            if (!id) {
                setFetchingEmployee(false);
                return;
            }

            // 1. Try finding in useEmployees list
            const foundInList = (employees || []).find((item) => (
                String(item.id) === String(id) ||
                String(item._id) === String(id) ||
                String(item.uid) === String(id) ||
                String(item.email || "").toLowerCase() === String(id).toLowerCase()
            ));

            if (foundInList) {
                if (isMounted) {
                    setEmployee(foundInList);
                    setFetchingEmployee(false);
                }
                return;
            }

            // 2. Try fetching from MongoDB /employees/:id
            try {
                const res = await fetch(apiUrl(`/employees/${id}`));
                if (res.ok) {
                    const data = await res.json();
                    const empData = data?.data || data;
                    if (empData && (empData.email || empData.employeeName || empData.name)) {
                        if (isMounted) {
                            setEmployee(empData);
                            setFetchingEmployee(false);
                        }
                        return;
                    }
                }
            } catch (err) {
                console.warn("MongoDB fetch employee by ID failed:", err);
            }

            // 3. Fallback: try fetching from Firebase Firestore
            try {
                if (db) {
                    const docSnap = await getDoc(doc(db, "employees", id));
                    if (docSnap.exists()) {
                        if (isMounted) {
                            setEmployee({ id: docSnap.id, ...docSnap.data() });
                            setFetchingEmployee(false);
                        }
                        return;
                    }
                }
            } catch (fbErr) {
                console.warn("Firestore fetch employee by ID failed:", fbErr);
            }

            // If still in initial hook loading, wait
            if (hookLoading) {
                return;
            }

            if (isMounted) {
                setFetchingEmployee(false);
            }
        };

        loadEmployee();

        return () => {
            isMounted = false;
        };
    }, [id, employees, hookLoading]);

    const acceptInvitation = async (e) => {
        if (e) e.preventDefault();
        setErrorMsg("");

        if (!password || password.length < 6) {
            setErrorMsg("Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match.");
            return;
        }

        if (!employee || !employee.email) {
            setErrorMsg("Employee record not found. Please contact your administrator.");
            return;
        }

        const employeeName = employee.employeeName || employee.name || "Employee";
        const employeeEmail = (employee.email || "").trim().toLowerCase();
        const employeeRole = employee.employeeRole || employee.role || "Employee";
        const employeeDept = employee.department || employee.employeeDepartment || "Engineering";

        try {
            setLoading(true);

            // 1. Register user in MongoDB User database via /auth/register
            try {
                const registerRes = await fetch(apiUrl("/auth/register"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        name: employeeName,
                        email: employeeEmail,
                        password: password,
                        role: employeeRole === "Admin" ? "Admin" : "Employee",
                        department: employeeDept,
                        industry: "IT",
                    }),
                });

                const regData = await registerRes.json();
                if (!registerRes.ok && !regData?.message?.toLowerCase()?.includes("already registered")) {
                    throw new Error(regData.message || "Failed to register employee account");
                }
            } catch (regErr) {
                // If already registered, allow proceed
                if (!regErr.message?.toLowerCase()?.includes("already registered")) {
                    throw regErr;
                }
            }

            // 2. Create Firebase Auth user & Firestore doc (if Firebase configured)
            try {
                if (auth && db) {
                    const userCredential = await createUserWithEmailAndPassword(
                        auth,
                        employeeEmail,
                        password
                    );
                    const firebaseUser = userCredential.user;

                    await setDoc(doc(db, "users", firebaseUser.uid), {
                        uid: firebaseUser.uid,
                        email: employeeEmail,
                        displayName: employeeName,
                        role: employeeRole,
                        department: employeeDept,
                        createdAt: serverTimestamp(),
                    });

                    // Update employee document in Firestore if doc exists
                    try {
                        await updateDoc(doc(db, "employees", id), {
                            uid: firebaseUser.uid,
                            status: "Active",
                            acceptedAt: serverTimestamp(),
                        });
                    } catch (_) {}
                }
            } catch (fbErr) {
                console.warn("Optional Firebase auth registration note:", fbErr.message);
            }

            // 3. Update employee status to 'Active' in MongoDB
            try {
                await fetch(apiUrl(`/employees/${id}`), {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "Active" }),
                });
            } catch (mongoUpdateErr) {
                console.warn("MongoDB employee status update note:", mongoUpdateErr);
            }

            setSuccessMsg("Account created successfully! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (error) {
            console.error("Accept invitation error:", error);
            setErrorMsg(error.message || "Failed to accept invitation");
        } finally {
            setLoading(false);
        }
    };

    if (fetchingEmployee) {
        return (
            <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-600 font-medium">Verifying invitation link...</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
                <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Invitation Not Found</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        This invitation link is invalid or may have expired. Please request a new invitation from your administrator.
                    </p>
                    <Link
                        to="/login"
                        className="inline-block px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    const employeeName = employee.employeeName || employee.name || "Employee";
    const employeeEmail = employee.email || "";
    const employeeContact = employee.contact || employee.phone || "Not specified";
    const employeeRole = employee.employeeRole || employee.role || "Employee";
    const employeeDept = employee.department || employee.employeeDepartment || "Engineering";

    return (
        <div className="min-h-screen bg-[#efede8] flex justify-center items-center p-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg w-full border border-gray-200">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold text-[#0b2b57]">
                        Join Pearls CRM
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Complete your employee account setup
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                        {errorMsg}
                    </div>
                )}

                {successMsg && (
                    <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                        {successMsg}
                    </div>
                )}

                <div className="bg-blue-50/60 rounded-xl p-4 mb-6 border border-blue-100 text-sm space-y-2">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-semibold text-gray-800">{employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-semibold text-gray-800">{employeeEmail}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Department:</span>
                        <span className="font-semibold text-gray-800">{employeeDept}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Role:</span>
                        <span className="font-semibold text-gray-800">{employeeRole}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Contact:</span>
                        <span className="font-semibold text-gray-800">{employeeContact}</span>
                    </div>
                </div>

                <form onSubmit={acceptInvitation} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Set Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter your password"
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 py-3 px-4 rounded-xl bg-blue-700 text-white font-medium hover:bg-blue-800 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Setting up your account...
                            </>
                        ) : (
                            "Accept & Create Employee Account"
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-600 font-medium hover:underline">
                        Sign in here
                    </Link>
                </div>
            </div>
        </div>
    );
}