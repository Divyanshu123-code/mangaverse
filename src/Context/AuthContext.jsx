import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

const AuthContext = createContext();
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // auth actions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

  const logout = () => signOut(auth);

  const resetPassword = (email) =>
    sendPasswordResetEmail(auth, email);

  // auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // 🔑 NEVER BLOCK UI

      // Firestore init runs in background
      if (currentUser) {
        (async () => {
          const ref = doc(db, "users", currentUser.uid);
          const snap = await getDoc(ref);
          if (!snap.exists()) {
            await setDoc(ref, {
              email: currentUser.email,
              createdAt: serverTimestamp(),
            });
          }
        })();
      }
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        DEV_MODE,
        signup,
        login,
        loginWithGoogle,
        logout,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}