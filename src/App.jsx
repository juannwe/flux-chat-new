import { useState, useEffect, useRef } from "react";
import "./App.css";
import { db } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
} from "firebase/firestore";

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const endRef = useRef(null);

  // ✅ 自動建立使用者ID（每個裝置不同）
  const [userId] = useState(() => {
    let id = localStorage.getItem("chatUser");
    if (!id) {
      id = "user_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem("chatUser", id);
    }
    return id;
  });

  // 🔥 即時監聽
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "logs"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      // 按時間排序（前端排，避免 orderBy 出錯）
      data.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(data);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 傳送訊息
  const sendMessage = async () => {
    if (!text.trim()) return;

    const now = new Date();

    await addDoc(collection(db, "logs"), {
      text,
      user: userId,
      time: now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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

  return (
    <div className="app">
      <h2>System Log</h2>

      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`message ${msg.user === userId ? "me" : "other"}`}
          >
            <div className="bubble">
              <span className="text">{msg.text}</span>
              <span className="time">{msg.time}</span>
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