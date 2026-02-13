import puppeteer from "puppeteer";
import prisma from "../models/prismaClient.js";
import { uploadBufferToR2 } from "./r2Service.js";

/* -----------------------------------------
   Helpers
----------------------------------------- */
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
    "Twenty ",
    "Thirty ",
    "Forty ",
    "Fifty ",
    "Sixty ",
    "Seventy ",
    "Eighty ",
    "Ninety ",
  ];

  const inWords = (n) => {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
    if (n < 1000) return a[Math.floor(n / 100)] + "Hundred " + inWords(n % 100);
    if (n < 100000)
      return inWords(Math.floor(n / 1000)) + "Thousand " + inWords(n % 1000);
    if (n < 10000000)
      return inWords(Math.floor(n / 100000)) + "Lakh " + inWords(n % 100000);
    return "";
  };
  return `${inWords(Math.floor(num)).trim()} Only`;
};

/* -----------------------------------------
   MAIN PDF GENERATOR
----------------------------------------- */
export const generateProformaPDF = async (serviceId) => {
  const service = await prisma.service.findUnique({
    where: { id: Number(serviceId) },
    include: {
      client: true,
      serviceCostItems: true,
    },
  });

  if (!service) throw new Error("Service not found");

  const owner = await prisma.user.findUnique({
    where: { id: service.client.userId },
  });

  const html = buildProformaHTML(service, owner);

  // LAUNCH OPTIONS
  const browser = await puppeteer.launch({
    headless: "new",
    /* REMOVED: process.env.PUPPETEER_EXECUTABLE_PATH
       Puppeteer will now automatically find the browser in your 
       PUPPETEER_CACHE_DIR (/opt/render/.cache/puppeteer)
    */
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

    // Added a timeout to prevent hanging on Render
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
    });

    const key = `services/${service.id}/proforma-${service.id}.pdf`;
    const pdfUrl = await uploadBufferToR2({
      buffer: pdfBuffer,
      key,
      contentType: "application/pdf",
    });

    return pdfUrl;
  } catch (error) {
    console.error("❌ PDF Generation Error:", error);
    throw error;
  } finally {
    // CRITICAL: Always close browser even if generation fails
    if (browser) await browser.close();
  }
};

function buildProformaHTML(service, owner) {
  const client = service.client;
  const items = service.serviceCostItems || [];
  const parts = items.filter((i) => i.type === "part");
  const labour = items.filter((i) => i.type === "labor");

  // Tax Grouping Logic
  const getTaxGroups = (itemArray) => {
    const groups = {};
    itemArray.forEach((item) => {
      const rate = Number(item.cgstRate || 0);
      const rateStr = rate.toFixed(2);
      const taxable = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      const taxAmt = (taxable * rate) / 100;
      if (!groups[rateStr]) {
        groups[rateStr] = { rate: rateStr, taxable: 0, taxAmount: 0 };
      }
      groups[rateStr].taxable += taxable;
      groups[rateStr].taxAmount += taxAmt;
    });
    return Object.values(groups);
  };

  const partsTaxGroups = getTaxGroups(parts);
  const laborTaxGroups = getTaxGroups(labour);

  const totalTaxable = items.reduce(
    (sum, i) => sum + Number(i.quantity) * Number(i.unitPrice),
    0,
  );
  const totalTax = items.reduce((sum, i) => {
    const taxable = Number(i.quantity) * Number(i.unitPrice);
    return sum + (taxable * (Number(i.cgstRate) + Number(i.sgstRate))) / 100;
  }, 0);

  const totalWithTax = totalTaxable + totalTax;
  const discount = 0; // Proforma usually doesn't have a discount applied yet
  const finalPayable = Math.floor(totalWithTax - discount);
  const roundOff = (finalPayable - (totalWithTax - discount)).toFixed(2);

  const tableHeader = `
    <tr style="background-color: #f3f4f6; text-align: left; font-size: 9px;">
      <th style="border: 1px solid #9ca3af; padding: 6px;">S.No</th>
      <th style="border: 1px solid #9ca3af; padding: 6px;">Description</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">Qty</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">Rate</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">Taxable</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">CGST</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">Amt</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">SGST</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">Amt</th>
      <th style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">Total</th>
    </tr>`;

  const renderRows = (data) =>
    data
      .map(
        (item, idx) => `
    <tr style="font-size: 9px;">
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">${idx + 1}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-transform: uppercase; font-weight: 500;">${item.name}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">${item.quantity}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">${Number(item.unitPrice).toFixed(2)}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">${(item.quantity * item.unitPrice).toFixed(2)}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">${item.cgstRate}%</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">${((item.quantity * item.unitPrice * item.cgstRate) / 100).toFixed(2)}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: center;">${item.sgstRate}%</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right;">${((item.quantity * item.unitPrice * item.sgstRate) / 100).toFixed(2)}</td>
      <td style="border: 1px solid #9ca3af; padding: 6px; text-align: right; font-weight: bold;">${(item.quantity * item.unitPrice * (1 + (item.cgstRate + item.sgstRate) / 100)).toFixed(2)}</td>
    </tr>`,
      )
      .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 20px; color: #111; line-height: 1.2; position: relative; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; z-index: 10; position: relative; }
      .watermark {
        position: fixed;
        top: 35%;
        left: 5%;
        font-size: 80px;
        font-weight: 900;
        color: rgba(0,0,0,0.05);
        transform: rotate(-30deg);
        z-index: 0;
        pointer-events: none;
        text-transform: uppercase;
        width: 100%;
        text-align: center;
      }
      .section-title { font-size: 10px; font-weight: bold; color: #6b7280; margin-bottom: 10px; text-transform: uppercase; }
    </style>
  </head>
  <body>
    <div class="watermark">PROFORMA INVOICE</div>

    <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 20px; margin-bottom: 20px; border-bottom: 2px solid #111;">
      <div style="width: 60%;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0 0 5px 0;">${owner?.companyName || "Garage Name"}</h1>
        <p style="font-size: 10px; color: #4b5563; margin: 0;">${owner?.address || ""}</p>
        <div style="font-size: 10px; margin-top: 10px;">
          <strong>GSTIN:</strong> ${owner?.gstNumber || "N/A"} | <strong>Contact:</strong> ${owner?.phone || "N/A"}
        </div>
      </div>
      <div style="text-align: right;">
        <h1 style="font-size: 28px; font-weight: bold; margin: 0;">TAX INVOICE</h1>
        <p style="font-size: 9px; color: #6b7280; font-weight: bold;">PROFORMA</p>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #d1d5db; padding-bottom: 20px; margin-bottom: 20px;">
      <div style="width: 48%;">
        <div class="section-title">Customer Details</div>
        <div style="font-size: 10px; display: grid; gap: 4px;">
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Name:</span> <strong>${client.fullName}</strong></div>
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Address:</span> <span>${client.address || "N/A"}</span></div>
          <div><span style="display:inline-block; width: 80px; color: #4b5563;">Contact:</span> <span>${client.phone}</span></div>
        </div>
      </div>
      <div style="width: 48%;">
        <div class="section-title">Invoice Details</div>
        <div style="font-size: 10px; display: grid; gap: 4px;">
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Proforma No:</span> <strong>PI-${service.id}</strong></div>
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Date:</span> <span>${new Date().toLocaleDateString()}</span></div>
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Vehicle No:</span> <strong style="text-transform: uppercase;">${client.regNumber || "N/A"}</strong></div>
          <div><span style="display:inline-block; width: 100px; color: #4b5563;">Model/Make:</span> <span style="text-transform: uppercase;">${client.vehicleMake} ${client.vehicleModel}</span></div>
        </div>
      </div>
    </div>

    ${
      parts.length > 0
        ? `
      <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px;">PARTS DETAILS</div>
      <table><thead>${tableHeader}</thead><tbody>${renderRows(parts)}</tbody></table>
    `
        : ""
    }

    ${
      labour.length > 0
        ? `
      <div style="font-size: 11px; font-weight: bold; margin-bottom: 8px; margin-top: 15px;">LABOUR DETAILS</div>
      <table><thead>${tableHeader}</thead><tbody>${renderRows(labour)}</tbody></table>
    `
        : ""
    }

    <div style="display: flex; justify-content: space-between; margin-top: 20px; border-top: 2px solid #111; pt: 20px;">
      <div style="width: 55%; font-size: 10px;">
        <div class="section-title" style="margin-top: 10px;">Calculation Breakdown</div>
        ${partsTaxGroups.map((g) => `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding-left: 10px;"><span>CGST(Parts) @ <strong>${g.rate}%</strong></span><span>₹${g.taxAmount.toFixed(2)}</span></div>`).join("")}
        ${partsTaxGroups.map((g) => `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding-left: 10px;"><span>SGST(Parts) @ <strong>${g.rate}%</strong></span><span>₹${g.taxAmount.toFixed(2)}</span></div>`).join("")}
        ${laborTaxGroups.map((g) => `<div style="display: flex; justify-content: space-between; margin-bottom: 4px; padding-left: 10px;"><span>CGST(Labor) @ <strong>${g.rate}%</strong></span><span>₹${g.taxAmount.toFixed(2)}</span></div>`).join("")}
        ${laborTaxGroups.map((g) => `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-left: 10px; border-bottom: 1px solid #eee;"><span>SGST(Labor) @ <strong>${g.rate}%</strong></span><span>₹${g.taxAmount.toFixed(2)}</span></div>`).join("")}
        <div style="margin-top: 15px;"><strong>Total Amount in Words:</strong><br/><strong>${numberToWords(finalPayable)}</strong></div>
      </div>

      <div style="width: 40%; font-size: 10px; display: flex; flex-direction: column; gap: 6px;">
        <div style="display: flex; justify-content: space-between; margin-top: 10px;"><span>Net Amount</span><span>₹${totalWithTax.toFixed(2)}</span></div>
        <div style="display: flex; justify-content: space-between; color: #ef4444;"><span>Round off</span><span>₹${roundOff}</span></div>
        <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; background: #f3f4f6; padding: 8px; border-top: 1px solid #9ca3af; border-bottom: 1px solid #9ca3af; margin-top: 5px;">
          <span>ESTIMATED TOTAL</span><span>₹${finalPayable.toFixed(2)}</span>
        </div>
      </div>
    </div>

    <div style="margin-top: 60px; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px;">
      <p style="color: #1d4ed8; font-weight: bold; font-size: 11px;">This is a Proforma Invoice (Estimation) only.</p>
      <div style="display: flex; justify-content: space-between; font-size: 8px; color: #374151; margin-top: 20px;">
        <span>The Motor Desk © 2026</span>
        <span>Digital Billing System - Secure & Verified</span>
      </div>
    </div>
  </body>
  </html>
  `;
}
