const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = "image";

    if (file.mimetype.startsWith("video/")) {
      resourceType = "video";
    }

    return {
      folder: "socialhub_posts",
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "gif", "mp4", "mov", "webm"]
    };
  }
});

module.exports = {
  cloudinary,
  storage
};