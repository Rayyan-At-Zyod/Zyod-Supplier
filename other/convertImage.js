import fetch from "node-fetch";

async function convertImageToBase64(url) {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    console.log('====================== base 64 ======================')
    console.log(base64);
}

convertImageToBase64("https://zyod-bucket.s3.ap-south-1.amazonaws.com/1731657756386_8196_public%20%281%29.webp");
