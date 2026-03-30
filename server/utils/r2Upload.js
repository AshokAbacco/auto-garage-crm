// r2Upload.js
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2Client } from "../utils/r2Client.js";
import { randomUUID } from "crypto";

export const uploadToR2 = async ({ buffer, mimeType, folder }) => {
  const key = `${folder}/${randomUUID()}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return {
    key,
    url: `${process.env.R2_PUBLIC_URL}/${key}`,
  };
};
