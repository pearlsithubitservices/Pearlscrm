import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
} from "firebase/firestore";

import { auth, db } from "../lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRole = async (currentUser) => {
    if (!currentUser) {
      setRole(null);
      return null;
    }
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        const fetchedRole = userDoc.data().role || "Admin";
        setRole(fetchedRole);
        return fetchedRole;
      }
      const empDoc = await getDoc(doc(db, "employees", currentUser.uid));
      if (empDoc.exists()) {
        const fetchedRole = empDoc.data().role || "Employee";
        setRole(fetchedRole);
        return fetchedRole;
      }
      // Default to Admin if not explicitly defined
      setRole("Admin");
      return "Admin";
    } catch (error) {
      console.error("Auth role fetch error:", error);
      setRole("Admin");
      return "Admin";
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchUserRole(currentUser);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setRole(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const isAdmin = typeof role === "string" && role.trim().toLowerCase() === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        loading,
        logout,
        fetchUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};