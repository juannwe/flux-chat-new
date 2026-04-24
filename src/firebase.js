import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyC5G44_CXeVz0SFu2Hci8kK1DmD2zA0X4Y",
  authDomain: "chat-41b6f.firebaseapp.com",
  projectId: "chat-41b6f",
  storageBucket: "chat-41b6f.firebasestorage.app",
  messagingSenderId: "360091621713",
  appId: "1:360091621713:web:f4b9e6cfe93e0585dbdb70",
  measurementId: "G-MT4Q7CMTGZ"
};

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);