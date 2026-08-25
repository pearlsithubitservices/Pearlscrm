import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { apiUrl } from "../config/api";

const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        fetchEmployees();
    }, []);

    //FETCH EMPLOYEE
    const fetchEmployees = async () => {
        let apiEmployees = [];
        try {
            const res = await fetch(apiUrl("/employees"));
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    apiEmployees = data.map((emp) => ({
                        id: emp._id || emp.id || emp.uid,
                        _id: emp._id || emp.id,
                        uid: emp.uid || emp._id,
                        name: emp.employeeName || emp.name || emp.email || "Employee",
                        employeeName: emp.employeeName || emp.name || "Employee",
                        ...emp,
                    }));
                }
            }
        } catch (err) {
            console.log("MongoDB employees fetch error:", err);
        }

        let firestoreEmployees = [];
        try {
            const snapshot = await getDocs(collection(db, "employees"));
            firestoreEmployees = snapshot.docs.map((doc) => ({
                id: doc.id,
                _id: doc.id,
                uid: doc.data().uid || doc.id,
                name: doc.data().name || doc.data().employeeName || "Employee",
                employeeName: doc.data().employeeName || doc.data().name || "Employee",
                ...doc.data(),
            }));
        } catch (error) {
            console.log("Error fetching firestore employees:", error);
        }

        // Merge both arrays avoiding duplicates
        const combined = [...apiEmployees];
        firestoreEmployees.forEach((fEmp) => {
            const exists = combined.some(
                (aEmp) =>
                    String(aEmp._id || aEmp.id || aEmp.uid) === String(fEmp._id || fEmp.id || fEmp.uid) ||
                    (aEmp.email && fEmp.email && aEmp.email.toLowerCase() === fEmp.email.toLowerCase())
            );
            if (!exists) {
                combined.push(fEmp);
            }
        });

        setEmployees(combined);
        setLoading(false);
    };

    //delete single Employee

    const deleteEmployee = async (id) => {
        try {
            await deleteDoc(doc(db, "employees", id));

            setEmployees((prev) => prev.filter((emp) => emp.id !== id));

            console.log("Employee deleted successfully");
        } catch (error) {
            console.error("Error deleting employee:", error);
        }
    };

    return { employees, loading, deleteEmployee };
};

export default useEmployees;