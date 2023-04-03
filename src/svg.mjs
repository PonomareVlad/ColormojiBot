import FormData from "form-data";

const {API_URL} = process.env;

export const container = (content = "") => {
    return [
        `<svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">`,
        content,
        `</svg>`
    ].join(`\r\n`);
}

export const circle = (color = "black") => container(`<circle cx="50" cy="50" r="50" fill="${color}"/>`);

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
    circle,
}
