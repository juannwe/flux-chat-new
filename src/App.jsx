import { useState, useEffect, useRef } from "react";
import "./App.css";
import { db } from "./firebase";
import Login from "./Login";
import { listenAuth, logout } from "./auth";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = listenAuth((u) => setUser(u));
    return () => unsub();
  }, []);


  // 即時監聽
    useEffect(() => {
      if (!user) return;

      const unsubscribe = onSnapshot(
        collection(db, "chats", user.uid, "messages"),
        (snapshot) => {
          const data = snapshot.docs.map((doc) => doc.data());
          data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
          setMessages(data);
        }
      );

      return () => unsubscribe();
    }, [user]);

  //  傳送訊息
  const sendMessage = async () => {
    if (!text.trim()) return;

    const now = new Date();

    await addDoc(collection(db, "chats", user.uid, "messages"), {
      text,
      userId: user.uid,
      name: user?.email?.split("@")[0] || "unknown", // 👉 顯示 A001
      createdAt: Date.now(),
    });

    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // 自動滾到底
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  if (!user) return <Login />;

  return (
    <div className="app">
      <h2>System Log</h2>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.userId === user.uid ? "me" : "other"}`}
          >
            <div className="bubble">
              <div style={{ fontSize: 10, opacity: 0.6 }}>
                {msg.name}
              </div>
              <div>{msg.text}</div>
            </div>
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="input-area">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="輸入紀錄..."
        />
        <button onClick={sendMessage}>新增</button>
      </div>
    </div>
  );
}

export default App;