// server/utils/getAdminId.js

export const getOwnerUserId = (user) => {
  if (!user) throw new Error("User missing");

  /**
   * ============================
   * BIKE TEAM LOGIN
   * ============================
   */
  if (user.type === "bike_team") {
    if (!user.ownerId) {
      throw new Error("Bike team token missing ownerId");
    }
    return user.ownerId;
  }

  /**
   * ============================
   * OWNER LOGIN
   * ============================
   * Works even if type is missing
   */
  const role = String(user.role || "").toLowerCase();

  if (role === "user") {
    return user.id;
  }

  throw new Error("Invalid user type or role");
};

export const getAdminId = (user) => {
  console.warn("⚠️ getAdminId is deprecated. Use getOwnerUserId instead.");
  return getOwnerUserId(user);
};
