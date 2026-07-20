import { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("time", "asc")
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setMessages(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
      );
    });

    return () => unsub();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;

    await addDoc(collection(db, "messages"), {
      text: message,
      username: auth.currentUser?.displayName || auth.currentUser?.email || "Guest",
      time: serverTimestamp()
    });

    setMessage("");
  };

  return (
    <div style={{maxWidth:"500px", margin:"auto"}}>

      <h2>💬 Nexora Chat</h2>

      <div>
        {messages.map((msg) => {
          const mine =
            msg.username === auth.currentUser?.email;

          return (
            <div
              key={msg.id}
              style={{
                textAlign: mine ? "right" : "left",
                margin: "10px"
              }}
            >
              <b>
                👤 {msg.username || "User"}
              </b>

              <p>
                {msg.text}
              </p>
            </div>
          );
        })}
      </div>

      <input
        value={message}
        onChange={(e)=>setMessage(e.target.value)}
        placeholder="Write message..."
      />

      <button onClick={sendMessage}>
        Send 💬
      </button>

    </div>
  );
}

export default Chat;
