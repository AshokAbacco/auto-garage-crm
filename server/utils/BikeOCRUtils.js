export function BikeparseOCRText(rawText, confidence = 0) {
  if (!rawText) return {};

  const lines = rawText
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  const parsed = {
    regNo: "",
    ownerName: "",
    regDate: "",
    address: "",
    maker: "",
    vehicleModel: "",
    vehicleClass: "",
    fuelType: "",
    colour: "",
    engineNumber: "",
    chassisNumber: "",
    confidence,
  };

  const clean = (v) =>
    v.replace(/^[^A-Z0-9]+/i, "").trim();

  const pick = (labels) => {
    for (const line of lines) {
      const u = line.toUpperCase();
      for (const label of labels) {
        if (u.startsWith(label)) {
          return clean(line.split(":").slice(1).join(":"));
        }
      }
    }
    return "";
  };

  /* ================= REGISTRATION NUMBER ================= */
  for (const l of lines) {
    const m = l.match(/\b[A-Z]{2}\d{2}[A-Z]{1,3}\d{3,4}\b/);
    if (m) {
      parsed.regNo = m[0];
      break;
    }
  }

  /* ================= BASIC FIELDS ================= */
  parsed.ownerName = pick([
    "OWNER NAME",
    "OWNER",
    "NAME",
    "M/S",
  ]);

  parsed.regDate = pick([
    "REG DATE",
    "REGN DATE",
    "REGISTRATION DATE",
  ]);

  parsed.maker = pick([
    "MANUFACTURER",
    "MFR",
    "MAKER",
  ]);

  parsed.vehicleModel = pick([
    "MODEL",
  ]);

  parsed.vehicleClass = pick([
    "CLASS",
    "VEHICLE CLASS",
    "BODY",
  ]);

  parsed.colour = pick([
    "COLOUR",
    "COLOR",
  ]);

  /* ================= ENGINE & CHASSIS ================= */
  parsed.engineNumber = pick([
    "ENGINE NO",
    "ENGINE NUMBER",
  ]);

  parsed.chassisNumber = pick([
    "CHASSIS NO",
    "CHASSIS NUMBER",
  ]);

  /* ================= FUEL (STRICT FILTER) ================= */
  const fuelRaw = pick(["FUEL"]);
  if (/PETROL|DIESEL|CNG|EV|ELECTRIC/i.test(fuelRaw)) {
    parsed.fuelType = fuelRaw;
  }

  /* ================= ADDRESS (MULTI-LINE SAFE) ================= */
  let addr = [];
  let capture = false;

  for (const l of lines) {
    const u = l.toUpperCase();

    if (u.startsWith("ADDRESS")) {
      capture = true;
      continue;
    }

    if (
      capture &&
      (u.startsWith("MODEL") ||
        u.startsWith("ENGINE") ||
        u.startsWith("CHASSIS") ||
        u.startsWith("BODY") ||
        u.startsWith("CLASS"))
    ) {
      break;
    }

    if (capture) addr.push(l);
  }

  parsed.address = addr.join(", ");

  return parsed;
}
