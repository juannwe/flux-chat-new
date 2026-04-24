import { useState, useEffect, useRef } from "react";
import "./App.css";
import { db } from "./firebase";
import Login from "./Login";
import { listenAuth, logout } from "./auth";
import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";

function App() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [user, setUser] = useState(null);

  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const endRef = useRef(null);
  const [lastMessage, setLastMessage] = useState(null); //通知

  // 🔐 登入監聽
  useEffect(() => {
    const unsub = listenAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  // 🧠 建立 users（登入後自動寫入）
  useEffect(() => {
    if (!user) return;

    setDoc(doc(db, "users", user.uid), {
      name: user.email.split("@")[0],
    });
  }, [user]);

  // 👥 抓使用者列表
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const list = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    });

    return () => unsub();
  }, []);

  // 📦 聊天室列表
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "chats"),
      where("members", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));

      list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

      setChats(list);

      if (!currentChatId && list[0]) {
        setCurrentChatId(list[0].id);
      }
    });

    return () => unsub();
  }, [user]);

  // 💬 訊息監聽
  useEffect(() => {
    if (!user || !currentChatId) return;

    const unsub = onSnapshot(
      collection(db, "chats", currentChatId, "messages"),
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        data.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));

        setMessages(data);
        // 通知判斷
        const latest = data[data.length - 1];

        if (
          latest &&
          latest.userId !== user.uid &&
          latest.id !== lastMessage?.id
        ) {
          setLastMessage(latest);
        }
      }
    );

    return () => unsub();
  }, [user, currentChatId]);

  // ✉️ 傳訊息
  const sendMessage = async () => {
    if (!text.trim() || !currentChatId) return;

    await addDoc(
      collection(db, "chats", currentChatId, "messages"),
      {
        text,
        userId: user.uid,
        name: user.email.split("@")[0],
        createdAt: Date.now(),
      }
    );

    await updateDoc(doc(db, "chats", currentChatId), {
      lastMessage: text,
      updatedAt: Date.now(),
    });

    setText("");
  };

  //通知
  useEffect(() => {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        getToken(messaging, {
          vapidKey: "👉貼你剛剛拿到的VAPID key",
        }).then((currentToken) => {
          console.log("token:", currentToken);
        });
      }
    });

    onMessage(messaging, (payload) => {
      alert(`🔔 ${payload.notification.title}`);
    });
  }, []);

  // ➕ 建立私訊聊天室
  const createChat = async (otherUser) => {
    const chatRef = doc(collection(db, "chats"));

    await setDoc(chatRef, {
      name: `${user.email.split("@")[0]} & ${otherUser.name}`,
      members: [user.uid, otherUser.id], // 👈 核心
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    setCurrentChatId(chatRef.id);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) return <Login />;

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* 左側 */}
      <div
        style={{
          width: 250,
          borderRight: "1px solid #ccc",
          padding: 10,
        }}
      >
        <h3>聊天室</h3>

        {chats.map((c) => (
          <div
            key={c.id}
            onClick={() => setCurrentChatId(c.id)}
            style={{
              padding: 10,
              marginBottom: 5,
              cursor: "pointer",
              background: c.id === currentChatId ? "#eee" : "",
            }}
          >
            <div>{c.name}</div>
            <small>{c.lastMessage}</small>
          </div>
        ))}

        <hr />

        <h4>使用者</h4>

        {users
          .filter((u) => u.id !== user.uid)
          .map((u) => (
            <div key={u.id}>
              <button onClick={() => createChat(u)}>
                跟 {u.name} 聊天
              </button>
            </div>
          ))}
      </div>

      {/* 右側聊天 */}
      <div style={{ flex: 1, padding: 10 }}>
        <h2>
          聊天室
          <button onClick={logout} style={{ marginLeft: 10 }}>
            登出
          </button>
        </h2>

        <div
          style={{
            height: "70vh",
            overflowY: "auto",
            border: "1px solid #ccc",
            padding: 10,
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                textAlign:
                  msg.userId === user.uid ? "right" : "left",
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  background:
                    msg.userId === user.uid ? "#DCF8C6" : "#eee",
                  padding: 10,
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 10 }}>
                  {msg.name}
                </div>
                <div>{msg.text}</div>
              </div>
            </div>
          ))}

          <div ref={endRef}></div>
        </div>

        <div style={{ marginTop: 10 }}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ width: "80%" }}
          />
          <button onClick={sendMessage}>送出</button>
        </div>
      </div>
    </div>
  );
}

export default App;