  import puppeteer from "puppeteer";
  import path from "path";
  import fs from "fs";
  import prisma from "../models/prismaClient.js";

  export const generateProformaPDF = async (serviceId) => {
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        client: true,
        serviceCostItems: true,
      },
    });

    if (!service) throw new Error("Service not found");

    const html = `
      <html>
        <body style="font-family: Arial; padding: 20px">
          <h2>Proforma Invoice</h2>
          <hr/>
          <p><strong>Client:</strong> ${service.client.fullName}</p>
          <p><strong>Vehicle:</strong> ${service.client.regNumber}</p>
          <p><strong>Total Amount:</strong> ₹${service.cost}</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

    const fileName = `proforma-${service.id}.pdf`;
    const filePath = path.join("uploads", fileName);

    await page.pdf({ path: filePath, format: "A4" });
    await browser.close();

    return `${process.env.PUBLIC_BASE_URL}/uploads/${fileName}`;
  };
