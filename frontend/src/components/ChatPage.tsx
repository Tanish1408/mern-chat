import { useState } from "react";
import Sidebar from "./Sidebar";
import Chat from "./Chat";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);

  return (
    <div className="chat-page">
      <Sidebar selectUser={setSelectedUser} />
      {selectedUser ? <Chat recipient={selectedUser} /> : <div className="chat-placeholder">Select a user to chat</div>}
    </div>
  );
}
