export const ownerOnly = (req, res, next) => {
  if (req.user?.type === "staff") {
    return res.status(403).json({
      message: "Access denied. Owner only.",
    });
  }

  next();
};
