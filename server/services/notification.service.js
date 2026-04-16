// src/services/notification.service.js
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ==============================
// CREATE: Booking Accepted → USER-scoped notification
// ==============================
export const notifyBookingAccepted = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
    include: {
      service: true,
      client: true,
    },
  });

  if (!booking) {
    console.warn(`[NotificationService] Booking ${bookingId} not found`);
    return null;
  }

  const clientPhone = booking.client?.phone || null;
  const serviceName = booking.serviceName || booking.service?.name || "Service";

  const notification = await prisma.appNotification.create({
    data: {
      type: "BOOKING_ACCEPTED",
      title: "Booking Confirmed ✅",
      body: `Your booking for ${serviceName} has been accepted! We'll see you soon.`,
      iconKey: "car",
      scope: "USER",
      clientPhone,
      bookingId: booking.id,
      createdByUserId: booking.garageId || null,
    },
  });

  console.log(`[NotificationService] BOOKING_ACCEPTED notification created: ID ${notification.id}, phone: ${clientPhone}`);
  return notification;
};

// ==============================
// CREATE: Booking Rejected → USER-scoped notification
// ==============================
export const notifyBookingRejected = async (bookingId) => {
  const booking = await prisma.marketplaceBooking.findUnique({
    where: { id: Number(bookingId) },
    include: {
      service: true,
      client: true,
    },
  });

  if (!booking) {
    console.warn(`[NotificationService] Booking ${bookingId} not found`);
    return null;
  }

  const clientPhone = booking.client?.phone || null;
  const serviceName = booking.serviceName || booking.service?.name || "Service";

  const notification = await prisma.appNotification.create({
    data: {
      type: "BOOKING_REJECTED",
      title: "Booking Update",
      body: `Unfortunately, your booking for ${serviceName} could not be confirmed at this time. Please try another garage.`,
      iconKey: "alert-circle",
      scope: "USER",
      clientPhone,
      bookingId: booking.id,
      createdByUserId: booking.garageId || null,
    },
  });

  console.log(`[NotificationService] BOOKING_REJECTED notification created: ID ${notification.id}, phone: ${clientPhone}`);
  return notification;
};

// ==============================
// CREATE: New Package → GLOBAL notification (visible to all app users)
// ==============================
export const notifyNewPackage = async (packageId, userId) => {
  const pkg = await prisma.marketplacePackage.findUnique({
    where: { id: Number(packageId) },
    include: {
      user: { select: { companyName: true, username: true } },
    },
  });

  if (!pkg) {
    console.warn(`[NotificationService] Package ${packageId} not found`);
    return null;
  }

  const garageName = pkg.user?.companyName || pkg.user?.username || "A garage partner";

  const notification = await prisma.appNotification.create({
    data: {
      type: "NEW_PACKAGE",
      title: `New Bundle: ${pkg.name} 🎉`,
      body: `${garageName} just launched a new service bundle — ${pkg.name} at ₹${pkg.price}. Check it out!`,
      iconKey: "pricetag",
      scope: "GLOBAL",
      clientPhone: null,
      packageId: pkg.id,
      createdByUserId: Number(userId),
    },
  });

  console.log(`[NotificationService] NEW_PACKAGE notification created: ID ${notification.id}, package: "${pkg.name}"`);
  return notification;
};

// ==============================
// CREATE: Manual / custom notification from CRM UI
// ==============================
export const createManualNotification = async ({
  title,
  body,
  iconKey = "notifications",
  scope = "GLOBAL",
  clientPhone = null,
  createdByUserId,
}) => {
  const notification = await prisma.appNotification.create({
    data: {
      type: "GENERAL",
      title,
      body,
      iconKey,
      scope,
      clientPhone: scope === "USER" ? clientPhone : null,
      createdByUserId: createdByUserId ? Number(createdByUserId) : null,
    },
  });

  console.log(`[NotificationService] GENERAL notification created: ID ${notification.id}, scope: ${scope}`);
  return notification;
};

// ==============================
// GET: Notifications for a specific app user
// Returns GLOBAL + USER-scoped for this phone number
// ==============================
export const getNotificationsForUser = async (phone, limit = 50) => {
  const where = phone
    ? {
        isActive: true,
        OR: [
          { scope: "GLOBAL" },
          { scope: "USER", clientPhone: phone },
        ],
      }
    : {
        isActive: true,
        scope: "GLOBAL",
      };

  const notifications = await prisma.appNotification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      booking: {
        select: {
          id: true,
          serviceName: true,
          status: true,
          scheduledAt: true,
          finalPrice: true,
        },
      },
      package: {
        select: {
          id: true,
          name: true,
          price: true,
          description: true,
        },
      },
    },
  });

  return notifications.map((n) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    body: n.body,
    iconKey: n.iconKey,
    scope: n.scope,
    createdAt: n.createdAt,
    booking: n.booking || null,
    package: n.package || null,
  }));
};

// ==============================
// GET: All notifications — CRM admin/list view with pagination
// ==============================
export const getAllNotifications = async ({ page = 1, limit = 30 } = {}) => {
  const skip = (page - 1) * limit;

  const [total, notifications] = await Promise.all([
    prisma.appNotification.count({ where: { isActive: true } }),
    prisma.appNotification.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        createdBy: { select: { id: true, companyName: true, username: true } },
        booking: { select: { id: true, serviceName: true, status: true } },
        package: { select: { id: true, name: true, price: true } },
      },
    }),
  ]);

  return { total, page, limit, notifications };
};

// ==============================
// DEACTIVATE: Soft-delete a notification (CRM)
// ==============================
export const deactivateNotification = async (id) => {
  return prisma.appNotification.update({
    where: { id: Number(id) },
    data: { isActive: false },
  });
};