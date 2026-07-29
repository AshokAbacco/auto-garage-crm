// services/abaccoReferral.service.js
//
// Read-only service for the Abacco Tech integration.
// This does NOT modify or depend on the existing referral system.
// It simply exposes referral payment data for Abacco Tech to sync.

import prisma from "../models/prismaClient.js";

export const getReferredPaymentsForAbacco = async () => {
  const payments = await prisma.payment.findMany({
    where: {
      referralCode: {
        not: null,
      },
      status: {
        in: ["PENDING", "PAID", "TRIAL",  "FIRST_PAYMENT_COMPLETED","ACTIVE"],
      },
    },
    select: {
      id: true,
      customerName: true,
      companyName: true,
      email: true,
      phone: true,
      plan: true,
      amount: true,
      referralCode: true,
      status: true,
      paidAt: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return payments.map((payment) => ({
    externalId: payment.id,
    customerName: payment.customerName,
    companyName: payment.companyName,
    email: payment.email,
    phone: payment.phone,
    plan: payment.plan,
    amount: payment.amount,
    referralCode: payment.referralCode,
    status: payment.status,
    paidAt: payment.paidAt,
    createdAt: payment.createdAt,
  }));
};