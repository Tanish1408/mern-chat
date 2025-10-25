import { useEffect, useState } from "react";
import API from "../utils/api";
import { getSocket } from "../utils/socket";

interface User { _id: string; username: string; }
interface Message { sender: string; content: string; }

export default function Chat({ recipient }: { recipient: User }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await API.get(`/messages/${recipient._id}`);
      setMessages(res.data);
    };
    fetchMessages();

    const socket = getSocket();
    socket?.on("private_message", (msg: Message) => {
      if (msg.sender === recipient._id) setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket?.off("private_message");
    };
  }, [recipient]);

  const sendMessage = async () => {
    const socket = getSocket();
    if (!text.trim()) return;

    const msg = { sender: "me", content: text };
    setMessages(prev => [...prev, msg]);
    socket?.emit("private_message", { recipient: recipient._id, content: text });
    setText("");

    await API.post("/messages", { recipient: recipient._id, content: text });
  };

  return (
    <div className="chat">
      <h3>Chat with {recipient.username}</h3>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.sender === "me" ? "msg-me" : "msg-other"}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="input-box">
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
