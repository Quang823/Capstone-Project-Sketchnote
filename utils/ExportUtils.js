import * as FileSystem from "expo-file-system";
import { Platform } from "react-native";
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

async function exportToPdf(canvasRef, fileName, quality = 90) {
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

    // Đổi tên file theo tên người dùng nhập
    let safeName = String(fileName || "Untitled").trim();
    safeName = safeName.replace(/[^a-zA-Z0-9._-]+/g, "_");
    if (!safeName.toLowerCase().endsWith(".pdf")) safeName += ".pdf";
    const dest =
      (FileSystem.documentDirectory || FileSystem.cacheDirectory) + safeName;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      return dest;
    } catch (e) {
      return uri;
    }
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
      fileUri = await exportToPdf(canvasRef, fileName, options.quality || 90);
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
  fileName = "Untitled",
  selectedPageNumbers = [],
  quality = 90,
  pageOrientation = "portrait"
) {
  try {
    if (!Array.isArray(pagesData) || pagesData.length === 0) {
      throw new Error("No pages to export.");
    }

    const shouldInclude = (num) =>
      !Array.isArray(selectedPageNumbers) || selectedPageNumbers.length === 0
        ? true
        : selectedPageNumbers.includes(Number(num));

    const pagesToExport = pagesData.filter((p) => shouldInclude(p?.pageNumber));
    if (pagesToExport.length === 0) {
      throw new Error("No matching pages to export.");
    }

    const imagesBase64 = [];
    for (const page of pagesToExport) {
      const pid = page?.pageId;
      const ref = pid != null ? pageRefs[pid] : null;
      if (!ref || typeof ref.getSnapshot !== "function") continue;

      const img = await ref.getSnapshot();
      if (!img) continue;

      const b64 = img.encodeToBase64(
        ImageFormat.JPEG,
        Math.max(1, Math.min(100, quality))
      );
      imagesBase64.push(b64);
    }

    if (imagesBase64.length === 0) {
      throw new Error("Failed to capture any page images.");
    }

    const isLandscape = String(pageOrientation).toLowerCase() === "landscape";
    const widthPts = isLandscape ? 842 : 595;
    const heightPts = isLandscape ? 595 : 842;

    const htmlContent = imagesBase64
      .map((b64, idx) => {
        const isLast = idx === imagesBase64.length - 1;
        const pageStyle = `width:${widthPts}pt;height:${heightPts}pt;${!isLast ? "page-break-after: always;" : ""
          }`;
        const imgStyle =
          "width:100%;height:100%;display:block;object-fit:contain;";
        return `<div style="${pageStyle}"><img src="data:image/jpeg;base64,${b64}" style="${imgStyle}" /></div>`;
      })
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /><style>
      @page { margin: 0; size: A4 ${isLandscape ? "landscape" : "portrait"}; }
      body { margin: 0; padding: 0; }
    </style></head><body>${htmlContent}</body></html>`;

    // Tạo file PDF tạm
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    // Đổi tên file theo tên người dùng nhập
    let safeName = String(fileName || "Untitled").trim();
    safeName = safeName.replace(/[^a-zA-Z0-9._-]+/g, "_");
    if (!safeName.toLowerCase().endsWith(".pdf")) safeName += ".pdf";
    const dest =
      (FileSystem.documentDirectory || FileSystem.cacheDirectory) + safeName;
    let finalDest = dest;
    try {
      await FileSystem.copyAsync({ from: uri, to: dest });
      finalDest = dest;
    } catch (e) {
      finalDest = uri;
    }

    // SAF logic removed - handled in DrawingScreen
    return finalDest;
  } catch (error) {
    console.error("exportPagesToPdf failed:", error);
    throw error;
  }
}
