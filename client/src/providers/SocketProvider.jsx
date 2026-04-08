import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export default function SocketProvider({ children, garageId }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const s = io("http://localhost:5001", {
      transports: ["websocket"],
    });

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);

      if (garageId) {
        s.emit("join_garage", garageId);
        console.log("🏠 Joined garage:", garageId);
      }
    });

    setSocket(s);

    return () => s.disconnect();
  }, [garageId]);

  // 🔥 IMPORTANT: wait until socket ready
  if (!socket) return null;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}
