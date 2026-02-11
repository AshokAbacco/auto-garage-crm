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
  /* ------------------ FETCH DATA ------------------ */
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      client: true,
      serviceCostItems: true,
    },
  });

  if (!service) throw new Error("Service not found");

  const owner = await prisma.user.findUnique({
    where: { id: service.client.userId },
  });

  const parts = service.serviceCostItems.filter((i) => i.type === "part");
  const labor = service.serviceCostItems.filter((i) => i.type === "labor");

  const calcTotals = (items) =>
    items.reduce(
      (sum, i) =>
        sum + i.quantity * i.unitPrice * (1 + (i.cgstRate + i.sgstRate) / 100),
      0,
    );

  const partsTotal = calcTotals(parts);
  const laborTotal = calcTotals(labor);
  const grandTotal = partsTotal + laborTotal;
  const finalPayable = Math.floor(grandTotal);
  const roundOff = (finalPayable - grandTotal).toFixed(2);

  /* ------------------ HTML TEMPLATE ------------------ */
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Proforma Invoice</title>

  <!-- GOOGLE FONT -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;900&display=swap" rel="stylesheet">

  <style>
    * { box-sizing: border-box; }
    body {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #000;
      margin: 0;
      padding: 24px;
    }
    h1,h2,h3 { margin: 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td {
      border: 1px solid #444;
      padding: 4px;
      text-align: right;
    }
    th { background: #f2f2f2; font-weight: 700; }
    .left { text-align: left; }
    .center { text-align: center; }
    .no-border { border: none; }
    .watermark {
      position: fixed;
      top: 35%;
      left: 15%;
      font-size: 72px;
      font-weight: 900;
      color: #000;
      opacity: 0.06;
      transform: rotate(-30deg);
      z-index: 0;
    }
  </style>
</head>

<body>
  <div class="watermark">PROFORMA INVOICE</div>

  <!-- HEADER -->
  <table class="no-border">
    <tr class="no-border">
      <td class="no-border left">
        <h1>${owner?.companyName || "Garage Name"}</h1>
        <div>${owner?.address || ""}</div>
        <div><b>GSTIN:</b> ${owner?.gstNumber || "N/A"}</div>
        <div><b>Phone:</b> ${owner?.phone || "N/A"}</div>
      </td>
      <td class="no-border">
        <h2>TAX INVOICE</h2>
        <div><b>Invoice No:</b> PI-${service.id}</div>
        <div><b>Date:</b> ${new Date().toLocaleDateString()}</div>
      </td>
    </tr>
  </table>

  <hr/>

  <!-- CUSTOMER -->
  <table class="no-border">
    <tr class="no-border">
      <td class="no-border left">
        <b>Customer:</b> ${service.client.fullName}<br/>
        <b>Phone:</b> ${service.client.phone}<br/>
        <b>Vehicle:</b> ${service.client.regNumber}
      </td>
    </tr>
  </table>

  <br/>

  <!-- PARTS -->
  ${
    parts.length
      ? `
  <h3>Genuine Parts</h3>
  <table>
    <tr>
      <th>S.No</th><th class="left">Description</th><th>Qty</th>
      <th>Rate</th><th>CGST%</th><th>SGST%</th><th>Total</th>
    </tr>
    ${parts
      .map(
        (p, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="left">${p.name}</td>
        <td class="center">${p.quantity}</td>
        <td>${p.unitPrice.toFixed(2)}</td>
        <td class="center">${p.cgstRate}%</td>
        <td class="center">${p.sgstRate}%</td>
        <td>${(
          p.quantity *
          p.unitPrice *
          (1 + (p.cgstRate + p.sgstRate) / 100)
        ).toFixed(2)}</td>
      </tr>`,
      )
      .join("")}
  </table>
  <br/>`
      : ""
  }

  <!-- LABOUR -->
  ${
    labor.length
      ? `
  <h3>Labour Charges</h3>
  <table>
    <tr>
      <th>S.No</th><th class="left">Description</th><th>Qty</th>
      <th>Rate</th><th>CGST%</th><th>SGST%</th><th>Total</th>
    </tr>
    ${labor
      .map(
        (l, i) => `
      <tr>
        <td class="center">${i + 1}</td>
        <td class="left">${l.name}</td>
        <td class="center">${l.quantity}</td>
        <td>${l.unitPrice.toFixed(2)}</td>
        <td class="center">${l.cgstRate}%</td>
        <td class="center">${l.sgstRate}%</td>
        <td>${(
          l.quantity *
          l.unitPrice *
          (1 + (l.cgstRate + l.sgstRate) / 100)
        ).toFixed(2)}</td>
      </tr>`,
      )
      .join("")}
  </table>
  <br/>`
      : ""
  }

  <!-- TOTAL -->
  <table>
    <tr>
      <th class="left">Grand Total</th>
      <th>${grandTotal.toFixed(2)}</th>
    </tr>
    <tr>
      <th class="left">Round Off</th>
      <th>${roundOff}</th>
    </tr>
    <tr>
      <th class="left">AMOUNT PAYABLE</th>
      <th>${finalPayable.toFixed(2)}</th>
    </tr>
  </table>

  <p><b>Amount in Words:</b> ${numberToWords(finalPayable)}</p>

</body>
</html>
`;

  /* ------------------ PDF GENERATION ------------------ */
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  /* ------------------ UPLOAD TO R2 ------------------ */
  const key = `services/${service.id}/proforma-${service.id}.pdf`;

  const pdfUrl = await uploadBufferToR2({
    buffer: pdfBuffer,
    key,
    contentType: "application/pdf",
  });

  return pdfUrl;
};
