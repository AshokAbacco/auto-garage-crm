import prisma from "../models/prismaClient.js";

/* ===========================
   IMAGE SIZE LIMIT (5MB)
=========================== */
const MAX_BASE64_SIZE = 5 * 1024 * 1024;

function isBase64TooLarge(base64) {
  if (!base64) return false;
  const sizeInBytes = Math.ceil((base64.length * 3) / 4);
  return sizeInBytes > MAX_BASE64_SIZE;
}

/* ===========================
   CREATE BIKE
   POST /api/bikes
=========================== */
export const createBike = async (req, res) => {
  try {
    const data = req.body;

    // ✅ REQUIRED FIELD VALIDATION
    if (
      !data.fullName ||
      !data.phone ||
      !data.vehicleMake ||
      !data.vehicleModel ||
      !data.regNumber
    ) {
      return res.status(400).json({
        message:
          "Full Name, Phone, Vehicle Make, Vehicle Model, and Reg Number are required",
      });
    }

    // ✅ DUPLICATE REG NUMBER CHECK
    const existingReg = await prisma.bike.findFirst({
      where: { regNumber: data.regNumber },
    });

    if (existingReg) {
      return res.status(400).json({
        message: "This vehicle is already registered",
      });
    }

    // ✅ DUPLICATE VIN CHECK
    if (data.vin) {
      const existingVin = await prisma.bike.findFirst({
        where: { vin: data.vin },
      });

      if (existingVin) {
        return res.status(400).json({
          message: "This VIN is already registered",
        });
      }
    }

    // ✅ IMAGE SIZE PROTECTION
    if (
      isBase64TooLarge(data.carImage) ||
      isBase64TooLarge(data.adImage) ||
      (Array.isArray(data.damageImages) &&
        data.damageImages.some((img) => isBase64TooLarge(img)))
    ) {
      return res.status(400).json({
        message: "One or more images exceed the 5MB size limit",
      });
    }

    const bike = await prisma.bike.create({
      data: {
        ownerName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        receiverName: data.receiverName || null,

        bikeBrand: data.vehicleMake,
        bikeModel: data.vehicleModel,
        bikeYear: data.vehicleYear ? Number(data.vehicleYear) : null,

        regNumber: data.regNumber,
        vin: data.vin || null,

        color: data.color || null,
        fuel: data.fuel || null,
        notes: data.notes || null,

        bikeImage: data.carImage || null,
        adImage: data.adImage || null,
        damageImages: data.damageImages || [],

        userId: req.user?.id || null,
      },
    });

    res.status(201).json(bike);
  } catch (err) {
    console.error("createBike error:", err);
    res.status(500).json({ message: "Bike creation failed" });
  }
};

/* ===========================
   UPDATE BIKE
   PUT /api/bikes/:id
=========================== */
export const updateBike = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    // ✅ PREVENT DUPLICATE REG ON UPDATE
    const existingReg = await prisma.bike.findFirst({
      where: {
        regNumber: data.regNumber,
        NOT: { id },
      },
    });

    if (existingReg) {
      return res.status(400).json({
        message: "Another vehicle already uses this registration number",
      });
    }

    // ✅ IMAGE SIZE PROTECTION
    if (
      isBase64TooLarge(data.carImage) ||
      isBase64TooLarge(data.adImage) ||
      (Array.isArray(data.damageImages) &&
        data.damageImages.some((img) => isBase64TooLarge(img)))
    ) {
      return res.status(400).json({
        message: "One or more images exceed the 5MB size limit",
      });
    }

    const bike = await prisma.bike.update({
      where: { id },
      data: {
        ownerName: data.fullName,
        phone: data.phone,
        email: data.email || null,
        address: data.address || null,
        receiverName: data.receiverName || null,

        bikeBrand: data.vehicleMake,
        bikeModel: data.vehicleModel,
        bikeYear: data.vehicleYear ? Number(data.vehicleYear) : null,

        regNumber: data.regNumber,
        vin: data.vin || null,

        color: data.color || null,
        fuel: data.fuel || null,
        notes: data.notes || null,

        bikeImage: data.carImage || null,
        adImage: data.adImage || null,
        damageImages: data.damageImages || [],
      },
    });

    res.json(bike);
  } catch (err) {
    console.error("updateBike error:", err);
    res.status(500).json({ message: "Bike update failed" });
  }
};

/* ===========================
   GET ALL BIKES (PAGINATED)
   GET /api/bikes
=========================== */
export const getBikes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [bikes, total] = await Promise.all([
      prisma.bike.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.bike.count(),
    ]);

    const formatted = bikes.map((b) => ({
      id: b.id,

      // ✅ MATCH FRONTEND FIELD NAMES
      ownerName: b.ownerName,
      bikeModel: b.bikeModel,
      regNumber: b.regNumber,

      // ✅ keep rest for other pages
      phone: b.phone,
      email: b.email,
      address: b.address,
      receiverName: b.receiverName,

      bikeBrand: b.bikeBrand,
      bikeYear: b.bikeYear,

      vin: b.vin,
      color: b.color,
      fuel: b.fuel,
      notes: b.notes,

      bikeImage: b.bikeImage,
      adImage: b.adImage,
      damageImages: b.damageImages,

      createdAt: b.createdAt,
    }));


    res.json({
      data: formatted,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("getBikes error:", err);
    res.status(500).json({ message: "Failed to fetch bikes" });
  }
};

/* ===========================
   GET SINGLE BIKE
   GET /api/bikes/:id
=========================== */
export const getBikeById = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const b = await prisma.bike.findUnique({
      where: { id },
    });

    if (!b) return res.status(404).json({ message: "Bike not found" });

    const formatted = {
      id: b.id,
      fullName: b.ownerName,
      phone: b.phone,
      email: b.email,
      address: b.address,
      receiverName: b.receiverName,

      vehicleMake: b.bikeBrand,
      vehicleModel: b.bikeModel,
      vehicleYear: b.bikeYear,

      regNumber: b.regNumber,
      vin: b.vin,

      color: b.color,
      fuel: b.fuel,
      notes: b.notes,

      carImage: b.bikeImage,
      adImage: b.adImage,
      damageImages: b.damageImages,

      createdAt: b.createdAt,
    };

    res.json(formatted);
  } catch (err) {
    console.error("getBikeById error:", err);
    res.status(500).json({ message: "Failed to fetch bike" });
  }
};

/* ===========================
   DELETE BIKE
   DELETE /api/bikes/:id
=========================== */
export const deleteBike = async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.bike.delete({ where: { id } });

    res.json({ message: "Bike deleted successfully" });
  } catch (err) {
    console.error("deleteBike error:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};
