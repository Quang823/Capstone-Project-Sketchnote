// components/drawing/canvas/GestureHandler.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Alert,
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  isInsidePage,
  makePathFromPoints,
  getBoundingBoxForStroke,
  pointInPolygon,
} from "./utils";
import { detectShape, buildShape } from "./ShapeDetector";

export default function GestureHandler({
  page,
  tool,
  eraserMode, // ✅ pixel | stroke | object
  strokes,
  setStrokes,
  currentPoints,
  setCurrentPoints,
  setRedoStack,
  color,
  strokeWidth,
  pencilWidth,
  eraserSize,
  brushWidth,
  brushOpacity,
  calligraphyWidth,
  calligraphyOpacity,
  configByTool = {},
  onAddStroke,
  onModifyStroke,
  onDeleteStroke,
  children,
}) {
  const liveRef = useRef([]);
  const rafScheduled = useRef(false);
  const lastEraserPointRef = useRef(null);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });

  const [promptVisible, setPromptVisible] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [promptMeta, setPromptMeta] = useState({
    x: 0,
    y: 0,
    toolType: "text",
  });
  const [selectedId, setSelectedId] = useState(null);

  // Debug log
  // useEffect(() => {
  //   console.log("[GestureHandler] tool:", tool, "| eraserMode:", eraserMode);
  // }, [tool, eraserMode]);

  // ========= TEXT HANDLING =========
  const addTextStroke = (x, y, toolType, text) => {
    const newTextStroke = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      tool: toolType,
      x,
      y,
      text,
      color,
      fontSize: toolType === "sticky" ? 16 : toolType === "comment" ? 14 : 18,
      backgroundColor:
        toolType === "sticky"
          ? "#FFEB3B"
          : toolType === "comment"
          ? "#E3F2FD"
          : "transparent",
      padding: toolType === "sticky" || toolType === "comment" ? 8 : 0,
    };
    setStrokes((prev) => [...prev, newTextStroke]);
    setRedoStack([]);
  };

  const showTextInputDialog = (x, y, toolType) => {
    if (Platform.OS === "ios" && Alert.prompt) {
      Alert.prompt(
        "Thêm ghi chú",
        `Nhập nội dung tại (${Math.round(x)}, ${Math.round(y)})`,
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "OK",
            onPress: (text) =>
              text && addTextStroke(x, y, toolType, text.trim()),
          },
        ],
        "plain-text",
        ""
      );
      return;
    }
    setPromptMeta({ x, y, toolType });
    setPromptText("");
    setPromptVisible(true);
  };

  const hitTestText = (x, y, strokes) => {
    for (let i = strokes.length - 1; i >= 0; i--) {
      const s = strokes[i];
      if (["text", "sticky", "comment"].includes(s.tool)) {
        const w =
          (s.text?.length || 1) * (s.fontSize || 18) * 0.6 +
          (s.padding || 0) * 2;
        const h = (s.fontSize || 18) + (s.padding || 0) * 2;
        if (
          x >= s.x - (s.padding || 0) &&
          x <= s.x - (s.padding || 0) + w &&
          y <= s.y &&
          y >= s.y - h
        ) {
          return s;
        }
      }
    }
    return null;
  };

  // ========= GESTURE =========
  const pan = Gesture.Pan()
    .runOnJS(true)
    .onStart((e) => {
      if (!isInsidePage(e.x, e.y, page)) {
        liveRef.current = [];
        setCurrentPoints([]);
        return;
      }
      /** 🟨 TEXT ADD / EDIT **/
      if (["text", "sticky", "comment"].includes(tool)) {
        const hit = hitTestText(e.x, e.y, strokes);
        if (hit) {
          setPromptMeta({ ...hit, toolType: hit.tool });
          setPromptText(hit.text);
          setPromptVisible(true);
          setSelectedId(hit.id);
        } else {
          showTextInputDialog(e.x, e.y, tool);
        }
        return;
      }

      /** 🟦 MOVE TEXT **/
      if (tool === "move-text") {
        const hit = hitTestText(e.x, e.y, strokes);
        if (hit) {
          setSelectedId(hit.id);
          dragOffsetRef.current = { dx: e.x - hit.x, dy: e.y - hit.y };
        }
        return;
      }

      /** 🧽 ERASER SETUP **/
      if (
        tool === "eraser" &&
        ["pixel", "stroke", "object"].includes(eraserMode)
      ) {
        lastEraserPointRef.current = { x: e.x, y: e.y };
      }

      /** 🧾 OBJECT ERASER TAP **/
      if (eraserMode === "object") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            e.x >= bbox.minX &&
            e.x <= bbox.maxX &&
            e.y >= bbox.minY &&
            e.y <= bbox.maxY
          ) {
            onDeleteStroke?.(i);
            return;
          }
        }
      }

      /** 🩶 STROKE ERASER **/
      if (eraserMode === "stroke") {
        for (let i = strokes.length - 1; i >= 0; i--) {
          const s = strokes[i];
          if (!s.points) continue;
          const near = s.points.some((p) => {
            const dx = p.x - e.x;
            const dy = p.y - e.y;
            return Math.sqrt(dx * dx + dy * dy) <= (s.width || 6) + 4;
          });
          if (near) {
            onDeleteStroke?.(i);
            return;
          }
        }
      }

      // Otherwise start drawing
      liveRef.current = [{ x: e.x, y: e.y }];
      setCurrentPoints(liveRef.current);
    })

    .onUpdate((e) => {
      if (!isInsidePage(e.x, e.y, page)) {
        liveRef.current = [];
        setCurrentPoints([]);
        return;
      }
      /** 🟦 MOVE TEXT **/
      if (tool === "move-text" && selectedId) {
        setStrokes((prev) =>
          prev.map((s) =>
            s.id === selectedId
              ? {
                  ...s,
                  x: e.x - dragOffsetRef.current.dx,
                  y: e.y - dragOffsetRef.current.dy,
                }
              : s
          )
        );
        return;
      }

      /** 🧾 OBJECT ERASER LASSO **/
      if (eraserMode === "object") {
        const last = liveRef.current.at(-1) || { x: 0, y: 0 };
        const dx = e.x - last.x;
        const dy = e.y - last.y;
        if (dx * dx + dy * dy < 9) return;
        liveRef.current.push({ x: e.x, y: e.y });
        if (!rafScheduled.current) {
          rafScheduled.current = true;
          requestAnimationFrame(() => {
            rafScheduled.current = false;
            setCurrentPoints([...liveRef.current]);
          });
        }
        return;
      }

      /** 🧽 PAINT-LIKE ERASER (draw over white) **/
      if (tool === "eraser" && eraserMode === "pixel") {
        const last = liveRef.current.at(-1);
        const dx = e.x - (last?.x ?? e.x);
        const dy = e.y - (last?.y ?? e.y);
        if (dx * dx + dy * dy < 9) return;

        liveRef.current.push({ x: e.x, y: e.y });
        setCurrentPoints([...liveRef.current]);
        return;
      }

      /** ✏️ DRAW **/
      const last = liveRef.current.at(-1) || { x: 0, y: 0 };
      const dx = e.x - last.x;
      const dy = e.y - last.y;
      if (dx * dx + dy * dy < 9) return;
      liveRef.current.push({ x: e.x, y: e.y });
      if (!rafScheduled.current) {
        rafScheduled.current = true;
        requestAnimationFrame(() => {
          rafScheduled.current = false;
          setCurrentPoints([...liveRef.current]);
        });
      }
    })

    .onEnd(() => {
      setSelectedId(null);
      const finalPoints = liveRef.current;
      liveRef.current = [];
      setCurrentPoints([]);

      /** 🧾 OBJECT ERASER POLYGON **/
      if (eraserMode === "object" && finalPoints.length > 2) {
        const poly = finalPoints;
        setStrokes((prev) => {
          const next = [];
          for (let i = 0; i < prev.length; i++) {
            const s = prev[i];
            const bbox = getBoundingBoxForStroke(s);
            if (!bbox) continue;
            const cx = (bbox.minX + bbox.maxX) / 2;
            const cy = (bbox.minY + bbox.maxY) / 2;
            if (pointInPolygon(poly, cx, cy)) {
              setRedoStack((redo) => [...redo, { stroke: s, index: i }]);
              continue;
            }
            next.push(s);
          }
          return next;
        });
        return;
      }

      /** 🧽 PAINT-LIKE ERASER END **/
      if (
        tool === "eraser" &&
        eraserMode === "pixel" &&
        finalPoints.length > 0
      ) {
        const newStroke = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
          tool: "eraser",
          width: eraserSize,
          points: finalPoints,
        };
        setStrokes((prev) => [...prev, newStroke]);
        setRedoStack([]);
        setCurrentPoints([]);
        return;
      }

      /** 🟢 FILL TOOL **/
      if (tool === "fill") {
        const tapX = finalPoints[0]?.x;
        const tapY = finalPoints[0]?.y;
        for (let i = 0; i < strokes.length; i++) {
          const s = strokes[i];
          const bbox = getBoundingBoxForStroke(s);
          if (
            bbox &&
            tapX >= bbox.minX &&
            tapX <= bbox.maxX &&
            tapY >= bbox.minY &&
            tapY <= bbox.maxY
          ) {
            onModifyStroke?.(i, { fill: true, fillColor: color });
            break;
          }
        }
        return;
      }

      /** ✏️ DRAW END **/
      const w =
        {
          pen: strokeWidth,
          pencil: pencilWidth,
          brush: brushWidth,
          calligraphy: calligraphyWidth,
          highlighter: strokeWidth * 2,
          eraser: eraserSize,
        }[tool] ?? strokeWidth;

      const toolConfig = configByTool[tool] || {
        pressure: 0.5,
        thickness: 1,
        stabilization: 0.2,
      };

      const newStroke = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
        tool,
        color,
        width: w,
        points: finalPoints,
        opacity:
          tool === "brush"
            ? brushOpacity
            : tool === "calligraphy"
            ? calligraphyOpacity
            : 1,
        ...toolConfig,
      };

      // Ngăn không cho eraser vẽ stroke
      // 🖋️ Chỉ thêm stroke nếu không phải đang dùng eraser
      if (tool !== "eraser") {
        if (typeof onAddStroke === "function") onAddStroke(newStroke);
        else {
          setStrokes((prev) => [...prev, newStroke]);
          setRedoStack([]);
        }
      }
    });

  // ========= RENDER =========
  return (
    <>
      <GestureDetector gesture={pan}>{children}</GestureDetector>

      {/* Text Prompt Modal */}
      <Modal
        visible={promptVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPromptVisible(false)}
      >
        <View style={styles.backdrop}>
          <View style={styles.box}>
            <Text style={styles.title}>
              {promptMeta.toolType === "sticky"
                ? "Sticky Note"
                : promptMeta.toolType === "comment"
                ? "Comment"
                : "Text"}
            </Text>
            <Text style={styles.hint}>
              ({Math.round(promptMeta.x)}, {Math.round(promptMeta.y)})
            </Text>
            <TextInput
              value={promptText}
              onChangeText={setPromptText}
              placeholder="Nhập nội dung..."
              multiline
              style={styles.input}
            />
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.btn, styles.cancel]}
                onPress={() => {
                  setPromptVisible(false);
                  setPromptText("");
                  setSelectedId(null);
                }}
              >
                <Text style={styles.btnText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.ok]}
                onPress={() => {
                  const text = (promptText || "").trim();
                  if (!text) return setPromptVisible(false);
                  if (selectedId) {
                    setStrokes((prev) =>
                      prev.map((s) =>
                        s.id === selectedId ? { ...s, text } : s
                      )
                    );
                  } else {
                    addTextStroke(
                      promptMeta.x,
                      promptMeta.y,
                      promptMeta.toolType,
                      text
                    );
                  }
                  setPromptVisible(false);
                  setPromptText("");
                  setSelectedId(null);
                }}
              >
                <Text style={[styles.btnText, { color: "#fff" }]}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

// ========= Styles =========
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  box: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
  },
  title: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
  hint: { fontSize: 12, color: "#6B7280", marginBottom: 8 },
  input: {
    minHeight: 80,
    maxHeight: 160,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
    marginBottom: 12,
  },
  row: { flexDirection: "row", justifyContent: "flex-end", gap: 8 },
  btn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  cancel: { backgroundColor: "#F3F4F6" },
  ok: { backgroundColor: "#2563EB" },
  btnText: { fontSize: 14, color: "#111827" },
});
