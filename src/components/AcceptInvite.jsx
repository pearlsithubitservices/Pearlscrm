import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
    doc,
    getDoc,
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

            await updateDoc(doc(db, "employees", id), {
                password,
                status: "Active",
                acceptedAt: serverTimestamp(),
            });



            alert("Invitation accepted successfully");

            navigate("/login");

        } catch (err) {
            console.log(err);
            alert(err.message);
        }
    };
    if (!currentEmployees) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    if (currentEmployees?.status === "Active") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center">
                    <h1 className="text-2xl font-bold text-red-600">
                        Account Already Created
                    </h1>

                    <p className="mt-3 text-gray-600">
                        This invitation has already been accepted.
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

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
                    onClick={acceptInvitation}
                    className="mt-8 w-full py-3 rounded-xl bg-green-600 text-white hover:bg-green-700"
                >
                    Accept & Create Employee Account
                </button>

            </div>

        </div>
    );
}