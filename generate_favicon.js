import { Jimp } from 'jimp';
import fs from 'fs';
import path from 'path';

async function generateFavicon() {
    console.log('Starting premium favicon generation...');

    const logoPath = path.resolve('public/curiya-logo.jpg');
    const outputPath = path.resolve('public/favicon-v2.png');

    try {
        // 1. Read the original Curiya JPEG logo
        console.log(`Loading original logo from: ${logoPath}`);
        const logo = await Jimp.read(logoPath);
        
        console.log(`Logo loaded. Dimensions: ${logo.bitmap.width}x${logo.bitmap.height}`);

        // 2. Remove the white background from the original logo
        const logoWidth = logo.bitmap.width;
        const logoHeight = logo.bitmap.height;
        const logoData = logo.bitmap.data;

        console.log('Removing white background from the logo...');
        for (let i = 0; i < logoData.length; i += 4) {
            const r = logoData[i];
            const g = logoData[i + 1];
            const b = logoData[i + 2];

            // If the pixel is pure white or close to it, make it fully transparent
            if (r > 240 && g > 240 && b > 240) {
                logoData[i + 3] = 0; // Alpha = 0 (transparent)
            }
        }

        // 3. Create a new transparent canvas (512x512)
        console.log('Creating 512x512 transparent canvas...');
        const canvas = new Jimp({ width: 512, height: 512, color: 0x00000000 });
        const canvasData = canvas.bitmap.data;

        // 4. Render a premium white rounded squircle (460x460) with anti-aliased corners
        // Centered inside 512x512 (padding of 26px on all sides)
        const sqSize = 460;
        const startX = 26;
        const endX = startX + sqSize - 1; // 485
        const startY = 26;
        const endY = startY + sqSize - 1; // 485
        const radius = 100; // Corner radius (approx 22% of 460)

        // Corner centers
        const tlCenter = { x: startX + radius, y: startY + radius }; // (126, 126)
        const trCenter = { x: endX - radius, y: startY + radius };   // (385, 126)
        const blCenter = { x: startX + radius, y: endY - radius }; // (126, 385)
        const brCenter = { x: endX - radius, y: endY - radius };   // (385, 385)

        console.log('Rendering mathematically anti-aliased white squircle...');
        for (let y = 0; y < 512; y++) {
            for (let x = 0; x < 512; x++) {
                let alpha = 0;

                // Check if the coordinate falls within the outer bounding square
                if (x >= startX && x <= endX && y >= startY && y <= endY) {
                    // Check if we are in one of the 4 corner zones
                    if (x < tlCenter.x && y < tlCenter.y) {
                        // Top-Left Corner
                        const dx = x - tlCenter.x;
                        const dy = y - tlCenter.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        alpha = computeAAAlpha(dist, radius);
                    } else if (x > trCenter.x && y < trCenter.y) {
                        // Top-Right Corner
                        const dx = x - trCenter.x;
                        const dy = y - trCenter.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        alpha = computeAAAlpha(dist, radius);
                    } else if (x < blCenter.x && y > blCenter.y) {
                        // Bottom-Left Corner
                        const dx = x - blCenter.x;
                        const dy = y - blCenter.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        alpha = computeAAAlpha(dist, radius);
                    } else if (x > brCenter.x && y > brCenter.y) {
                        // Bottom-Right Corner
                        const dx = x - brCenter.x;
                        const dy = y - brCenter.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        alpha = computeAAAlpha(dist, radius);
                    } else {
                        // Core inner square area (not in corners)
                        alpha = 1.0;
                    }
                }

                // If alpha > 0, paint the pixel white with the calculated alpha level
                if (alpha > 0) {
                    const idx = (y * 512 + x) * 4;
                    canvasData[idx] = 255;     // R
                    canvasData[idx + 1] = 255; // G
                    canvasData[idx + 2] = 255; // B
                    canvasData[idx + 3] = Math.round(alpha * 255); // A
                }
            }
        }

        // Helper function to calculate linear anti-aliased alpha on boundaries
        function computeAAAlpha(dist, r) {
            const edgeMin = r - 0.75;
            const edgeMax = r + 0.75;
            if (dist < edgeMin) return 1.0;
            if (dist > edgeMax) return 0.0;
            // Linear interpolate between edgeMin (1.0) and edgeMax (0.0)
            return 1.0 - (dist - edgeMin) / (edgeMax - edgeMin);
        }

        // 5. Resize the transparent green logo to 330x330 (approx 72% of the squircle width)
        console.log('Resizing logo to 330x330...');
        logo.resize({ w: 330, h: 330 });

        // 6. Overlay the green logo onto the white rounded squircle (perfectly centered)
        // Center of 512x512 is 256. Center of 330x330 is 165. Offset is 256 - 165 = 91px.
        const offset = Math.round((512 - 330) / 2);
        console.log(`Compositing logo onto canvas at offset (${offset}, ${offset})...`);
        canvas.composite(logo, offset, offset);

        // 7. Write the final premium image to favicon-v2.png
        console.log(`Writing final image to: ${outputPath}`);
        await canvas.write(outputPath);

        console.log('SUCCESS: Curiya premium favicon-v2.png generated successfully!');
    } catch (error) {
        console.error('ERROR during favicon generation:');
        console.error(error.message);
        console.error(error.stack);
    }
}

generateFavicon();
