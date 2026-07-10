import { createContext, useContext, useEffect, useState } from "react";
import { auth, db, googleProvider, browserLocalPersistence } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  setPersistence,
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

  function mapAuthError(error) {
    switch (error?.code) {
      case "auth/popup-blocked":
        return "Popup was blocked by the browser. We will try redirect sign-in instead.";
      case "auth/popup-closed-by-user":
        return "Google sign-in popup was closed before completing sign-in.";
      case "auth/cancelled-popup-request":
        return "Another sign-in popup is already open.";
      case "auth/unauthorized-domain":
        return "This domain is not authorized in Firebase Authentication.";
      case "auth/operation-not-allowed":
        return "Google sign-in is not enabled in Firebase Authentication.";
      case "auth/network-request-failed":
        return "Network error while contacting Google/Firebase. Check your connection and try again.";
      default:
        return error?.message || "Authentication failed.";
    }
  }

  // auth actions
  const signup = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const loginWithGoogle = async () => {
    await setPersistence(auth, browserLocalPersistence);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return { result, redirected: false };
    } catch (error) {
      if (error?.code === "auth/popup-blocked") {
        await signInWithRedirect(auth, googleProvider);
        return { result: null, redirected: true };
      }

      const mappedError = new Error(mapAuthError(error));
      mappedError.code = error?.code;
      throw mappedError;
    }
  };

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
        mapAuthError,
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
