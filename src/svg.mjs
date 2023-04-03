import FormData from "form-data";

const {API_URL} = process.env;

const containerSize = 100;

export const container = (content = "", size = containerSize) => {
    return [
        `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">`,
        content,
        `</svg>`
    ].join(`\r\n`);
}

export const circle = (color = "black", size = 50) => {
    const offset = containerSize / 2;
    return container(`<circle cx="${offset}" cy="${offset}" r="${size}" fill="${color.toLowerCase()}"/>`);
}

export const square = (color = "black", size = 100) => {
    const offset = (containerSize - size) / 2;
    return container(`<rect width="${size}" height="${size}" x="${offset}" y="${offset}" fill="${color.toLowerCase()}"/>`);
}

export const round = (color = "black", size = 100) => {
    const radius = size / 2;
    const offset = (containerSize - size) / 2;
    return container(`<rect width="${size}" height="${size}" x="${offset}" y="${offset}" rx="${radius}" fill="${color.toLowerCase()}"/>`);
}

export const convert = (svg = "") => {
    const form = new FormData();
    const options = {
        filename: "sticker.svg",
        contentType: "image/svg+xml"
    };
    form.append("file", svg, options);
    return new Promise((resolve, reject) => form.submit(API_URL, (err, res) => {
        const chunks = [];
        res.on("data", chunks.push.bind(chunks));
        res.on("end", () => {
            const data = Buffer.concat(chunks);
            if (res.statusCode === 200) return resolve(data);
            let error;
            try {
                error = JSON.parse(data).error;
            } catch {
                error = {message: res.statusMessage};
            } finally {
                reject(error);
            }
        });
    }));
}

export const shapes = {
    square,
    "square 3/4": color => square(color, 75),
    "square 1/2": color => square(color, 50),
    round,
    "round 3/4": color => round(color, 75),
    "round 1/2": color => round(color, 50),
    circle,
    "circle 3/4": color => circle(color, 37.5),
    "circle 1/2": color => circle(color, 25),
}
