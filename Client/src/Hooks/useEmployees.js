import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useAuth } from "../context/AuthContext";
import { staticEmployees } from "../Utils/staticData.js";

const useEmployees = () => {
    const [employees, setEmployees] = useState(staticEmployees);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const snapshot = await getDocs(
                    collection(db, "employees")
                );

                const employeeList = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                if (employeeList.length > 0) {
                    setEmployees(employeeList);
                } else {
                    setEmployees(staticEmployees);
                }
            } catch (error) {
                console.log("Error fetching employees:", error);
                setEmployees(staticEmployees);
            } finally {
                setLoading(false);
            }
        };

        fetchEmployees();
    }, [user]);

    return { employees, loading };
};

export default useEmployees;