// socket.service.js

let io = null;

// Helper: normalize a phone number into a stable room name.
// Strips spaces/dashes so "+91 98765 43210" and "919876543210" map to the same room.
const clientRoom = (phone) => `client_${String(phone).replace(/[\s-]/g, "")}`;

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
    // 🆕 JOIN CLIENT ROOM (Motor Konnect customer)
    // Customer app calls socket.emit("join_client", phone) once connected
    // and logged in, so status updates can be pushed straight to them.
    // ==============================
    socket.on("join_client", (phone) => {
      if (!phone) {
        console.warn("⚠️ join_client called without a phone number");
        return;
      }

      const room = clientRoom(phone);
      socket.join(room);

      console.log("📱 Client joined:", {
        socketId: socket.id,
        phone,
        room,
      });

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
      serviceName: booking.serviceName, // 🆕 for the popup UI
      carType: booking.carType,
      finalPrice: booking.finalPrice,
    });

    console.log("✅ new_booking emitted to room:", room);
  } catch (err) {
    console.error("❌ SOCKET EMIT ERROR:", err.message);
  }
};

// ==============================
// 🆕 EMIT BOOKING STATUS UPDATE TO CUSTOMER (Motor Konnect)
// Call this any time a booking's status changes on the CRM side
// (accepted, rejected, in progress, completed, cancelled, etc).
// ==============================
export const notifyClient = async (phone, booking) => {
  if (!io) {
    console.error("❌ IO NOT INITIALIZED");
    return;
  }

  if (!phone) {
    console.warn("⚠️ notifyClient called without a phone number");
    return;
  }

  const room = clientRoom(phone);

  console.log("🚀 notifyClient called");
  console.log("📡 Target phone:", phone);
  console.log("📡 Target room:", room);
  console.log("📦 Booking payload:", booking);

  try {
    const clients = await io.in(room).fetchSockets();
    console.log("👥 Connected clients in room:", room, clients.length);

    if (clients.length === 0) {
      console.warn(
        "⚠️ No connected client sockets in room (customer may be offline — that's fine, they'll see the update next time they open the app):",
        room,
      );
    }

    io.to(room).emit("booking_status_updated", {
      id: booking.id,
      status: booking.status,
      serviceName: booking.serviceName,
      scheduledAt: booking.scheduledAt,
      finalPrice: booking.finalPrice,
      garageName: booking.garage?.companyName || booking.garageName || null,
    });

    console.log("✅ booking_status_updated emitted to room:", room);
  } catch (err) {
    console.error("❌ SOCKET EMIT ERROR:", err.message);
  }
};
