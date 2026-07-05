import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);


  useEffect(() => {

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log(currentUser);
      if (!currentUser) {
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);
      const snap = await getDoc(doc(db, "employees", currentUser.uid));

      if (snap.exists()) {
        setUserData(snap.data());
      }


      setLoading(false);

    });

    return () => unsubscribe();

  }, []);

  const logout = async () => {

    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }

  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        logout,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};