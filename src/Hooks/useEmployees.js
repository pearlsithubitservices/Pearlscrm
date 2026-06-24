import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";

const useEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;
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

        fetchEmployees();
    }, [user]);

    return { employees, loading };
};

export default useEmployees;