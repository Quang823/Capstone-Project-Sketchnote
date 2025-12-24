/**
 * Validate image file before upload
 * @param {Object} fileInfo - File information from ImagePicker
 * @param {string} fileInfo.uri - File URI
 * @param {number} fileInfo.fileSize - File size in bytes (optional)
 * @returns {Object} Validation result with isValid and error message
 */
const validateImageFile = (fileInfo) => {
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
  const SUPPORTED_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

  // Extract file extension
  const fileExtMatch = fileInfo.uri.match(/\.([^.]+)$/i);
  const fileExt = fileExtMatch ? fileExtMatch[1].toLowerCase() : null;

  // Validate file extension
  if (!fileExt || !SUPPORTED_FORMATS.includes(fileExt)) {
    return {
      isValid: false,
      error: `Unsupported file format. Please use: ${SUPPORTED_FORMATS.join(', ').toUpperCase()}`,
    };
  }

  // Validate file size (if available)
  if (fileInfo.fileSize && fileInfo.fileSize > MAX_SIZE) {
    const sizeMB = (fileInfo.fileSize / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File too large (${sizeMB}MB). Maximum size is 5MB.`,
    };
  }

  return { isValid: true, fileExt };
};

/**
 * Upload image to Cloudinary with proper validation and GIF support
 * @param {string} fileUri - Local file URI
 * @param {Object} fileInfo - Additional file information (optional)
 * @returns {Promise<Object>} Upload result with secure_url and metadata
 */
export const uploadToCloudinary = async (fileUri, fileInfo = {}) => {
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary configuration. Please check .env file");
  }

  // Validate file before upload
  const validation = validateImageFile({ uri: fileUri, ...fileInfo });
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const fileExt = validation.fileExt;

  // Map file extension to MIME type
  const mimeTypeMap = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  const mimeType = mimeTypeMap[fileExt] || 'image/jpeg';

  const formData = new FormData();
  formData.append("file", {
    uri: fileUri,
    type: mimeType,
    name: `avatar_${Date.now()}.${fileExt}`,
  });
  formData.append("upload_preset", UPLOAD_PRESET);

  // Organize uploads in folder
  formData.append("folder", "sketchnote_avatars");

  // For GIFs, ensure animations are preserved
  if (fileExt === 'gif') {
    formData.append("resource_type", "image");
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || `Upload failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    if (data.secure_url) {
      return {
        secure_url: data.secure_url,
        public_id: data.public_id,
        format: data.format,
        width: data.width,
        height: data.height,
        bytes: data.bytes,
      };
    } else {
      throw new Error("Failed to get URL from Cloudinary");
    }
  } catch (err) {
    console.warn("Cloudinary upload error:", err);

    // Provide user-friendly error messages
    if (err.message.includes("Network request failed")) {
      throw new Error("Network error. Please check your internet connection.");
    } else if (err.message.includes("Invalid image file")) {
      throw new Error("Invalid image file. Please select a valid image.");
    } else if (err.message.includes("Upload preset")) {
      throw new Error("Upload configuration error. Please contact support.");
    } else {
      throw new Error(err.message || "Failed to upload image. Please try again.");
    }
  }
};