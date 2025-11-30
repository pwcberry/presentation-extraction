import {join, resolve} from "node:path";
import {open, readdir} from "node:fs/promises";
import sharp from "sharp";

async function convertToJpeg(image) {
    return await sharp(image)
        .jpeg({quality: 95})
        .toBuffer();
}

async function loadSlide(filename) {
    const handle = await open(filename, "r");
    const buffer = await handle.readFile();
    await handle.close();
    return buffer;
}

async function saveImage(path, image) {
    const handle = await open(path, "w");
    const {bytesWritten} = await handle.write(image);
    console.log("Wrote:", bytesWritten, "image bytes");
    await handle.close();
}

async function main() {
    const sourceDir = resolve(import.meta.dirname, "./data/slides")
    const destDir = resolve(import.meta.dirname, "./data");
    const slides = await readdir(sourceDir);

    for (const filename of slides) {
        const image = await loadSlide(join(sourceDir, filename));
        const jpeg = await convertToJpeg(image);
        await saveImage(join(sourceDir, filename.replace(".webp", ".jpg")), jpeg);
    }
}

await main();
