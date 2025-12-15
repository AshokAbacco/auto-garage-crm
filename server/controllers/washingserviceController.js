import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/service-categories
 * Returns all categories with their sub-services
 */
export const getServiceCategories = async (req, res) => {
  try {
    const categories = await prisma.serviceCategory.findMany({
      include: {
        subServices: true,
      },
    });

    res.json(categories);
  } catch (error) {
    console.error("getServiceCategories error:", error);
    res.status(500).json({ message: "Failed to load service categories" });
  }
};

/**
 * GET /api/service-categories/:categoryId/sub-services
 */
export const getSubServicesByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId, 10);

    if (isNaN(categoryId)) {
      return res.status(400).json({ message: "Invalid category id" });
    }

    const subServices = await prisma.subService.findMany({
      where: { categoryId },
    });

    res.json(subServices);
  } catch (error) {
    console.error("getSubServicesByCategory error:", error);
    res.status(500).json({ message: "Failed to load sub-services" });
  }
};


export const createService = async (req, res) => {
  try {
    const {
      clientId,
      date,
      categoryId,
      subServiceId,
      partsCost,
      laborCost,
      status,
      notes,
    } = req.body;

    const parsedClientId = parseInt(clientId, 10);
    const parsedCategoryId = parseInt(categoryId, 10);
    const parsedSubServiceId = subServiceId ? parseInt(subServiceId, 10) : null;
    const parsedPartsCost = partsCost ? parseFloat(partsCost) : 0;
    const parsedLaborCost = laborCost ? parseFloat(laborCost) : 0;

    if (isNaN(parsedClientId) || isNaN(parsedCategoryId)) {
      return res.status(400).json({ message: "Invalid client or category" });
    }

    const serviceDate = new Date(date);
    if (isNaN(serviceDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    const estimatedTotal = parsedPartsCost + parsedLaborCost;

    // Create the service and its media in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const newService = await tx.service.create({
        data: {
          clientId: parsedClientId,
          date: serviceDate,
          categoryId: parsedCategoryId,
          subServiceId: parsedSubServiceId,
          partsCost: parsedPartsCost,
          laborCost: parsedLaborCost,
          estimatedTotal,
          status: status || "PENDING",
          notes: notes || null,
        },
      });

      // If files were uploaded, attach them as ServiceMedia
      if (req.files && req.files.length > 0) {
        const mediaData = req.files.map((file) => ({
          serviceId: newService.id,
          url: `/uploads/${file.filename}`, // adjust based on static serving
          mimeType: file.mimetype,
          fileName: file.originalname,
        }));

        await tx.serviceMedia.createMany({
          data: mediaData,
        });
      }

      // Reload service with relations if you want to send full object
      const created = await tx.service.findUnique({
        where: { id: newService.id },
        include: {
          client: true,
          category: true,
          subService: true,
          media: true,
        },
      });

      return created;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("createService error:", error);
    res.status(500).json({ message: "Failed to create service" });
  }
};
