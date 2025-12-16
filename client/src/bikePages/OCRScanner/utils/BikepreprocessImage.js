// client/src/pages/details/utils/preprocessImage.js

/**
 * Preprocess image before OCR
 * - Converts to grayscale
 * - Boosts contrast
 * - Applies adaptive thresholding
 * - Optional resize for small text
 *
 * @param {string} imageDataUrl - Base64 image input
 * @returns {Promise<string>} - Preprocessed image as base64 PNG
 */
export const preprocessImage = (imageDataUrl) => {
    return new Promise((resolve, reject) => {
        const img = new Image();

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Resize large images to reasonable scale for OCR
            const MAX_WIDTH = 1800;
            const scale = img.width > MAX_WIDTH ? MAX_WIDTH / img.width : 1;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Get pixel data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // 1️⃣ Convert to grayscale
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
                data[i] = data[i + 1] = data[i + 2] = gray;
            }

            // 2️⃣ Increase contrast using simple normalization
            let min = 255,
                max = 0;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i] < min) min = data[i];
                if (data[i] > max) max = data[i];
            }
            const contrastFactor = 255 / (max - min || 1);
            for (let i = 0; i < data.length; i += 4) {
                const v = (data[i] - min) * contrastFactor;
                data[i] = data[i + 1] = data[i + 2] = v;
            }

            // 3️⃣ Binarization (threshold)
            const threshold = 160;
            for (let i = 0; i < data.length; i += 4) {
                const value = data[i] > threshold ? 255 : 0;
                data[i] = data[i + 1] = data[i + 2] = value;
            }

            // 4️⃣ Optional noise cleanup
            // Simple neighbor averaging: removes isolated pixels
            const w = canvas.width;
            const h = canvas.height;
            const copy = new Uint8ClampedArray(data);
            const getGray = (x, y) => copy[(y * w + x) * 4];
            for (let y = 1; y < h - 1; y++) {
                for (let x = 1; x < w - 1; x++) {
                    const idx = (y * w + x) * 4;
                    const neighbors =
                        getGray(x - 1, y) +
                        getGray(x + 1, y) +
                        getGray(x, y - 1) +
                        getGray(x, y + 1);
                    const avg = neighbors / 4;
                    if (Math.abs(data[idx] - avg) > 120) {
                        const newVal = avg > 128 ? 255 : 0;
                        data[idx] = data[idx + 1] = data[idx + 2] = newVal;
                    }
                }
            }

            // Put data back and output as PNG
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL("image/png"));
        };

        img.onerror = () => reject(new Error("Failed to load or process image"));
        img.src = imageDataUrl;
    });
};
