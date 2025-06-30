const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const sharp = require('sharp');


if (
  !process.env.R2_ACCOUNT_ID ||
  !process.env.R2_REGION ||
  !process.env.R2_ACCESS_KEY_ID ||
  !process.env.R2_SECRET_ACCESS_KEY ||
  !process.env.R2_BUCKET_NAME ||
  !process.env.R2_CDN_URL ||
  !process.env.R2_PUBLIC_URL
) {
  throw new Error("R2 environment variables are not set");
}

const r2 = new S3Client({
  region: process.env.R2_REGION,
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const uploadPictureFile = async (payload) => {
  const { fileName, buffer, mimetype } = payload;

  if (!fileName || !buffer || !mimetype) {
    throw new Error("File name, buffer and mimetype are required", 400);
  }

  const MAX_FILE_SIZE = 8 * 1024 * 1024;
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("Photo size exceeds 8MB limit", 400);
  }

  const isValidPhotoNameAwsUpload = (fileName) => {
    const regex = /^([a-zA-Z0-9\s\-+_!@#$%^&*(),./]+)(?:\.(jpg|png|jpeg))$/i;
    return regex.test(fileName);
  };
  if (fileName && !isValidPhotoNameAwsUpload(fileName)) {
    throw new Error("Invalid file name", 400);
  }

  let bufferFile = buffer;

  if (mimetype.includes("image")) {
    bufferFile = await sharp(buffer)
      .resize({
        height: 1920,
        width: 1080,
        fit: "contain",
      })
      .toBuffer();
  }

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: bufferFile,
    ContentType: mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await r2.send(command);
    const secureUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return { secureUrl };
  } catch (error) {
    console.log(error);
    return {
      secureUrl: "",
    };
  }
};

const uploadDocumentFile = async (payload) => {
  const { fileName, buffer, mimetype } = payload;

  if (!fileName || !buffer || !mimetype) {
    throw new Error("File name, buffer, and mimetype are required", 400);
  }

  const MAX_FILE_SIZE = 50 * 1024 * 1024;
  if (buffer.length > MAX_FILE_SIZE) {
    throw new Error("File size exceeds 50MB limit", 400);
  }

  const validDocumentTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!validDocumentTypes.includes(mimetype)) {
    throw new Error(
      "Invalid document format. Supported formats: pdf, doc, docx",
      400
    );
  }

  const uploadParams = {
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
    Body: buffer,
    ContentType: mimetype,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    await r2.send(command);

    const secureUrl = `${process.env.R2_PUBLIC_URL}/${fileName}`;

    return { secureUrl };
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading document to R2", 500);
  }
};

const extractObjectKey = (fileUrl) => {
  const match = fileUrl.match(/\.r2\.dev\/(.+)/);
  return match ? match[1] : null;
};

module.exports = {
  r2,
  uploadPictureFile,
  uploadDocumentFile,
  extractObjectKey,
};
