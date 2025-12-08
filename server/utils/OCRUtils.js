// server/utils/OCRUtils.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

/**
 * Middleware: verifies JWT token
 * Expected header: Authorization: Bearer <token>
 */
export const ensureAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ error: "Missing Authorization header" });

        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch {
        res.status(401).json({ error: "Invalid or expired token" });
    }
};


export const parseOCRText = (text = "", confidence = 0) => {
    const cleaned = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ ]{2,}/g, " ")
        .replace(/[^a-zA-Z0-9:/.,\-\n()&]/g, " ")
        .toUpperCase();

    const result = {
        regNo: "",
        regDate: "",
        chassisNo: "",
        engineNo: "",
        maker: "",
        model: "",
        fuelType: "",
        vehicleClass: "",
        bodyType: "",
        color: "",
        seatingCapacity: "",
        mfgDate: "",
        regFcUpto: "",
        taxUpto: "",
        insuranceUpto: "",
        fitUpto: "",
        ownerName: "",
        swdOf: "",
        address: "",
        variant: "",
        cc: "",
        unladenWt: "",
        wheelBase: "",
        noOfCyl: "",
        ocrConfidence: confidence,
        extractedDate: new Date().toISOString(),
    };

    const extract = (pattern) => {
        const match = cleaned.match(pattern);
        return match ? match[1].trim() : "";
    };

    // 🔹 Registration Details
    result.regNo =
        extract(/REG(?:N|ISTRATION)?\s*(?:NO|NUMBER)?[:\s-]*([A-Z0-9\-]+)/) ||
        extract(/VEHICLE\s*NO[:\s-]*([A-Z0-9\-]+)/);
    result.regDate = extract(
        /REG(?:ISTRATION)?\s*DATE[:\s-]*([\d]{1,2}[-/][A-Z0-9]{2,}[-/][\d]{2,4})/
    );

    // 🔹 Vehicle Identifiers
    result.chassisNo =
        extract(/CHASSIS(?:\.?NO)?[:\s-]*([A-Z0-9]+)/) ||
        extract(/CHASIS[:\s-]*([A-Z0-9]+)/);
    result.engineNo = extract(/ENGINE(?:\.?NO)?[:\s-]*([A-Z0-9]+)/);
    result.maker =
        extract(/MAKER[:\s-]*([A-Z0-9 ]+)/) ||
        extract(/MANUFACTURER[:\s-]*([A-Z0-9 ]+)/);
    result.model = extract(/MODEL[:\s-]*([A-Z0-9 \-]+)/);
    result.variant = extract(/VARIANT[:\s-]*([A-Z0-9 \-]+)/);
    result.vehicleClass = extract(/CLASS[:\s-]*([A-Z0-9 ]+)/);
    result.bodyType = extract(/BODY[:\s-]*([A-Z ]+)/);
    result.color =
        extract(/COLOUR[:\s-]*([A-Z ]+)/) || extract(/COLOR[:\s-]*([A-Z ]+)/);

    // 🔹 Technical Specs
    result.fuelType = extract(/FUEL[:\s-]*([A-Z\/]+)/);
    result.cc = extract(/CC[:\s-]*([0-9]+)/);
    result.mfgDate = extract(/MFG\.?\s*DATE[:\s-]*([0-9\-\/]+)/);
    result.noOfCyl = extract(/NO\.?\s*OF\s*CYL[:\s-]*([0-9]+)/);
    result.unladenWt = extract(/UNLADEN\s*WT[:\s-]*([0-9]+)/);
    result.seatingCapacity =
        extract(/SEATING[:\s-]*([0-9]+)/) || extract(/CAPACITY[:\s-]*([0-9]+)/);
    result.wheelBase = extract(/WHEEL\s*BASE[:\s-]*([0-9]+)/);

    // 🔹 Validities
    result.fitUpto = extract(/FIT\s*UPTO[:\s-]*([0-9\-\/]+)/);
    result.regFcUpto =
        extract(/REG\/?FC\s*(?:VALID\s*)?UPTO[:\s-]*([0-9\-\/]+)/) ||
        extract(/FC\s*UPTO[:\s-]*([0-9\-\/]+)/);
    result.taxUpto = extract(/TAX\s*(?:VALID\s*)?UPTO[:\s-]*([0-9\-\/]+)/);
    result.insuranceUpto = extract(/INSURANCE\s*UPTO[:\s-]*([0-9\-\/]+)/);

    // 🔹 Ownership
    result.ownerName =
        extract(/OWNER\s*NAME[:\s-]*([A-Z0-9\/&., ]+)/) ||
        extract(/NAME\s*OF\s*OWNER[:\s-]*([A-Z ]+)/);
    result.swdOf = extract(/S\/W\/D\s*OF[:\s-]*([A-Z0-9 ]+)/);

    // 🔹 Address (multiline safe)
    const addressMatch = cleaned.match(
        /ADDRESS[:\s-]*([\s\S]*?)(?:MFR|MAKER|MODEL|BODY|CLASS|WHEEL|FUEL|CHASSIS|ENGINE|FIT|TAX|$)/
    );
    if (addressMatch) {
        result.address = addressMatch[1].replace(/\n/g, " ").trim();
    }

    // 🔹 Normalize fields
    for (const key in result) {
        if (typeof result[key] === "string") {
            result[key] = result[key].replace(/\s{2,}/g, " ").trim();
        }
    }

    // 🔹 Fallbacks
    if (!result.ownerName) {
        const ownerGuess = cleaned.match(/NAME[:\s-]*([A-Z ]{3,40})/);
        if (ownerGuess) result.ownerName = ownerGuess[1].trim();
    }

    if (result.regNo && !result.regNo.includes("-")) {
        const rc = result.regNo.match(
            /^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{3,4})$/
        );
        if (rc) result.regNo = `${rc[1]}-${rc[2]}-${rc[3]}-${rc[4]}`;
    }

    return result;
};
