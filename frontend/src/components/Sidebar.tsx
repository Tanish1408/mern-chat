import { useEffect, useState } from "react";
import API from "../utils/api";
import { getSocket } from "../utils/socket";

interface User {
  _id: string;
  username: string;
  online: boolean;
}

export default function Sidebar({ selectUser }: { selectUser: (user: User) => void }) {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await API.get("/users");
      setUsers(res.data);
    };
    fetchUsers();

    const socket = getSocket();
    socket?.on("online_users", (onlineIds: string[]) => {
      setUsers(prev => prev.map(u => ({ ...u, online: onlineIds.includes(u._id) })));
    });

    return () => {
      socket?.off("online_users");
    };
  }, []);

  return (
    <div className="sidebar">
      <h3>Users</h3>
      {users.map(u => (
        <div key={u._id} onClick={() => selectUser(u)} className="user-item">
          {u.username} {u.online ? "🟢" : "⚪"}
        </div>
      ))}
    </div>
  );
}
