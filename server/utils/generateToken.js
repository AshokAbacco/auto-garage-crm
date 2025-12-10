// server/utils/generateToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

/**
 * @desc Generates a signed JWT token for a given user
 * @param {Object} user - Prisma User object
 * @returns {string} JWT token
 */
export const generateToken = (user) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("❌ JWT_SECRET not set in .env file");
    }

    return jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || "user",
            plan: user.plan || "BASIC",   // ⭐ CRITICAL: Add plan to token
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d",
        }
    );
};
