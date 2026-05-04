import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export default function SocketProvider({ children, garageId }) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // 🔥 Create socket connection
    const s = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // ✅ fallback for Render
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // 🔁 Helper to join garage room
    const joinGarageRoom = () => {
      if (garageId) {
        s.emit("join_garage", String(garageId)); // ✅ ensure string
        console.log("🏠 Joined garage:", garageId);
      }
    };

    // ✅ Initial connection
    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id);
      joinGarageRoom();
    });

    // 🔄 Reconnect handling (CRITICAL)
    s.on("reconnect", () => {
      console.log("🔄 Socket reconnected");
      joinGarageRoom();
    });

    // ❌ Error debugging (very useful in production)
    s.on("connect_error", (err) => {
      console.error("❌ Socket connect error:", err.message);
    });

    s.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    setSocket(s);

    // 🧹 Cleanup
    return () => {
      console.log("🧹 Disconnecting socket");
      s.disconnect();
    };
  }, [garageId]);

  // 🔥 Prevent rendering children until socket ready
  if (!socket) return null;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
}

// import { createContext, useContext, useEffect, useState } from "react";
// import { io } from "socket.io-client";

// const SocketContext = createContext(null);

// export const useSocket = () => useContext(SocketContext);
// const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

// export default function SocketProvider({ children, garageId }) {
//   const [socket, setSocket] = useState(null);

//   useEffect(() => {
//     // const s = io("http://localhost:5001", {
//     //   transports: ["websocket"],
//     // });

//     const s = io(SOCKET_URL, {
//       transports: ["websocket", "polling"],
//     });

//     s.on("connect", () => {
//       console.log("✅ Socket connected:", s.id);

//       if (garageId) {
//         s.emit("join_garage", garageId);
//         console.log("🏠 Joined garage:", garageId);
//       }
//     });

//     setSocket(s);

//     return () => s.disconnect();
//   }, [garageId]);

//   // 🔥 IMPORTANT: wait until socket ready
//   if (!socket) return null;

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// }
