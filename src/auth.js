import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

export const auth = getAuth();

// 👉 代號登入：A001 → A001@chat.com
export const login = (code, password) => {
  const email = code.includes("@") ? code : code + "@chat.com";
  return signInWithEmailAndPassword(auth, email, password);
};

export const logout = () => signOut(auth);

export const listenAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};