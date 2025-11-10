import * as FileSystem from "expo-file-system";

export async function saveStrokesToJSON(allPages) {
  try {
    // allPages: mảng các trang, mỗi trang là mảng strokes
    const json = JSON.stringify(allPages, null, 2);
    const fileUri = FileSystem.documentDirectory + `drawing-${Date.now()}.json`;

    await FileSystem.writeAsStringAsync(fileUri, json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    return fileUri;
  } catch (e) {
    console.error("saveStrokesToJSON error:", e);
    throw e;
  }
}
