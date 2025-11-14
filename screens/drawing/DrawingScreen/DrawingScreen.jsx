import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useDeferredValue,
} from "react";
import {
  View,
  Alert,
  TextInput,
  Image,
  Button,
  Dimensions,
  ActivityIndicator,
  Text,
  findNodeHandle,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import HeaderToolbar from "../../../components/drawing/toolbar/HeaderToolbar";
import ToolbarContainer from "../../../components/drawing/toolbar/ToolbarContainer";
import MultiPageCanvas from "../../../components/drawing/canvas/MultiPageCanvas";
import RulerOverlay from "../../../components/drawing/ruler/RulerOverlay";
import StickerModal from "../../../components/drawing/media/StickerModal";
import LayerPanel from "../../../components/drawing/layer/LayerPanel";
import PenSettingsPanel from "../../../components/drawing/toolbar/PenSettingsPanel";
import EraserDropdown from "../../../components/drawing/toolbar/EraserDropdown";
import NetInfo from "@react-native-community/netinfo";
import useOrientation from "../../../hooks/useOrientation";
import { useNavigation } from "@react-navigation/native";
import { exportPagesToPdf } from "../../../utils/ExportUtils";
import ExportModal from "../../../components/drawing/modal/ExportModal";
import { projectService } from "../../../service/projectService";
import styles from "./DrawingScreen.styles";
import * as offlineStorage from "../../../utils/offlineStorage";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { uploadToCloudinary } from "../../../service/cloudinary";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { useToast } from "../../../hooks/use-toast";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
// Hàm helper để lấy kích thước hình ảnh
const getImageSize = (uri) => {
  return new Promise((resolve, reject) => {
    if (!uri) {
      reject(new Error("Invalid URI"));
      return;
    }
    const timeout = setTimeout(() => {
      reject(new Error("Image.getSize timed out"));
    }, 5000);

    Image.getSize(
      uri,
      (width, height) => {
        clearTimeout(timeout);
        resolve({ width, height });
      },
      (error) => {
        clearTimeout(timeout);
        reject(error);
      },
    );
  });
};

export default function DrawingScreen({ route }) {
  const navigation = useNavigation();
  const noteConfig = route?.params?.noteConfig;
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const { toast } = useToast();
  const multiPageCanvasContainerRef = useRef(null);
  // ✅ Validate noteConfig to prevent crash
  useEffect(() => {
    if (!noteConfig) {
      console.warn("[DrawingScreen] No noteConfig provided, navigating back");
      Alert.alert(
        "Error",
        "No project configuration found. Please create a new project.",
        [
          {
            text: "OK",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    }
  }, [noteConfig, navigation]);

  // LAYERS - Per-page layer management
  const [showLayerPanel, setShowLayerPanel] = useState(false);

  // Helper function to get page ID (consistent with MultiPageCanvas logic)
  // Note: This is a pure function, not a hook, so it can be used in useState initializer
  const getPageId = (page) => {
    if (!page) return 1;
    // ✅ Nếu pageNumber === 1, đó là cover page, luôn dùng id = 1
    if (page.pageNumber === 1) return 1;
    // Paper pages: dùng pageId từ API hoặc pageNumber + 10000
    if (page.pageId) return Number(page.pageId);
    if (page.pageNumber) return Number(page.pageNumber) + 10000;
    return 1;
  };

  // Initialize activePageId and pageLayers from noteConfig
  const [activePageId, setActivePageId] = useState(() => {
    if (!noteConfig) return 1;

    // Nếu có cover page, cover có id = 1
    if (noteConfig.hasCover) {
      return 1;
    }

    // Nếu có pages từ API, lấy page đầu tiên
    if (noteConfig.pages?.length > 0) {
      const firstPage = noteConfig.pages[0];
      return getPageId(firstPage);
    }

    // Fallback
    return 1;
  });

  const [pageLayers, setPageLayers] = useState(() => {
    const initialLayers = {};

    // Nếu có cover page, khởi tạo layer cho cover (id = 1)
    if (noteConfig?.hasCover) {
      initialLayers[1] = [
        { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
      ];
    }

    // Khởi tạo layers cho các paper pages
    if (noteConfig?.pages?.length > 0) {
      noteConfig.pages.forEach((page) => {
        const pageId = getPageId(page);
        if (!initialLayers[pageId]) {
          initialLayers[pageId] = [
            { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
          ];
        }
      });
    } else if (!noteConfig?.hasCover) {
      // Fallback: nếu không có pages và không có cover, tạo page mặc định
      initialLayers[1] = [
        { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
      ];
    }

    return initialLayers;
  });

  const [activeLayerId, setActiveLayerId] = useState("layer1");
  const [layerCounter, setLayerCounter] = useState(2);

  const sanitizeStroke = useCallback((stroke) => {
    if (!stroke || typeof stroke !== "object") return null;

    const safe = { ...stroke };

    safe.id =
      typeof stroke.id === "string" && stroke.id.trim()
        ? stroke.id
        : `stroke-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const clampNumber = (value, fallback = 0, min = -100000, max = 100000) => {
      if (!Number.isFinite(value)) return fallback;
      if (value < min) return min;
      if (value > max) return max;
      return value;
    };

    safe.x = clampNumber(stroke.x, 0);
    safe.y = clampNumber(stroke.y, 0);
    safe.width = clampNumber(stroke.width, 0);
    safe.height = clampNumber(stroke.height, 0);
    safe.rotation = clampNumber(stroke.rotation, 0, -360, 360);
    safe.opacity = clampNumber(stroke.opacity, 1, 0, 1);
    safe.layerId =
      typeof stroke.layerId === "string" && stroke.layerId.trim()
        ? stroke.layerId
        : "layer1";

    // Handle shape-specific properties
    if (safe.fill === true) {
      safe.fillColor =
        typeof safe.fillColor === "string" ? safe.fillColor : "#000000";
      safe.shape = typeof safe.shape === "object" ? safe.shape : {};
    }

    if (Array.isArray(stroke.points)) {
      const safePoints = stroke.points
        .map((p) => {
          const px = clampNumber(p?.x, safe.x);
          const py = clampNumber(p?.y, safe.y);
          if (!Number.isFinite(px) || !Number.isFinite(py)) return null;
          return {
            x: px,
            y: py,
            pressure: clampNumber(p?.pressure, 0.5, 0, 1),
            thickness: clampNumber(p?.thickness, 1, 0.01, 20),
            stabilization: clampNumber(p?.stabilization, 0, 0, 1),
          };
        })
        .filter(Boolean);

      if (safePoints.length >= 2) {
        safe.points = safePoints;
      } else {
        delete safe.points;
      }
    }

    if (
      safe.tool === "text" ||
      safe.tool === "sticky" ||
      safe.tool === "comment"
    ) {
      safe.text = typeof stroke.text === "string" ? stroke.text : "";
      safe.fontSize = clampNumber(stroke.fontSize, 18, 6, 200);
      safe.padding = clampNumber(stroke.padding, 6, 0, 100);
      safe.color = typeof stroke.color === "string" ? stroke.color : "#000";
    }

    if (safe.tool === "image" || safe.tool === "sticker") {
      safe.uri = typeof stroke.uri === "string" ? stroke.uri : null;
      if (!safe.uri) return null;
    }

    return safe;
  }, []);

  // Ensure layers exist for active page when page changes
  useEffect(() => {
    setPageLayers((prev) => {
      if (!prev[activePageId]) {
        return {
          ...prev,
          [activePageId]: [
            { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
          ],
        };
      }
      return prev;
    });
  }, [activePageId]);

  // Track previous activePageId to detect page changes
  const prevActivePageIdRef = useRef(activePageId);
  const isMountedRef = useRef(true);

  // ✅ Cleanup khi component unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Clear layer select timeout
      if (layerSelectTimeoutRef.current) {
        clearTimeout(layerSelectTimeoutRef.current);
        layerSelectTimeoutRef.current = null;
      }
    };
  }, []);

  // Reset active layer when page changes (after layers are ensured to exist)
  useEffect(() => {
    // Chỉ reset khi page thực sự thay đổi
    if (prevActivePageIdRef.current !== activePageId) {
      prevActivePageIdRef.current = activePageId;

      // Đợi một chút để đảm bảo pageLayers đã được update từ useEffect trước
      const timer = setTimeout(() => {
        // ✅ Kiểm tra component còn mount không
        if (!isMountedRef.current) return;

        const currentPageLayers = pageLayers[activePageId] || [];
        if (currentPageLayers.length > 0) {
          // Always reset to first layer when switching pages
          const firstLayerId = currentPageLayers[0]?.id;
          if (firstLayerId) {
            setActiveLayerId(firstLayerId);
          } else {
            // Fallback: nếu không có id, set layer1
            setActiveLayerId("layer1");
          }
        } else {
          // Fallback: nếu vẫn chưa có layers, set layer1
          setActiveLayerId("layer1");
        }
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [activePageId, pageLayers]); // ✅ Include pageLayers để đảm bảo có dữ liệu mới nhất

  // Get layers for active page - use useMemo to ensure it updates when pageLayers changes
  const currentLayers = useMemo(() => {
    return (
      pageLayers[activePageId] || [
        { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
      ]
    );
  }, [pageLayers, activePageId]);

  // ✅ Đảm bảo activeLayerId luôn hợp lệ khi layers thay đổi
  useEffect(() => {
    if (!isMountedRef.current) return;

    const currentPageLayers = pageLayers[activePageId] || [];

    // Nếu không có layers, tạo layer mặc định
    if (currentPageLayers.length === 0) {
      setPageLayers((prev) => ({
        ...prev,
        [activePageId]: [
          { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
        ],
      }));
      setActiveLayerId("layer1");
      return;
    }

    // Kiểm tra activeLayerId có tồn tại trong layers không
    const layerExists = currentPageLayers.some((l) => l?.id === activeLayerId);

    if (!layerExists) {
      // Nếu activeLayerId không tồn tại, set về layer đầu tiên
      const firstLayerId = currentPageLayers[0]?.id;
      if (firstLayerId) {
        setActiveLayerId(firstLayerId);
      } else {
        // Fallback về layer1 nếu không có id
        setActiveLayerId("layer1");
      }
    }
  }, [pageLayers, activePageId, activeLayerId]);

  // Defer layer updates to prevent flickering in LayerPanel
  const deferredLayers = useDeferredValue(currentLayers);

  // Helper to update layers for active page
  const updateCurrentPageLayers = useCallback(
    (updater) => {
      setPageLayers((prev) => ({
        ...prev,
        [activePageId]:
          typeof updater === "function"
            ? updater(
                prev[activePageId] || [
                  { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
                ],
              )
            : updater,
      }));
    },
    [activePageId],
  );

  // Handler for adding new layer
  const handleAddLayer = useCallback(
    (pageId) => {
      const newId = `layer_${Date.now()}`;
      const newLayer = {
        id: newId,
        name: `Layer ${layerCounter}`,
        visible: true,
        locked: false,
        strokes: [],
      };
      setLayerCounter((c) => c + 1);

      // Directly update pageLayers for the active page
      setPageLayers((prev) => {
        const currentPageLayers = prev[pageId] || [
          { id: "layer1", name: "Layer 1", visible: true, strokes: [] },
        ];
        return {
          ...prev,
          [pageId]: [...currentPageLayers, newLayer],
        };
      });
    },
    [layerCounter],
  );

  // Layer panel callbacks - memoized to prevent re-renders
  // ✅ Thêm validation và debounce để tránh crash khi chuyển layer liên tục
  const layerSelectTimeoutRef = useRef(null);
  const handleLayerSelect = useCallback(
    (id) => {
      // Clear timeout trước đó nếu có
      if (layerSelectTimeoutRef.current) {
        clearTimeout(layerSelectTimeoutRef.current);
      }

      // ✅ Validate layer ID
      if (!id || typeof id !== "string") {
        console.warn("[DrawingScreen] handleLayerSelect: Invalid layer ID");
        return;
      }

      // ✅ Kiểm tra layer có tồn tại trong currentLayers không
      const currentLayers = pageLayers[activePageId] || [];
      const layerExists = currentLayers.some((l) => l?.id === id);

      if (!layerExists) {
        console.warn(
          `[DrawingScreen] handleLayerSelect: Layer ${id} not found in page ${activePageId}`,
        );
        // Fallback về layer đầu tiên nếu layer không tồn tại
        if (currentLayers.length > 0) {
          const firstLayerId = currentLayers[0].id;
          setActiveLayerId(firstLayerId);
        }
        return;
      }

      // ✅ Debounce để tránh chuyển layer quá nhanh (có thể gây crash)
      layerSelectTimeoutRef.current = setTimeout(() => {
        setActiveLayerId(id);
        layerSelectTimeoutRef.current = null;
      }, 50); // 50ms debounce
    },
    [pageLayers, activePageId],
  );

  const handleToggleVisibility = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)),
      );
    },
    [updateCurrentPageLayers],
  );

  const handleToggleLock = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
      );
    },
    [updateCurrentPageLayers],
  );

  const handleLayerAdd = useCallback(() => {
    handleAddLayer(activePageId);
  }, [handleAddLayer, activePageId]);

  const handleLayerDelete = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) => prev.filter((l) => l.id !== id));
    },
    [updateCurrentPageLayers],
  );

  const handleLayerRename = useCallback(
    (id, newName) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: newName } : l)),
      );
    },
    [updateCurrentPageLayers],
  );

  const handleCloseLayerPanel = useCallback(() => setShowLayerPanel(false), []);

  // TOOL VISIBILITY
  const [toolbarVisible, setToolbarVisible] = useState(true);

  // 🎨 ===== TOOL & COLOR =====
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("#111827");

  // 🎨 ===== EYEDROPPER PICKED COLORS =====
  const [pickedColors, setPickedColors] = useState([]);
  const handleColorPicked = useCallback((colorHex) => {
    if (colorHex && colorHex !== "#000000" && colorHex !== "#111827") {
      setPickedColors((prev) => {
        const filtered = prev.filter((c) => c !== colorHex);
        return [colorHex, ...filtered].slice(0, 10);
      });
    }
  }, []);

  // 🆕 ===== NEW TOOLS STATE =====
  // Grid
  const [gridVisible, setGridVisible] = useState(false);
  const [gridSettings, setGridSettings] = useState({
    gridSize: 20,
    gridColor: "#cbd5e1",
    gridType: "square",
  });
  const [gridDropdownVisible, setGridDropdownVisible] = useState(false);

  // 📏 RULER
  const [rulerVisible, setRulerVisible] = useState(false);
  const [rulerPosition, setRulerPosition] = useState(null);

  // ✏️ ===== WIDTH & OPACITY =====
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [pencilWidth] = useState(1.5);
  const [brushWidth] = useState(4);
  const [brushOpacity] = useState(0.45);
  const [calligraphyWidth] = useState(3);
  const [calligraphyOpacity] = useState(0.8);

  // 📏 Per-pen base widths (persist while switching tools)
  const [penBaseWidths, setPenBaseWidths] = useState({
    pen: 2,
    pencil: 2,
    brush: 4,
    calligraphy: 3,
    highlighter: 4,
    marker: 4,
    airbrush: 4,
    crayon: 2,
  });

  // 🧾 ===== PAGE & STYLE =====
  const [paperStyle] = useState("plain");
  const [shapeType] = useState("auto");
  const [editingText, setEditingText] = useState(null);

  // ⚙️ ===== TOOL CONFIGS =====
  const [toolConfigs, setToolConfigs] = useState({
    pen: { pressure: 0.5, thickness: 1.5, stabilization: 0.2 },
    pencil: { pressure: 0.4, thickness: 1.0, stabilization: 0.15 },
    brush: {
      pressure: 0.6,
      thickness: 3.0,
      stabilization: 0.25,
      brushSoftness: 0.28,
    },
    calligraphy: {
      pressure: 0.7,
      thickness: 2.5,
      stabilization: 0.3,
      calligraphyAngle: 0.6,
    },
    highlighter: { pressure: 0.5, thickness: 4.0, stabilization: 0.1 },
    marker: { pressure: 0.6, thickness: 3.0, stabilization: 0.1 },
    airbrush: {
      pressure: 0.5,
      thickness: 4.0,
      stabilization: 0.3,
      airbrushSpread: 1.6,
      airbrushDensity: 0.55,
    },
    crayon: { pressure: 0.55, thickness: 2.5, stabilization: 0.2 },
  });

  const activeConfig = useMemo(
    () =>
      toolConfigs[tool] || {
        pressure: 0.5,
        thickness: 1.0,
        stabilization: 0.2,
      },
    [tool, toolConfigs],
  );

  const handleSettingChange = useCallback((toolName, key, value) => {
    if (!toolName) return;
    setToolConfigs((prev) => ({
      ...prev,
      [toolName]: {
        ...(prev[toolName] ?? {}),
        [key]: value,
      },
    }));
  }, []);

  // 🎨 Per-tool color memory
  const penTools = useMemo(
    () => [
      "pen",
      "pencil",
      "brush",
      "calligraphy",
      "highlighter",
      "marker",
      "airbrush",
      "crayon",
    ],
    [],
  );
  const shapeTools = useMemo(
    () => ["line", "arrow", "rect", "circle", "triangle", "star", "polygon"],
    [],
  );
  const [penColors, setPenColors] = useState({
    pen: "#111827",
    pencil: "#111827",
    brush: "#111827",
    calligraphy: "#111827",
    highlighter: "#fef08a",
    marker: "#111827",
    airbrush: "#111827",
    crayon: "#111827",
  });
  const [shapeColors, setShapeColors] = useState({
    line: "#111827",
    arrow: "#111827",
    rect: "#111827",
    circle: "#111827",
    triangle: "#111827",
    star: "#111827",
    polygon: "#111827",
  });

  // Restore color only when switching tools
  useEffect(() => {
    if (penTools.includes(tool)) {
      const saved = penColors[tool];
      if (typeof saved === "string") setColor(saved);
    } else if (shapeTools.includes(tool)) {
      const saved = shapeColors[tool];
      if (typeof saved === "string") setColor(saved);
    }
  }, [tool]);

  // Store color per-tool when it changes on an active pen/shape tool
  useEffect(() => {
    if (typeof color !== "string") return;
    if (penTools.includes(tool)) {
      setPenColors((prev) =>
        prev[tool] === color ? prev : { ...prev, [tool]: color },
      );
    } else if (shapeTools.includes(tool)) {
      setShapeColors((prev) =>
        prev[tool] === color ? prev : { ...prev, [tool]: color },
      );
    }
  }, [tool, color]);

  // 📱 ===== ORIENTATION =====
  const orientation = useOrientation();

  // 🗒 ===== PAGE REFS (undo / redo / clear) =====
  const pageRefs = useRef({});
  const registerPageRef = useCallback((id, ref) => {
    if (ref) pageRefs.current[id] = ref;
  }, []);

  const handleUndo = useCallback((id) => pageRefs.current[id]?.undo?.(), []);
  const handleRedo = useCallback((id) => pageRefs.current[id]?.redo?.(), []);
  const handleClear = useCallback((id) => pageRefs.current[id]?.clear?.(), []);

  // 🧽 ===== ERASER STATES =====
  const [eraserMode, setEraserMode] = useState("pixel");
  const [eraserSize, setEraserSize] = useState(20);
  const [eraserDropdownVisible, setEraserDropdownVisible] = useState(false);
  const eraserButtonRef = useRef(null);

  // 🖼 ===== IMAGE & STICKER =====
  const [stickerModalVisible, setStickerModalVisible] = useState(false);
  const canvasRef = useRef(null);

  const activeStrokeWidth = tool.includes("eraser") ? eraserSize : strokeWidth;
  useEffect(() => {
    if (tool !== "eraser" && eraserMode !== null) {
      setEraserMode(null);
    }
  }, [tool, eraserMode]);

  // When switching back to a pen tool, restore its last base width
  useEffect(() => {
    const penTools = [
      "pen",
      "pencil",
      "brush",
      "calligraphy",
      "highlighter",
      "marker",
      "airbrush",
      "crayon",
    ];
    if (penTools.includes(tool)) {
      const saved = penBaseWidths[tool];
      if (typeof saved === "number" && saved !== strokeWidth)
        setStrokeWidth(saved);
    }
  }, [tool, penBaseWidths, strokeWidth]);

  const handleSelectBaseWidth = useCallback(
    (size) => {
      setStrokeWidth(size);
      setPenBaseWidths((prev) => ({ ...prev, [tool]: size }));
    },
    [tool],
  );

  const multiPageCanvasRef = useRef();
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for saving indicator
  const [isUploadingAsset, setIsUploadingAsset] = useState(false); // New state for asset uploads

  // [NEW] Setup network listener for auto-sync
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        projectService.syncPendingPages();
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // 🔄 Auto-load strokes from strokeUrl when opening an existing project
  useEffect(() => {
    const controller = new AbortController();
    const rafIds = new Set();

    const loadStrokesInChunks = (pageId, allStrokes) => {
      return new Promise((resolve) => {
        if (controller.signal.aborted) {
          resolve();
          return;
        }

        const chunkSize = 50;
        let i = 0;

        const processChunk = () => {
          if (i >= allStrokes.length || controller.signal.aborted) {
            resolve();
            return;
          }

          const chunk = allStrokes.slice(i, i + chunkSize);
          const sanitizedChunk = chunk
            .map((s) => (s && typeof s === "object" ? sanitizeStroke(s) : null))
            .filter(Boolean);

          if (sanitizedChunk.length > 0) {
            multiPageCanvasRef.current?.appendStrokesToPage(
              pageId,
              sanitizedChunk,
            );
          }

          i += chunkSize;
          const rafId = requestAnimationFrame(processChunk);
          rafIds.add(rafId);
        };
        const rafId = requestAnimationFrame(processChunk);
        rafIds.add(rafId);
      });
    };

    const loadExistingStrokes = async () => {
      try {
        const projectId = noteConfig?.projectId;
        if (!projectId || controller.signal.aborted) return;

        const pagesToLoad = [];
        const firstPageFromAPI = noteConfig.pages?.[0];
        const isFirstPageCover = firstPageFromAPI?.pageNumber === 1;

        if (
          noteConfig.hasCover &&
          noteConfig.cover?.strokeUrl &&
          !isFirstPageCover
        ) {
          pagesToLoad.push({
            ...noteConfig.cover,
            pageId: 1,
            pageNumber: 1,
            type: "cover",
          });
        }
        if (Array.isArray(noteConfig.pages)) {
          pagesToLoad.push(...noteConfig.pages);
        }

        if (pagesToLoad.length === 0 || !multiPageCanvasRef.current) return;
        if (controller.signal.aborted) return;

        setIsLoadingProject(true);
        await new Promise((resolve) => setTimeout(resolve, 250));
        if (controller.signal.aborted) return;

        for (const p of pagesToLoad) {
          if (controller.signal.aborted) break;
          const pageId = getPageId(p);
          if (!p?.strokeUrl) continue;

          try {
            const data = await projectService.loadPageData(
              projectId,
              p.pageNumber,
              p.strokeUrl,
              { signal: controller.signal },
            );

            if (controller.signal.aborted || !data) continue;

            multiPageCanvasRef.current?.clearPage?.(pageId);

            // ✨ FIX: Restore page template and background color
            if (data.template || data.backgroundColor) {
              multiPageCanvasRef.current?.updatePage?.(pageId, {
                template: data.template,
                backgroundColor: data.backgroundColor,
              });
            }

            if (Array.isArray(data?.layers) && data.layers.length > 0) {
              setPageLayers((prev) => {
                const existingLayers = prev[pageId] || [];
                const mergedLayers = data.layers.map((savedLayer) => {
                  const existingLayer = existingLayers.find(
                    (l) => l?.id === savedLayer.id,
                  );
                  return {
                    id: savedLayer.id,
                    name:
                      savedLayer.name ||
                      existingLayer?.name ||
                      `Layer ${savedLayer.id}`,
                    visible:
                      savedLayer.visible !== undefined
                        ? savedLayer.visible
                        : existingLayer?.visible !== false,
                    locked:
                      savedLayer.locked !== undefined
                        ? savedLayer.locked
                        : existingLayer?.locked === true,
                    strokes: [],
                  };
                });
                return { ...prev, [pageId]: mergedLayers };
              });
            }

            const rawStrokes = Array.isArray(data?.strokes) ? data.strokes : [];
            if (rawStrokes.length > 0) {
              await loadStrokesInChunks(pageId, rawStrokes);
            }
          } catch (e) {
            if (e.name !== "AbortError") {
              console.error(
                `❌ Load page ${p.pageNumber} failed:`,
                e?.message || e,
              );
            }
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") {
          console.error("[DrawingScreen] Auto-load error:", e);
          if (!controller.signal.aborted) {
            Alert.alert(
              "Lỗi",
              "Không thể tải dữ liệu project. Vui lòng thử lại.",
            );
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingProject(false);
        }
      }
    };

    loadExistingStrokes();

    return () => {
      controller.abort();
      rafIds.forEach((id) => cancelAnimationFrame(id));
    };
  }, [noteConfig?.projectId, sanitizeStroke]);

  // [REWRITTEN] 💾 SAVE with offline support
  const handleSaveFile = async () => {
    if (isSaving) {
      toast({
        title: "Saving...",
        description: "The saving process is in progress. Please wait.",
        variant: "default",
      });

      return;
    }

    if (!multiPageCanvasRef.current?.getAllPagesData) {
      toast({
        title: "Error",
        description: "Unable to retrieve drawing data. Please try again.",
        variant: "destructive",
      });
      return;
    }

    if (!noteConfig?.projectId) {
      toast({
        title: "Error",
        description: "Project ID not found. Unable to save.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    const pagesData = multiPageCanvasRef.current.getAllPagesData();
    if (!pagesData || pagesData.length === 0) {
      toast({
        title: "Notice",
        description: "No data available to save.",
        variant: "default", // hoặc "info" nếu component hỗ trợ
      });
      setIsSaving(false);
      return;
    }

    try {
      // Save all pages locally
      for (const page of pagesData) {
        const localKey = `${noteConfig.projectId}_page_${page.pageNumber}`;
        await offlineStorage.saveProjectLocally(localKey, page.dataObject);
      }

      toast({
        title: "Saved Locally",
        description: "All pages have been saved to your device.",
        variant: "default",
      });
    } catch (localSaveError) {
      console.error("❌ [DrawingScreen] Error saving locally:", localSaveError);
      toast({
        title: "Storage Error",
        description: "Unable to save data to the device storage.",
        variant: "destructive",
      });
      setIsSaving(false);
      return;
    }

    // Check network status
    const netState = await NetInfo.fetch();
    if (!netState.isConnected || !netState.isInternetReachable) {
      toast({
        title: "Saved Offline",
        description:
          "Your data has been saved locally. It will sync when you're online.",
        variant: "default",
      });
      setIsSaving(false);
      // TODO: Add pages to a persistent sync queue if needed
      return;
    }
    // 4. If online, proceed with sync
    try {
      const uploadPromises = pagesData.map((page) =>
        projectService.uploadPageToS3(
          noteConfig.projectId,
          page.pageNumber,
          page.dataObject,
        ),
      );

      const uploadedPagesResults = await Promise.all(uploadPromises);

      const finalPayload = {
        projectId: noteConfig.projectId,
        pages: uploadedPagesResults.map((result) => ({
          pageNumber: result.pageNumber,
          strokeUrl: result.url,
        })),
      };

      await projectService.createPage(finalPayload);

      toast({
        title: "Success!",
        description:
          "Your project has been saved and synchronized successfully.",
        variant: "default",
      });
    } catch (syncError) {
      console.error("❌ [DrawingScreen] Sync failed:", syncError);
      toast({
        title: "Sync Failed",
        description:
          "Your data is safe locally. We'll try syncing again later.",
        variant: "destructive",
      });
      // TODO: Add pages to a persistent sync queue if sync fails
    } finally {
      setIsSaving(false);
    }
  };

  // 📤 EXPORT (local PDF/PNG)
  const handleExportFile = async (options) => {
    setExportModalVisible(false);

    // --- PICTURE EXPORT ---
    if (options.selected === "picture") {
      if (!multiPageCanvasContainerRef.current) {
        toast.show({
          title: "Lỗi",
          description: "Không thể xuất file. Không tìm thấy canvas.",
          variant: "error",
        });
        return;
      }
      try {
        const uri = await captureRef(multiPageCanvasContainerRef.current, {
          format: "png",
          quality: 1,
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Chia sẻ bản vẽ",
          });
        } else {
          toast.show({
            title: "Không thể chia sẻ",
            description: "Chức năng chia sẻ không có sẵn trên thiết bị này.",
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Lỗi xuất file ảnh:", error);
        toast.show({
          title: "Xuất Ảnh Thất Bại",
          description: "Đã có lỗi xảy ra khi xuất file ảnh.",
          variant: "error",
        });
      }
    }
    // --- STARNOTE (JSON) EXPORT ---
    else if (options.selected === "starnote") {
      try {
        const pagesData = await multiPageCanvasRef.current.getAllPagesData();
        if (!pagesData || pagesData.length === 0) {
          toast.show({
            title: "Không có dữ liệu",
            description: "Không có nội dung để xuất file.",
            variant: "info",
          });
          return;
        }

        const projectData = {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          noteConfig: noteConfig,
          pages: pagesData.map((p) => p.dataObject),
        };

        const jsonString = JSON.stringify(projectData, null, 2);
        const fileName = `${options.fileName || "Untitled"}.starnote`;
        const uri = FileSystem.documentDirectory + fileName.replace(/\s/g, "_");

        await FileSystem.writeAsStringAsync(uri, jsonString, {
          encoding: "utf8",
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/json",
            dialogTitle: "Chia sẻ file StarNote",
          });
        } else {
          toast.show({
            title: "Không thể chia sẻ",
            description: "Chức năng chia sẻ không có sẵn trên thiết bị này.",
            variant: "error",
          });
        }
      } catch (error) {
        console.error("Lỗi xuất file StarNote:", error);
        toast.show({
          title: "Xuất StarNote Thất Bại",
          description: "Đã có lỗi xảy ra khi xuất file.",
          variant: "error",
        });
      }
    }
    // --- PDF EXPORT (using expo-print) ---
    else if (
      options.selected === "noneditable" ||
      options.selected === "editable"
    ) {
      if (options.selected === "editable") {
        toast.show({
          title: "Thông báo",
          description:
            "Xuất file PDF có thể chỉnh sửa hiện chưa được hỗ trợ. Một file PDF đa trang dạng ảnh sẽ được tạo.",
          variant: "info",
        });
      }

      setIsSaving(true);
      try {
        const pagesData = multiPageCanvasRef.current?.getAllPagesData?.();
        if (!pagesData || pagesData.length === 0) {
          toast.show({
            title: "Không có dữ liệu",
            description: "Không có trang nào để xuất file.",
            variant: "info",
          });
          setIsSaving(false);
          return;
        }
        // Use Skia snapshots for reliable per-page capture
        const pdfPath = await exportPagesToPdf(
          pagesData,
          pageRefs.current,
          options.fileName,
        );

        await Sharing.shareAsync(pdfPath, {
          mimeType: "application/pdf",
          dialogTitle: "Chia sẻ file PDF",
        });
      } catch (error) {
        console.error("Lỗi xuất file PDF đa trang:", error);
        toast.show({
          title: "Xuất PDF Thất Bại",
          description: "Đã có lỗi xảy ra khi xuất file PDF.",
          variant: "error",
        });
      } finally {
        setIsSaving(false);
      }
    }
    // --- OTHER/DEFAULT ---
    else {
      toast.show({
        title: "Chức năng chưa được hỗ trợ",
        description: `Chức năng xuất file sang định dạng ${options.selected} hiện chưa được hỗ trợ.`,
        variant: "info",
      });
    }
  };

  // [REWRITTEN] 🖼 ===== INSERT IMAGE FROM GALLERY (with upload) =====
  const handleInsertImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        exif: true,
      });
      // console.log("result", result);
      if (result.canceled) return;

      let localUri = result.assets?.[0]?.uri;
      if (!localUri) return;

      setIsUploadingAsset(true);

      // Correct orientation based on EXIF data
      let size = {
        width: result.assets[0].width,
        height: result.assets[0].height,
      };
      const orientation = result.assets[0].exif?.Orientation || 1;
      if (orientation > 1) {
        const manipResult = await manipulateAsync(
          localUri,
          [{ rotate: 0 }], // No-op to just get orientation fixed
          { compress: 0.9, format: SaveFormat.JPEG },
        );
        localUri = manipResult.uri;
        size = { width: manipResult.width, height: manipResult.height };
      }

      // Upload the corrected image
      // console.log(`☁️ Uploading ${localUri} to Cloudinary...`);
      const cloudinaryResponse = await uploadToCloudinary(localUri);
      const cloudUrl = cloudinaryResponse.secure_url;
      //  console.log("✅ Uploaded to Cloudinary, URL:", cloudUrl);

      if (!cloudUrl) {
        throw new Error(
          "Upload to Cloudinary succeeded but no secure_url was returned.",
        );
      }

      // Calculate final dimensions for the canvas
      const currentZoom = multiPageCanvasRef.current?.getCurrentZoom?.() || 1;
      const screenWidth = Dimensions.get("window").width;
      const maxImageWidth = Math.min((screenWidth * 0.5) / currentZoom, 400);
      const scale = Math.min(1, maxImageWidth / size.width);
      const finalWidth = size.width * scale;
      const finalHeight = size.height * scale;

      // Add the stroke with the cloud URL
      multiPageCanvasRef.current.addImageStroke({
        uri: cloudUrl,
        x: 100,
        y: 100,
        width: finalWidth,
        height: finalHeight,
      });
    } catch (err) {
      Alert.alert("Lỗi", "Không thể chèn ảnh: " + err.message);
    } finally {
      setIsUploadingAsset(false);
    }
  };

  // 📸 ===== OPEN CAMERA =====
  const handleOpenCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission required", "Camera access is needed.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
      });
      if (!result.canceled) {
        const localUri = result.assets[0].uri;

        setIsUploadingAsset(true);
        const cloudUrl = await projectService.uploadAsset(
          localUri,
          "image/jpeg",
        );
        if (!cloudUrl) {
          throw new Error("Failed to upload image from camera.");
        }

        const { width: imgWidth, height: imgHeight } = result.assets[0];
        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / imgWidth);

        multiPageCanvasRef.current.addImageStroke({
          uri: cloudUrl,
          x: 100,
          y: 100,
          width: imgWidth * scale,
          height: imgHeight * scale,
        });
      }
    } catch (e) {
      Alert.alert("Lỗi Camera", e.message || String(e));
    } finally {
      setIsUploadingAsset(false);
    }
  }, []);

  // [REWRITTEN] 😄 ===== STICKER (with upload for image stickers) =====
  const handleStickerSelect = useCallback(async (data) => {
    setStickerModalVisible(false);
    if (!data) {
      Alert.alert("Error", "Invalid sticker data");
      return;
    }

    const { tool, uri, text, fontFamily, fontSize } = data;

    try {
      // Sticker is an image from a local URI that needs to be uploaded
      if (tool === "sticker" && uri && !uri.startsWith("http")) {
        setIsUploadingAsset(true);
        const cloudUrl = await projectService.uploadAsset(uri, "image/png"); // Assuming stickers are png
        if (!cloudUrl) {
          throw new Error("Failed to upload sticker.");
        }

        const { width: imgWidth, height: imgHeight } = await getImageSize(uri);
        const maxWidth = 150; // Stickers are smaller
        const scale = Math.min(1, maxWidth / imgWidth);

        multiPageCanvasRef.current.addStickerStroke({
          tool: "sticker",
          uri: cloudUrl,
          width: imgWidth * scale,
          height: imgHeight * scale,
        });
        return;
      }

      // Sticker is already a URL (Lottie file or remote image)
      if (
        (tool === "sticker" || tool === "lottie") &&
        uri &&
        uri.startsWith("http")
      ) {
        multiPageCanvasRef.current.addStickerStroke({
          tool,
          uri,
          width: 120,
          height: 120,
        });
        return;
      }

      // Sticker is an Emoji (text-based)
      if (tool === "emoji" && text) {
        multiPageCanvasRef.current.addTextStroke({
          tool: "emoji",
          text,
          fontFamily: fontFamily || "NotoColorEmoji-Regular",
          fontSize: fontSize || 36,
          color: "#000",
          padding: 8,
        });
        return;
      }
    } catch (err) {
      Alert.alert("Lỗi", "Không thể thêm sticker: " + err.message);
    } finally {
      setIsUploadingAsset(false);
    }
  }, []);

  // 🧱 ===== RENDER =====
  // ✅ Early return if noteConfig is missing
  if (!noteConfig) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        {/* Empty view - Alert will show and navigate back */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Loading Overlay */}
      {(isLoadingProject || isSaving || isUploadingAsset) && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 14,
              alignItems: "center",
            }}
          >
            <LottieView
              source={loadingAnimation}
              autoPlay
              loop
              style={{ width: 150, height: 100 }}
            />
            <Text style={{ fontSize: 16, color: "#374151" }}>
              {isSaving
                ? "Saving..."
                : isUploadingAsset
                  ? "Uploading asset..."
                  : "Loading project..."}
            </Text>
          </View>
        </View>
      )}
      {/* 🧰 Header Toolbar */}
      <HeaderToolbar
        onBack={() => navigation.navigate("Home")}
        onToggleToolbar={() => setToolbarVisible((v) => !v)}
        onPreview={() => {}} // Sidebar đã tích hợp trong MultiPageCanvas
        onCamera={handleOpenCamera}
        onToggleLayerPanel={() => setShowLayerPanel((v) => !v)}
        isLayerPanelVisible={showLayerPanel}
        onExportPress={() => setExportModalVisible(true)}
      />
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onExport={handleExportFile}
      />
      {showLayerPanel && (
        <LayerPanel
          layers={Array.isArray(deferredLayers) ? deferredLayers : []}
          activeLayerId={activeLayerId}
          onSelect={handleLayerSelect}
          onToggleVisibility={handleToggleVisibility}
          onToggleLock={handleToggleLock}
          onAdd={handleLayerAdd}
          onDelete={handleLayerDelete}
          onRename={handleLayerRename}
          onClose={handleCloseLayerPanel}
        />
      )}
      {/* 🎨 Main Toolbar */}
      {toolbarVisible && (
        <ToolbarContainer
          tool={tool}
          setTool={(name) => {
            if (name === "ruler") {
              // Toggle ruler overlay without changing current drawing tool
              setRulerVisible((prev) => {
                const next = !prev;
                return next;
              });
              if (!rulerPosition) {
                setRulerPosition({
                  x: 0,
                  y: 120,
                  width: undefined,
                  height: 60,
                  rotation: 0,
                  scale: 1,
                });
              }
              return;
            }
            setTool(name);
            if (name === "image") handleInsertImage();
            else if (name === "camera") handleOpenCamera();
            else if (name === "sticker") setStickerModalVisible(true);
            else if (name === "grid") setGridDropdownVisible(true);
            else if (name === "eyedropper") {
              // handled in GestureHandler
            }
          }}
          color={color}
          setColor={setColor}
          strokeWidth={strokeWidth}
          setStrokeWidth={setStrokeWidth}
          onSelectBaseWidth={handleSelectBaseWidth}
          onUndo={() => handleUndo(activePageId)}
          onRedo={() => handleRedo(activePageId)}
          onClear={() => handleClear(activePageId)}
          onSaveFile={handleSaveFile}
          onSyncFile={() => projectService.syncPendingPages()} // Pass the sync function
          onExportPDF={() => handleExportFile("pdf")} // Thêm nút export PDF
          eraserMode={eraserMode}
          setEraserMode={setEraserMode}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          eraserDropdownVisible={eraserDropdownVisible}
          setEraserDropdownVisible={setEraserDropdownVisible}
          eraserButtonRef={eraserButtonRef}
          pickedColors={pickedColors}
          onColorPicked={handleColorPicked}
          onInsertTable={(rows, cols) => {
            // Insert table vào canvas
            multiPageCanvasRef.current?.insertTable?.(rows, cols);
          }}
        />
      )}
      {/* 🧽 Eraser Dropdown */}
      {eraserDropdownVisible && (
        <EraserDropdown
          visible={eraserDropdownVisible}
          from={eraserButtonRef}
          eraserMode={eraserMode}
          setEraserMode={(mode) => {
            setEraserMode(mode);
            setTool("eraser");
          }}
          eraserSize={eraserSize}
          setEraserSize={setEraserSize}
          onClose={() => setEraserDropdownVisible(false)}
        />
      )}

      {/* 🖋 Pen Settings */}
      {[
        "pen",
        "pencil",
        "brush",
        "calligraphy",
        "highlighter",
        "marker",
        "airbrush",
        "crayon",
      ].includes(tool) && (
        <PenSettingsPanel
          tool={tool}
          setTool={setTool}
          config={activeConfig}
          onSettingChange={handleSettingChange}
          visible={true}
        />
      )}

      {/* 🧾 Canvas */}
      <View
        style={{ flex: 1 }}
        ref={multiPageCanvasContainerRef}
        collapsable={false}
      >
        <MultiPageCanvas
          ref={multiPageCanvasRef}
          noteConfig={noteConfig}
          activePageId={activePageId}
          setActivePageId={setActivePageId}
          pageLayers={pageLayers}
          setPageLayers={setPageLayers}
          activeLayerId={activeLayerId}
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
          strokeWidth={activeStrokeWidth}
          pencilWidth={pencilWidth}
          eraserSize={eraserSize}
          eraserMode={eraserMode}
          brushWidth={brushWidth}
          brushOpacity={brushOpacity}
          calligraphyWidth={calligraphyWidth}
          calligraphyOpacity={calligraphyOpacity}
          paperStyle={paperStyle}
          shapeType={shapeType}
          pressure={activeConfig.pressure}
          thickness={activeConfig.thickness}
          stabilization={activeConfig.stabilization}
          toolConfigs={toolConfigs}
          rulerPosition={rulerPosition}
          registerPageRef={registerPageRef}
          onActivePageChange={setActivePageId}
          onColorPicked={handleColorPicked}
          onRequestTextInput={(x, y) => {
            if (tool === "text") {
              setTimeout(() => setEditingText({ x, y, text: "" }), 0);
            }
          }}
        />

        <RulerOverlay
          visible={rulerVisible}
          position={rulerPosition}
          onChange={(pos) => setRulerPosition(pos)}
        />

        <StickerModal
          visible={stickerModalVisible}
          onClose={() => setStickerModalVisible(false)}
          onSelect={handleStickerSelect}
        />
      </View>

      {/* 📝 Text Input Overlay */}
      {editingText && (
        <TextInput
          style={{
            position: "absolute",
            top: editingText.y,
            left: editingText.x,
            minWidth: 40,
            borderWidth: 1,
            borderColor: "blue",
            padding: 4,
            fontSize: 18,
            color,
            backgroundColor: "white",
          }}
          autoFocus
          value={editingText.text}
          onChangeText={(t) => setEditingText({ ...editingText, text: t })}
          onBlur={() => {
            if (editingText.text.trim()) {
              const newStroke = {
                id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
                tool: tool,
                x: editingText.x,
                y: editingText.y + 18,
                text: editingText.text.trim(),
                color,
                fontSize: 18,
                padding: 6,
              };
              pageRefs.current[activePageId]?.addStrokeDirect?.(newStroke);
            }
            setEditingText(null);
          }}
        />
      )}
    </View>
  );
}
