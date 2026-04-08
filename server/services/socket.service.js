//socket.service.js
let io = null;

export const initSocket = (serverIo) => {
  io = serverIo;

  io.on("connection", (socket) => {
    console.log("🔥 SOCKET CONNECTED:", socket.id);
  });
};

export const notifyGarage = async (garageId, booking) => {
  if (!io) return;

  console.log("🚀 notifyGarage called:", garageId, booking);

  // ⏳ IMPORTANT: small delay ensures room join completed
  setTimeout(() => {
    io.to(`garage_${garageId}`).emit("new_booking", {
      id: booking.id,
      serviceId: booking.serviceId,
      carType: booking.carType,
      finalPrice: booking.finalPrice,
    });
  }, 300); // 🔥 KEY FIX
};
