import cloudinary from '@/config/cloudinaryConfig';

interface UploadResults {
  secure_url: string;
  public_id: string;
  duration?: number;
}

export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
  resourceType: 'image' | 'video' = 'image',
): Promise<UploadResults> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: resourceType },
        (error, result) => {
          if (error || !result) return reject(error);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            duration: result.duration,
          });
        },
      )
      .end(buffer);
  });
};
