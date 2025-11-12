import streamifier from "streamifier";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string
});

export const cloudinaryUpload = (fileBuffer: Buffer, folder: string): Promise<{ secure_url: string; public_id: string }> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image"
            },
            (error, result) => {
                if (error) return reject(error);
                if (!result) return reject(new Error("Upload failed"));
                resolve({
                    secure_url: result.secure_url,
                    public_id: result.public_id
                });
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
};