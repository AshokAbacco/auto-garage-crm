// socket.service.js

let io = null;

export const initSocket = (serverIo) => {
  io = serverIo;

  io.on("connection", (socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);

    // ==============================
    // JOIN GARAGE ROOM
    // ==============================
    socket.on("join_garage", (garageId) => {
      const room = String(garageId);

      socket.join(room);

      console.log("🏠 Garage joined:", {
        socketId: socket.id,
        garageId: room,
      });

      // 🔍 DEBUG: list rooms for this socket
      console.log("📦 Socket rooms:", Array.from(socket.rooms));
    });

    // ==============================
    // DISCONNECT DEBUG
    // ==============================
    socket.on("disconnect", (reason) => {
      console.log("⚠️ SOCKET DISCONNECTED:", socket.id, reason);
    });

    // ==============================
    // ERROR DEBUG
    // ==============================
    socket.on("error", (err) => {
      console.error("❌ SOCKET ERROR:", err);
    });
  });
};

// ==============================
// EMIT BOOKING TO GARAGE
// ==============================
export const notifyGarage = async (garageId, booking) => {
  if (!io) {
    console.error("❌ IO NOT INITIALIZED");
    return;
  }

  const room = String(garageId);

  console.log("🚀 notifyGarage called");
  console.log("📡 Target garageId:", garageId);
  console.log("📡 Target room:", room);
  console.log("📦 Booking payload:", booking);

  try {
    // 🔍 DEBUG: check sockets in room
    const clients = await io.in(room).fetchSockets();

    console.log("👥 Connected clients in room:", room, clients.length);

    if (clients.length === 0) {
      console.warn("⚠️ No clients in room:", room);
    }

    // ==============================
    // EMIT EVENT
    // ==============================
    io.to(room).emit("new_booking", {
      id: booking.id,
      serviceId: booking.serviceId,
      carType: booking.carType,
      finalPrice: booking.finalPrice,
    });

    console.log("✅ new_booking emitted to room:", room);
  } catch (err) {
    console.error("❌ SOCKET EMIT ERROR:", err.message);
  }
};

// //socket.service.js
// let io = null;

// export const initSocket = (serverIo) => {
//   io = serverIo;

//   io.on("connection", (socket) => {
//     console.log("🔥 SOCKET CONNECTED:", socket.id);
//   });
// };

// export const notifyGarage = async (garageId, booking) => {
//   if (!io) return;

//   console.log("🚀 notifyGarage called:", garageId, booking);

//   // ⏳ IMPORTANT: small delay ensures room join completed
//   setTimeout(() => {
//     io.to(`garage_${garageId}`).emit("new_booking", {
//       id: booking.id,
//       serviceId: booking.serviceId,
//       carType: booking.carType,
//       finalPrice: booking.finalPrice,
//     });
//   }, 300); // 🔥 KEY FIX
// };
