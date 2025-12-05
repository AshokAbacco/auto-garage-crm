// sig.js
import fs from "fs";
import crypto from "crypto";

// 👇 MUST match Razorpay Dashboard secret AND your RAZORPAY_WEBHOOK_SECRET
const secret = "Abacco@123";

const body = fs.readFileSync("body.json", "utf8");

const signature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");

console.log("X-Razorpay-Signature:", signature);
