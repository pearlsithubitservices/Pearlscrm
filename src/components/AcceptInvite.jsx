import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    doc,
    updateDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import {
    createUserWithEmailAndPassword,
} from "firebase/auth";

import { auth, db } from "../lib/firebase";
import useEmployees from "../Hooks/useEmployees";

export default function AcceptInvite() {
    const { id } = useParams();
    const navigate = useNavigate();


    const [loading, setLoading] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const { employees } = useEmployees();

    const currentEmployees = employees.find((item) => (
        item.id == id
    ));



    

    const acceptInvitation = async () => {
        try {
            if (password !== confirmPassword) {
                alert("Passwords do not match");
                return;
            }

            setLoading(true);

            // 1. Create Firebase Authentication user
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                currentEmployees.email,
                password
            );

            const firebaseUser = userCredential.user;

            // 2. Create Firestore user document
            await setDoc(doc(db, "users", firebaseUser.uid), {
                uid: firebaseUser.uid,
                email: currentEmployees.email,
                displayName: currentEmployees.employeeName,
                role: currentEmployees.employeeRole,
                department: currentEmployees.employeeDepartment,
                createdAt: serverTimestamp(),
            });

            // 3. Update employee document
            await updateDoc(doc(db, "employees", id), {
                uid: firebaseUser.uid,
                status: "Active",
                acceptedAt: serverTimestamp(),
            });

            // 4. Sign out the newly created employee
            // await signOut(auth);

            alert("Account created successfully!");

            navigate("/login");
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen text-2xl">
                Loading...
            </div>
        );
    }

    // if (!invite) {
    //     return (
    //         <div className="flex justify-center items-center h-screen">
    //             Invalid Invitation
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen bg-slate-100 flex justify-center items-center">

            <div className="bg-white shadow-xl rounded-2xl p-10 w-[500px]">

                <h1 className="text-3xl font-bold text-center text-blue-700 mb-8">
                    Employee Invitation
                </h1>

                <div className="space-y-4">

                    <div>
                        <b>Name:</b> {currentEmployees?.employeeName}
                    </div>

                    <div>
                        <b>Email:</b> {currentEmployees?.email}
                    </div>

                    <div>
                        <b>Contact:</b> {currentEmployees?.contact}
                    </div>

                    <div>
                        <b>Location:</b> {currentEmployees?.location}
                    </div>

                    <div>
                        <b>Join Date:</b> {currentEmployees?.joinDate}
                    </div>

                </div>
                <div className="mt-6">

                    <label>Password</label>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border rounded-lg p-3 mt-2"
                    />

                </div>

                <div className="mt-4">

                    <label>Confirm Password</label>

                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full border rounded-lg p-3 mt-2"
                    />

                </div>

                <button
                    onClick={() => {
                        console.log("Button clicked");
                        acceptInvitation();
                    }}
                    className="mt-8 w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                    Accept & Create Employee Account
                </button>

            </div>

        </div>
    );
}