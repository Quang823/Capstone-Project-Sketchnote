export const uploadToCloudinary = async (fileUri) => {
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Missing Cloudinary configuration. Please check .env file");
  }

  const formData = new FormData();
  
  // Determine file type from URI
  const fileType = fileUri.match(/\.(jpg|jpeg|png|gif)$/i);
  const mimeType = fileType 
    ? `image/${fileType[1].toLowerCase()}` 
    : "image/jpeg";

  formData.append("file", {
    uri: fileUri,
    type: mimeType,
    name: `upload_${Date.now()}.${fileType ? fileType[1] : 'jpg'}`,
  });
  formData.append("upload_preset", UPLOAD_PRESET);
  
  // Add folder to organize images (optional)
  formData.append("folder", "sketchnote_avatars");

  try {
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        // Không cần set Content-Type header, FormData tự động xử lý
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || `Upload failed: ${response.status}`);
    }

    if (data.secure_url) {
      return data;
    } else {
      throw new Error("Failed to get URL from Cloudinary");
    }
  } catch (err) {
    console.error("Upload error:", err);
    
    // Provide more detailed error messages
    if (err.message.includes("Network")) {
      throw new Error("Network error. Please check your internet connection");
    } else if (err.message.includes("Upload preset")) {
      throw new Error("Invalid Cloudinary configuration. Check UPLOAD_PRESET");
    } else {
      throw new Error(err.message || "Error uploading image");
    }
  }
};