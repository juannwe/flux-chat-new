importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyC5G44_CXeVz0SFu2Hci8kK1DmD2zA0X4Y",
  authDomain: "chat-41b6f.firebaseapp.com",
  projectId: "chat-41b6f",
  storageBucket: "chat-41b6f.firebasestorage.app",
  messagingSenderId: "360091621713",
  appId: "1:360091621713:web:f4b9e6cfe93e0585dbdb70",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});

