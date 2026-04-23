import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "chat-41b6f.firebaseapp.com",
  projectId: "chat-41b6f",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);