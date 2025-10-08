export const uploadToCloudinary = async (fileUri) => {
  const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  
  console.log("Starting upload to Cloudinary...");
  console.log("CLOUD_NAME:", CLOUD_NAME);
  console.log("UPLOAD_PRESET:", UPLOAD_PRESET);
  console.log("File URI:", fileUri);

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Thiếu cấu hình Cloudinary. Vui lòng kiểm tra file .env");
  }

  const formData = new FormData();
  
  // Xác định loại file từ URI
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
  
  // Thêm folder để tổ chức ảnh (tùy chọn)
  formData.append("folder", "sketchnote_avatars");

  try {
    console.log("Sending request to Cloudinary...");
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
        // Không cần set Content-Type header, FormData tự động xử lý
      }
    );

    const data = await response.json();
    console.log("Cloudinary response:", data);

    if (!response.ok) {
      throw new Error(data.error?.message || `Upload failed: ${response.status}`);
    }

    if (data.secure_url) {
      console.log("Upload successful:", data.secure_url);
      return data;
    } else {
      throw new Error("Không nhận được URL từ Cloudinary");
    }
  } catch (err) {
    console.error("Upload error:", err);
    
    // Cung cấp thông báo lỗi chi tiết hơn
    if (err.message.includes("Network")) {
      throw new Error("Lỗi kết nối mạng. Vui lòng kiểm tra internet");
    } else if (err.message.includes("Upload preset")) {
      throw new Error("Cấu hình Cloudinary không đúng. Kiểm tra UPLOAD_PRESET");
    } else {
      throw new Error(err.message || "Lỗi khi upload ảnh");
    }
  }
};