import cloudinary from '@/config/cloudinaryConfig';

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error || !result) return reject(error);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      })
      .end(buffer);
  });
};
