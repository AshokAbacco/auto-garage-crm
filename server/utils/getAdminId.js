// server/utils/getAdminId.js

/**
 * 🔐 Returns OWNER USER ID
 * user        → owns data
 * TEAM_MEMBER → belongs to user (parentUserId)
 */
export const getOwnerUserId = (user) => {
  if (!user) throw new Error("User missing");

  // 🔒 normalize role
  const role = String(user.role).toLowerCase();

  // OWNER
  if (role === "user") {
    return user.id;
  }

  // TEAM MEMBER  ✅ FIXED
  if (role === "team_member") {
    if (!user.parentUserId) {
      throw new Error("Team user missing parentUserId");
    }
    return user.parentUserId;
  }

  throw new Error(`Invalid user role: ${user.role}`);
};

/**
 * ❌ DEPRECATED
 */
export const getAdminId = (user) => {
  console.warn("⚠️ getAdminId is deprecated. Use getOwnerUserId instead.");
  return getOwnerUserId(user);
};
