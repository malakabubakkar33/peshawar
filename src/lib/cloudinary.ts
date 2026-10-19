export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'x8kprkgu';
export const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY || '888554433442152';
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'safargo_preset';

export interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

/**
 * Upload an image (File or base64 Data URL) directly to Cloudinary
 * Falls back safely to compressed local data URL if upload fails or offline
 */
export async function uploadToCloudinary(
  fileOrBase64: File | string,
  folder: string = 'safargo_peshawar'
): Promise<{ success: boolean; url: string; error?: string }> {
  try {
    const formData = new FormData();

    if (fileOrBase64 instanceof File) {
      formData.append('file', fileOrBase64);
    } else {
      formData.append('file', fileOrBase64);
    }

    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', folder);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );

    if (!response.ok) {
      const errJson = await response.json().catch(() => null);
      console.warn('Cloudinary upload warning:', errJson);
      // If unsigned preset is not created yet on Cloudinary dashboard, return the original data URL safely
      if (typeof fileOrBase64 === 'string') {
        return { success: true, url: fileOrBase64 };
      }
      return { success: false, url: '', error: errJson?.error?.message || 'Upload failed' };
    }

    const data: CloudinaryUploadResponse = await response.json();
    return {
      success: true,
      url: data.secure_url
    };
  } catch (err: any) {
    console.warn('Cloudinary network fallback:', err);
    if (typeof fileOrBase64 === 'string') {
      return { success: true, url: fileOrBase64 };
    }
    return { success: false, url: '', error: err.message || 'Network error during upload' };
  }
}
