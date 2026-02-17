import puppeteer from "puppeteer";
import prisma from "../models/prismaClient.js";
import { uploadBufferToR2 } from "./r2Service.js";

// Helper for Amount in Words
const numberToWords = (num) => {
  const a = [
    "",
    "One ",
    "Two ",
    "Three ",
    "Four ",
    "Five ",
    "Six ",
    "Seven ",
    "Eight ",
    "Nine ",
    "Ten ",
    "Eleven ",
    "Twelve ",
    "Thirteen ",
    "Fourteen ",
    "Fifteen ",
    "Sixteen ",
    "Seventeen ",
    "Eighteen ",
    "Nineteen ",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const format = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + format(n % 100);
    if (n < 100000)
      return format(Math.floor(n / 1000)) + "Thousand " + format(n % 1000);
    if (n < 10000000)
      return format(Math.floor(n / 100000)) + "Lakh " + format(n % 100000);
    return "";
  };
  return `${format(Math.floor(num))}Only`.replace(/\s+/g, " ");
};

/* -----------------------------------------
   MAIN PDF GENERATOR (WASH VERSION)
----------------------------------------- */
export const generateWashFinalInvoicePDF = async (invoiceId) => {
  // ✅ UPDATED: Query washBilling instead of bikeInvoice
  const billing = await prisma.washBilling.findUnique({
    where: { id: Number(invoiceId) },
    include: {
      washingClient: true, // ✅ UPDATED: washingClient instead of bike
      
    },
  });

  if (!billing) throw new Error("Wash Billing not found");
  const owner = await prisma.user.findUnique({
    where: { id: billing.userId },
    select: {
      companyName: true,
      address: true,
      phone: true,
      email: true,
      gstNumber: true,
    },
  });

  if (!owner) throw new Error("Owner not found");


  const html = buildWashInvoiceHTML(billing, owner);


  // LAUNCH OPTIONS - Optimized for Render
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: puppeteer.executablePath(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-zygote",
      "--single-process",
    ],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    // ✅ UPDATED: Upload path changed to wash-invoices
    const key = `wash-invoices/${billing.id}/final-${billing.invoiceNumber}.pdf`;
    const pdfUrl = await uploadBufferToR2({
      buffer: pdfBuffer,
      key,
      contentType: "application/pdf",
    });

    return pdfUrl;
  } catch (error) {
    console.error("❌ Wash Final Invoice PDF Generation Error:", error);
    throw error;
  } finally {
    if (browser) await browser.close();
  }
};

/* -----------------------------------------
   HTML BUILDER (WASH VERSION)
----------------------------------------- */
function buildWashInvoiceHTML(billing, owner) {
  // ✅ UPDATED: Renamed variables

  const client = billing.washingClient;

  // ✅ UPDATED: Use simple washing fields instead of items
  const partsCost = Number(billing.partsCost || 0);
  const partsGst = Number(billing.partsGst || 0);
  const grandTotal = Number(billing.grandTotal || 0);

  const finalPayable = Math.floor(grandTotal);
  const roundOff = (finalPayable - grandTotal).toFixed(2);

  // ✅ UPDATED: Simple Summary Table instead of itemized rows
  const summaryTable = `
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr style="background-color: #f3f4f6; text-align: left; font-size: 10px; font-weight: bold;">
        <th style="border: 1px solid #9ca3af; padding: 8px; width: 60%;">Description</th>
        <th style="border: 1px solid #9ca3af; padding: 8px; text-align: right; width: 40%;">Amount (INR)</th>
      </tr>
      <tr style="font-size: 10px;">
        <td style="border: 1px solid #9ca3af; padding: 8px;">Service Category</td>
        <td style="border: 1px solid #9ca3af; padding: 8px; text-align: right; font-weight: bold;">Wash Service</td>
      </tr>
      <tr style="font-size: 10px;">
        <td style="border: 1px solid #9ca3af; padding: 8px;">Parts / Material Cost</td>
        <td style="border: 1px solid #9ca3af; padding: 8px; text-align: right;">${partsCost.toFixed(2)}</td>
      </tr>
      <tr style="font-size: 10px;">
        <td style="border: 1px solid #9ca3af; padding: 8px;">GST</td>
        <td style="border: 1px solid #9ca3af; padding: 8px; text-align: right;">${partsGst.toFixed(2)}</td>
      </tr>
      <tr style="font-size: 11px; font-weight: bold; background-color: #f9fafb;">
        <td style="border: 1px solid #9ca3af; padding: 8px;">Total</td>
        <td style="border: 1px solid #9ca3af; padding: 8px; text-align: right;">${grandTotal.toFixed(2)}</td>
      </tr>
    </table>
  `;

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #111; line-height: 1.2; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      .section-title { font-size: 10px; font-weight: bold; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
      .uppercase { text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 2px solid #111;">
      <div style="width: 60%;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 5px 0;">${owner.companyName}</h1>
        <p style="font-size: 10px; color: #4b5563; margin: 0;">${owner.address}</p>
        <div style="font-size: 10px; margin-top: 10px;">
          <strong>GSTIN:</strong> ${owner.gstNumber} | <strong>Contact:</strong> ${owner.phone}
        </div>
      </div>
      <div style="text-align: right;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">TAX INVOICE</h1>
        <p style="font-size: 9px; color: #6b7280; font-weight: bold;">CASH / CREDIT</p>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #d1d5db; padding-bottom: 20px; margin-bottom: 20px;">
      <div style="width: 48%;">
        <div class="section-title">Customer Details</div>
        <div style="font-size: 10px; display: grid; gap: 4px;">
          <!-- ✅ UPDATED: fullName instead of ownerName -->
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Name:</span> <strong>${client.fullName}</strong></div>
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Address:</span> <span>${client.address || "N/A"}</span></div>
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Contact:</span> <span>${client.phone}</span></div>
        </div>
      </div>
      <div style="width: 48%;">
        <div class="section-title">Invoice Details</div>
        <div style="font-size: 10px; display: grid; gap: 4px;">
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Invoice No:</span> <strong>${billing.invoiceNumber}</strong></div>
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Date:</span> <span>${new Date(billing.createdAt).toLocaleDateString()}</span></div>
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Vehicle No:</span> <strong class="uppercase">${client.regNumber || "N/A"}</strong></div>
          <!-- ✅ UPDATED: vehicleMake/vehicleModel instead of bikeBrand/bikeModel -->
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Model/Make:</span> <span class="uppercase">${client.vehicleMake || ""} ${client.vehicleModel || ""}</span></div>
        </div>
      </div>
    </div>

    <!-- ✅ UPDATED: Simple Summary Table -->
    <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">BILLING DETAILS</div>
    ${summaryTable}

    <div style="display: flex; justify-content: space-between; margin-top: 20px; border-top: 2px solid #111; pt: 20px;">
      <div style="width: 55%; font-size: 10px;">
        <div class="section-title" style="margin-top: 10px;">Grand Total Calculation</div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding-left: 10px;"><span>Parts / Material Cost</span><span>₹${partsCost.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-left: 10px; border-bottom: 1px solid #eee;"><span>GST Amount</span><span>₹${partsGst.toFixed(2)}</span></div>
        
        <div style="margin-top: 15px;">
          <strong>Total Amount (In Words):</strong>
          <div style="font-style: italic; font-weight: bold; font-size: 11px;">${numberToWords(finalPayable)}</div>
        </div>
      </div>

      <div style="width: 40%; font-size: 10px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; margin-top: 10px;"><span>Net Amount (Incl. Tax)</span><span>₹${grandTotal.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between; color: #ef4444;"><span>Round off</span><span>₹${roundOff}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; background: #f3f4f6; padding: 8px; border-top: 1px solid #9ca3af; border-bottom: 1px solid #9ca3af; margin-top: 5px;">
          <span>AMOUNT PAYABLE</span><span>₹${finalPayable.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 60px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <p style="color: #1d4ed8; font-weight: bold; font-size: 11px; margin-bottom: 4px;">Thank you for choosing ${owner.companyName}!</p>
      <p style="font-size: 10px; color: #4b5563;">Support Email: <strong>${owner.email}</strong></p>
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #374151; margin-top: 20px;">
        <!-- ✅ UPDATED: Footer text -->
        <span>Digital Wash Billing System © ${new Date().getFullYear()}</span>
        <span>Secure & Verified</span>
      </div>
    </div>
  </body>
  </html>
  `;
}
