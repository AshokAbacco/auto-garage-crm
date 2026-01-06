import prisma from "../models/prismaClient.js";

/**
 * Update service approval status (internal / webhook / web)
 * POST /api/services/:id/approval
 */
export const updateServiceApproval = async (req, res) => {
  try {
    const serviceId = Number(req.params.id);
    const { status, note, source = "internal" } = req.body;

    if (!serviceId || !status) {
      return res
        .status(400)
        .json({ message: "Service ID and status required" });
    }

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "REJECTED",
      "APPROVED_WITH_CONDITION",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid approval status" });
    }

    // Ensure service belongs to logged-in user
    const service = await prisma.service.findFirst({
      where: {
        id: serviceId,
        client: { userId: req.user.id },
      },
    });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    const updated = await prisma.service.update({
      where: { id: serviceId },
      data: {
        approvalStatus: status,
        approvalNote: note || null,
        approvalAt: new Date(),
        approvalSource: source,
      },
    });

    res.json({
      message: "Service approval updated",
      service: updated,
    });
  } catch (error) {
    console.error("updateServiceApproval error:", error);
    res.status(500).json({ message: "Failed to update approval" });
  }
};
