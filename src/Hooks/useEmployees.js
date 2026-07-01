import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
        fetchEmployees();
    }, [user]);

    //FETCH EMPLOYEE

    const fetchEmployees = async () => {
        try {
            const snapshot = await getDocs(
                collection(db, "employees")
            );

            const employeeList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            employeeList.sort((a, b) => {
                return b.createdAt.seconds - a.createdAt.seconds;
            });

            setEmployees(employeeList);
        } catch (error) {
            console.log("Code:", error.code);
            console.log("Message:", error.message);
            console.log(error);
        } finally {
            setLoading(false);
        }
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

    return { employees, loading , deleteEmployee};
};

export default useEmployees;