export const validateBooking = (req, res, next) => {
  const { serviceId, garageId, scheduledAt, appUserId } = req.body;

  if (!serviceId || !garageId || !scheduledAt || !appUserId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  next();
};
