// utils/ExportUtils.js
import * as FileSystem from "expo-file-system";

export async function saveStrokesToJSON(strokes) {
  const uri = FileSystem.documentDirectory + "drawing.json";
  const json = JSON.stringify(strokes, null, 2);
  await FileSystem.writeAsStringAsync(uri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return uri;
}

export async function loadStrokesFromJSON() {
  const uri = FileSystem.documentDirectory + "drawing.json";
  const exists = await FileSystem.getInfoAsync(uri);
  if (!exists.exists) return null;
  const json = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return JSON.parse(json);
}

export async function savePNGBase64ToFile(base64) {
  const uri = FileSystem.cacheDirectory + `sketch_${Date.now()}.png`;
  await FileSystem.writeAsStringAsync(uri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return uri;
}
