// // server/middleware/authMiddleware.js
// import jwt from "jsonwebtoken";
// import dotenv from "dotenv";
// import prisma from "../models/prismaClient.js"; // ✅ use Prisma to verify the user still exists

// dotenv.config();

// export const protect = async (req, res, next) => {
//     try {
//         const authHeader = req.headers.authorization;

//         if (!authHeader || !authHeader.startsWith("Bearer ")) {
//             return res.status(401).json({ message: "No token provided" });
//         }

//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);

//         // ✅ Verify user still exists in DB (extra security)
//         const user = await prisma.user.findUnique({
//             where: { id: decoded.id },
//             select: { id: true, username: true, email: true, role: true, plan: true },
//         });

//         if (!user) {
//             return res.status(401).json({ message: "User not found or deleted" });
//         }

//         req.user = user; // attach user object to request
//         next();
//     } catch (error) {
//         console.error("❌ Auth Middleware Error:", error);
//         res.status(401).json({ message: "Invalid or expired token" });
//     }
// };


import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import prisma from "../models/prismaClient.js";

dotenv.config();

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // ✅ 1. Explicit header validation
        if (!authHeader) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Authorization header must start with Bearer" });
        }

        const token = authHeader.split(" ")[1];

        // ✅ 2. Catch empty / invalid token early (prevents jwt malformed)
        if (!token || token === "null" || token === "undefined") {
            return res.status(401).json({ message: "Token missing or invalid" });
        }

        // ✅ 3. Verify JWT secret exists (VERY important)
        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET is not defined");
            return res.status(500).json({ message: "Server configuration error" });
        }

        // ✅ 4. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ 5. Verify user still exists
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                plan: true,
            },
        });

        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        // ✅ 6. Attach user to request
        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Auth Middleware Error:", error.message);

        // ✅ Cleaner JWT-specific errors
        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Invalid token" });
        }

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Token expired" });
        }

        res.status(401).json({ message: "Not authorized" });
    }
};
