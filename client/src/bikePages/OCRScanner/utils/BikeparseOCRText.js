/**
 * Enhanced RC Smart Parser (v4)
 * Handles fuzzy matches, fallbacks & adaptive field recovery.
 */
export const parseOCRText = (text = "", confidence = 0) => {
    const cleaned = (text || "")
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
        variant: "",
        vehicleClass: "",
        bodyType: "",
        color: "",
        fuelType: "",
        wheelBase: "",
        mfgDate: "",
        seatingCapacity: "",
        noOfCyl: "",
        unladenWt: "",
        cc: "",
        regFcUpto: "",
        fitUpto: "",
        insuranceUpto: "",
        taxUpto: "",
        ownerName: "",
        swdOf: "",
        address: "",
        ocrConfidence: confidence,
        extractedDate: new Date().toISOString(),
    };

    const extract = (pattern) => {
        const match = cleaned.match(pattern);
        return match ? match[1].trim() : "";
    };

    /* ────────── Primary Structured Extraction ────────── */
    result.regNo =
        extract(/REG[\s.:/-]*NO[\s.:/-]*([A-Z0-9-]+)/) ||
        extract(/VEHICLE[\s.:/-]*NO[\s.:/-]*([A-Z0-9-]+)/);
    result.regDate = extract(/REG[\s.:/-]*DATE[\s.:/-]*([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{2,4})/);
    result.chassisNo = extract(/CHASSIS[\s.:/-]*NO[\s.:/-]*([A-Z0-9]+)/);
    result.engineNo = extract(/ENGINE[\s.:/-]*NO[\s.:/-]*([A-Z0-9]+)/);
    result.maker =
        extract(/MAKER[\s.:/-]*([A-Z0-9 ]+)/) ||
        extract(/MANUFACTURER[\s.:/-]*([A-Z0-9 ]+)/) ||
        extract(/MFR[\s.:/-]*([A-Z0-9 ]+)/);
    result.model = extract(/MODEL[\s.:/-]*([A-Z0-9 \-]+)/);
    result.variant = extract(/VARIANT[\s.:/-]*([A-Z0-9 \-]+)/);

    result.vehicleClass = extract(/CLASS[\s.:/-]*([A-Z ]+)/);
    result.bodyType = extract(/BODY[\s.:/-]*([A-Z ()]+)/);
    result.color = extract(/COLOU?R[\s.:/-]*([A-Z ]+)/);
    result.fuelType = extract(/FUEL[\s.:/-]*([A-Z/]+)/);
    result.wheelBase = extract(/WHEEL[\s.:/-]*BASE[\s.:/-]*([0-9]+)/);
    result.mfgDate = extract(/MFG[\s.:/-]*DATE[\s.:/-]*([0-9\-\/]+)/);

    result.noOfCyl = extract(/NO[\s.:/]*OF[\s.:/]*CYL[\s.:/-]*([0-9]+)/);
    result.unladenWt = extract(/UNLADEN[\s.:/-]*WT[\s.:/-]*([0-9]+)/);
    result.cc = extract(/CC[\s.:/-]*([0-9]+)/);

    result.regFcUpto = extract(/REG[\s.:/]*FC[\s.:/]*UPTO[\s.:/-]*([0-9-\/]+)/);
    result.fitUpto = extract(/FIT[\s.:/-]*UPTO[\s.:/-]*([0-9-\/]+)/);
    result.insuranceUpto = extract(/INSURANCE[\s.:/-]*UPTO[\s.:/-]*([0-9-\/]+)/);
    result.taxUpto = extract(/TAX[\s.:/-]*UPTO[\s.:/-]*([0-9-\/]+)/);

    result.ownerName = extract(/OWNER[\s.:/-]*NAME[\s.:/-]*([A-Z0-9/&.,() ]+)/);
    result.swdOf =
        extract(/S[\s./]*W[\s./]*D[\s.:/-]*OF[\s.:/-]*([A-Z0-9 ]+)/) ||
        extract(/SMD[\s.:/-]*OF[\s.:/-]*([A-Z0-9 ]+)/);

    /* ────────── Address Extraction ────────── */
    const addressMatch = cleaned.match(
        /ADDRESS[\s.:/-]*([\s\S]*?)(?:MFR|MAKER|MODEL|BODY|CLASS|WHEEL|FUEL|CHASSIS|ENGINE|FIT|TAX|$)/
    );
    if (addressMatch) result.address = addressMatch[1].replace(/\n/g, " ").trim();

    /* ────────── Fuzzy & Derived Recovery ────────── */
    if (!result.variant && result.model) {
        const variantMatch = result.model.match(
            /\b(LXI|VXI|ZXI|ZDI|LDI|VDI|ZETA|DELTA|ALPHA|SIGMA|SPORT|TOP)\b/i
        );
        if (variantMatch) result.variant = variantMatch[1].toUpperCase();
    }

    // Backfill missing validity fields
    if (result.regFcUpto) {
        if (!result.fitUpto) result.fitUpto = result.regFcUpto;
        if (!result.taxUpto) result.taxUpto = result.regFcUpto;
        if (!result.insuranceUpto) result.insuranceUpto = result.regFcUpto;
    }

    // Fuzzy seat detection with contextual fallback
    if (!result.seatingCapacity) {
        const seatMatch = cleaned.match(/SEAT[A-Z ()\]\[]*[:\s-]*([0-9]+)/);
        if (seatMatch) {
            result.seatingCapacity = seatMatch[1];
        } else if (cleaned.includes("SEAT") || cleaned.includes("SEATING")) {
            if (cleaned.includes("MOTOR CAR") || cleaned.includes("CAR"))
                result.seatingCapacity = "5";
            else if (cleaned.includes("MOTORCYCLE") || cleaned.includes("SCOOTER"))
                result.seatingCapacity = "2";
        }
    }

    /* ────────── Adaptive Key-Value Recovery ────────── */
    const genericPattern = /([A-Z./() ]{3,25})[:\s-]+([A-Z0-9/.,() &-]{2,})/g;
    let m;
    while ((m = genericPattern.exec(cleaned)) !== null) {
        const key = m[1].trim();
        const value = m[2].trim();
        if (key.includes("MFR") && !result.maker) result.maker = value;
        if (key.includes("VARIANT") && !result.variant) result.variant = value;
        if (key.includes("TAX") && !result.taxUpto) result.taxUpto = value;
        if (key.includes("INSUR") && !result.insuranceUpto) result.insuranceUpto = value;
        if (key.includes("FIT") && !result.fitUpto) result.fitUpto = value;
        if (key.includes("SEAT") && !result.seatingCapacity) result.seatingCapacity = value;
        if (key.includes("SMD") && !result.swdOf) result.swdOf = value;
    }

    // Normalize strings
    for (const key in result) {
        if (typeof result[key] === "string")
            result[key] = result[key].replace(/\s{2,}/g, " ").trim();
    }

    if (result.regNo && !result.regNo.includes("-")) {
        const rc = result.regNo.match(/^([A-Z]{2})(\d{1,2})([A-Z]{1,3})(\d{3,4})$/);
        if (rc) result.regNo = `${rc[1]}-${rc[2]}-${rc[3]}-${rc[4]}`;
    }

    return result;
};
