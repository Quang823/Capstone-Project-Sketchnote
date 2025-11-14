import * as FileSystem from "expo-file-system";
import { Skia, ImageFormat } from "@shopify/react-native-skia";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

// Helper: build a safe destination URI in a writable directory
function buildDestUri(fileName) {
  const baseDir = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;
  if (!baseDir) {
    throw new Error("No writable directory available (document/cache).");
  }
  const normalized = baseDir.endsWith("/") ? baseDir : baseDir + "/";
  return normalized + fileName;
}

export async function saveStrokesToJSON(allPages) {
  try {
    // allPages: mảng các trang, mỗi trang là mảng strokes
    const json = JSON.stringify(allPages, null, 2);
    const fileUri = FileSystem.documentDirectory + `drawing-${Date.now()}.json`;

    // Dùng API mới với File class
    const file = new FileSystem.File(fileUri);
    await file.create();
    await file.write(json, FileSystem.EncodingType.UTF8);

    return fileUri;
  } catch (e) {
    console.error("saveStrokesToJSON error:", e);
    throw e;
  }
}

async function getCanvasSnapshot(canvasRef, format = "png", quality = 100) {
  if (!canvasRef.current) {
    throw new Error("Canvas reference is not available.");
  }

  const image = await canvasRef.current.getSnapshot();
  if (!image) {
    throw new Error("Failed to create image snapshot.");
  }

  if (format === "base64") {
    return image.encodeToBase64(ImageFormat.PNG, quality);
  }

  const tempUri =
    FileSystem.cacheDirectory + `snapshot_${Date.now()}.${format}`;
  const data = image.encodeToBase64(
    format === "png" ? ImageFormat.PNG : ImageFormat.JPEG,
    quality
  );

  // Ghi dữ liệu base64 bằng File API mới
  const file = new FileSystem.File(tempUri);
  await file.create();
  await file.write(data, FileSystem.EncodingType.Base64);

  return tempUri;
}

async function exportToPdf(canvasRef, fileName) {
  try {
    // Chụp canvas ra ảnh PNG
    const imageUri = await getCanvasSnapshot(canvasRef, "png");

    // Đọc file Base64 bằng File API mới
    const imageFile = new FileSystem.File(imageUri);
    const imageAsset = await imageFile.read(FileSystem.EncodingType.Base64);

    // Tạo HTML cho PDF
    const html = `
      <html>
        <head>
          <style>
            @page { margin: 0; }
            body { margin: 0; }
            img { width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${imageAsset}" />
        </body>
      </html>
    `;

    // Xuất file PDF tạm
    const { uri } = await Print.printToFileAsync({
      html,
      width: 595, // A4 width (points)
      height: 842, // A4 height (points)
    });

    // Trả về trực tiếp URI tạm của file PDF
    const pdfUri = uri;
    return pdfUri;
  } catch (error) {
    console.error("Failed to export to PDF:", error);
    throw error;
  }
}

export async function handleExport(options, canvasRef) {
  if (!canvasRef.current) {
    alert("Error: Canvas is not available for export.");
    return;
  }

  try {
    let fileUri;
    const { selected, fileName, includeBg } = options;

    if (selected === "picture") {
      fileUri = await getCanvasSnapshot(canvasRef, "png");
    } else if (selected === "editable" || selected === "noneditable") {
      fileUri = await exportToPdf(canvasRef, fileName);
    } else {
      alert(`Export format "${selected}" is not supported yet.`);
      return;
    }

    if (fileUri) {
      await Sharing.shareAsync(fileUri, {
        mimeType: selected === "picture" ? "image/png" : "application/pdf",
        dialogTitle: "Share your creation",
      });
    }
  } catch (error) {
    console.error("Export failed:", error);
    alert(`Export failed: ${error.message}`);
  }
}

export async function exportPagesToPdf(
  pagesData = [],
  pageRefs = {},
  fileName = "Untitled"
) {
  try {
    if (!Array.isArray(pagesData) || pagesData.length === 0) {
      throw new Error("No pages to export.");
    }

    const imagesBase64 = [];
    for (const page of pagesData) {
      const pid = page?.pageId;
      const ref = pid != null ? pageRefs[pid] : null;
      if (!ref || typeof ref.getSnapshot !== "function") continue;

      const img = await ref.getSnapshot();
      if (!img) continue;

      const b64 = img.encodeToBase64(ImageFormat.PNG, 100);
      imagesBase64.push(b64);
    }

    if (imagesBase64.length === 0) {
      throw new Error("Failed to capture any page images.");
    }

    const htmlContent = imagesBase64
      .map(
        (b64) => `
          <div style="page-break-after: always; width: 100%; height: 100%; margin: 0; padding: 0;">
            <img src="data:image/png;base64,${b64}" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
        `
      )
      .join("");

    const html = `<html><body style="margin: 0; padding: 0;">${htmlContent}</body></html>`;

    // Tạo file PDF tạm
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    // Trả về trực tiếp URI tạm của file PDF
    const pdfUri = uri;
    return pdfUri;
  } catch (error) {
    console.error("exportPagesToPdf failed:", error);
    throw error;
  }
}
