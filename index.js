import {open, readdir} from "node:fs/promises";
import {join, resolve} from "node:path";
import {PDFDocument} from 'pdf-lib';

async function loadSlide(filename) {
    const handle = await open(filename, "r");
    const file = await handle.readFile();
    await handle.close();
    return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength);
}

async function main() {
    const sourceDir = resolve(import.meta.dirname, "./data/slides")
    const destDir = resolve(import.meta.dirname, "./data");
    const slides = await readdir(sourceDir);

    const pdfDoc = await PDFDocument.create();

    for (const filename of slides) {
        console.log("Processing:", filename)
        const image = await loadSlide(join(sourceDir, filename));
        const embeddedImage = await pdfDoc.embedJpg(image);

        // A4 Landscape
        const page = pdfDoc.addPage([841.89, 595.28]);
        const pageWidth = page.getWidth();
        const pageHeight = page.getHeight();

        let imageDims = embeddedImage.scale(1);
        const ratio = pageWidth / imageDims.width;
        imageDims = embeddedImage.scale(ratio);

        page.drawImage(embeddedImage, {
            x: pageWidth / 2 - imageDims.width / 2,
            y: pageHeight / 2 - imageDims.height / 2,
            width: imageDims.width,
            height: imageDims.height,
        });
    }

    const pdfBytes = await pdfDoc.save();
    // const buffer = Buffer.from(pdfBytes);
    const handle = await open(join(destDir, "document.pdf"), "w");
    const {bytesWritten} = await handle.write(pdfBytes);
    console.log("Wrote:", bytesWritten, "bytes");
    await handle.close();
}

await main();