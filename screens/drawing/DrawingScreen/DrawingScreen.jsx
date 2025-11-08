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

import useOrientation from "../../../hooks/useOrientation";
import { useNavigation } from "@react-navigation/native";
import * as ExportUtils from "../../../utils/ExportUtils";
import { projectService } from "../../../service/projectService";
import styles from "./DrawingScreen.styles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
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
      }
    );
  });
};

export default function DrawingScreen({ route }) {
  const navigation = useNavigation();
  const noteConfig = route?.params?.noteConfig;

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
        ]
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
        // Initialize layers for new page
        // console.log(
        //   `[DrawingScreen] Initializing layers for pageId: ${activePageId}`
        // );
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

  // Reset active layer when page changes (after layers are ensured to exist)
  useEffect(() => {
    // Chỉ reset khi page thực sự thay đổi
    if (prevActivePageIdRef.current !== activePageId) {
      prevActivePageIdRef.current = activePageId;

      // Đợi một chút để đảm bảo pageLayers đã được update từ useEffect trước
      const timer = setTimeout(() => {
        const currentPageLayers = pageLayers[activePageId] || [];
        if (currentPageLayers.length > 0) {
          // Always reset to first layer when switching pages
          const firstLayerId = currentPageLayers[0].id;
          setActiveLayerId(firstLayerId);
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
                ]
              )
            : updater,
      }));
    },
    [activePageId]
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
    [layerCounter]
  );

  // Layer panel callbacks - memoized to prevent re-renders
  const handleLayerSelect = useCallback((id) => setActiveLayerId(id), []);

  const handleToggleVisibility = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
      );
    },
    [updateCurrentPageLayers]
  );

  const handleToggleLock = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l))
      );
    },
    [updateCurrentPageLayers]
  );

  const handleLayerAdd = useCallback(() => {
    handleAddLayer(activePageId);
  }, [handleAddLayer, activePageId]);

  const handleLayerDelete = useCallback(
    (id) => {
      updateCurrentPageLayers((prev) => prev.filter((l) => l.id !== id));
    },
    [updateCurrentPageLayers]
  );

  const handleLayerRename = useCallback(
    (id, newName) => {
      updateCurrentPageLayers((prev) =>
        prev.map((l) => (l.id === id ? { ...l, name: newName } : l))
      );
    },
    [updateCurrentPageLayers]
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
    [tool, toolConfigs]
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
    []
  );
  const shapeTools = useMemo(
    () => ["line", "arrow", "rect", "circle", "triangle", "star", "polygon"],
    []
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
        prev[tool] === color ? prev : { ...prev, [tool]: color }
      );
    } else if (shapeTools.includes(tool)) {
      setShapeColors((prev) =>
        prev[tool] === color ? prev : { ...prev, [tool]: color }
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
    [tool]
  );

  const multiPageCanvasRef = useRef();
  const [isLoadingProject, setIsLoadingProject] = useState(false);

  // 🔄 Auto-load strokes from strokeUrl when opening an existing project
  useEffect(() => {
    let isMounted = true;
    const timeoutIds = [];

    const loadExistingStrokes = async () => {
      try {
        const pagesToLoad = [];

        // ✅ Kiểm tra xem page đầu tiên từ API có phải là cover không
        const firstPageFromAPI =
          Array.isArray(noteConfig?.pages) && noteConfig.pages.length > 0
            ? noteConfig.pages[0]
            : null;
        const isFirstPageCover = firstPageFromAPI?.pageNumber === 1;

        // ✅ Chỉ load cover từ noteConfig.cover nếu:
        //    - Có hasCover và cover.strokeUrl
        //    - VÀ page đầu tiên từ API KHÔNG phải là cover
        if (
          noteConfig?.hasCover &&
          noteConfig?.cover?.strokeUrl &&
          !isFirstPageCover
        ) {
          pagesToLoad.push({
            ...noteConfig.cover,
            pageId: 1,
            pageNumber: 1,
            type: "cover",
          });
        }

        // Load tất cả pages từ API (bao gồm cover nếu có)
        if (Array.isArray(noteConfig?.pages) && noteConfig.pages.length > 0) {
          pagesToLoad.push(...noteConfig.pages);
        }
        if (pagesToLoad.length === 0) return;
        if (!multiPageCanvasRef.current?.loadProjectData) return;

        if (!isMounted) return;
        setIsLoadingProject(true);

        // Đợi một chút để đảm bảo MultiPageCanvas đã mount và pageRefs đã sẵn sàng
        const delay1 = new Promise((resolve) => {
          const id = setTimeout(() => {
            if (isMounted) resolve();
          }, 800);
          timeoutIds.push(id);
        });
        await delay1;

        if (!isMounted) {
          setIsLoadingProject(false);
          return;
        }

        // Load từng page một để tránh quá tải memory
        for (const p of pagesToLoad) {
          if (!isMounted) break;

          const pageId = getPageId(p);

          if (!p?.strokeUrl) {
            continue;
          }

          try {
            // console.log(`🔄 Loading page ${p.pageNumber} from:`, p.strokeUrl);
            const data = await projectService.getProjectFile(p.strokeUrl);

            if (!isMounted) break;

            // Validate và filter strokes
            let strokes = Array.isArray(data?.strokes) ? data.strokes : [];

            // Filter out invalid strokes trước
            strokes = strokes.filter((s) => s && typeof s === "object");

            // Optimize: Filter/limit strokes có hình ảnh base64 lớn
            strokes = strokes
              .map((s) => {
                // Nếu stroke có hình ảnh base64 quá lớn, có thể skip hoặc optimize
                if (s.tool === "image" || s.tool === "sticker") {
                  if (
                    s.uri &&
                    s.uri.startsWith("data:image") &&
                    s.uri.length > 5000000
                  ) {
                    // Skip hình ảnh base64 quá lớn (>5MB) để tránh crash
                    console.warn(`⚠️ Skipping large image stroke: ${s.id}`);
                    return null;
                  }
                }
                return s;
              })
              .filter(Boolean)
              .map(sanitizeStroke)
              .filter(Boolean);

            // Giới hạn số lượng strokes để tránh crash
            if (strokes.length > 500) {
              console.warn(
                `⚠️ Page ${p.pageNumber} has ${strokes.length} strokes, limiting to 500`
              );
              strokes = strokes.slice(0, 500);
            }

            // console.log(
            //   `✅ Loaded ${strokes.length} strokes for page ${p.pageNumber}`
            // );

            if (!isMounted) break;

            // Load từng page vào canvas với retry
            // console.log(
            //   `🔄 Attempting to load page ${p.pageNumber} (id: ${pageId}) with ${strokes.length} strokes`
            // );
            let retries = 3;
            while (retries > 0 && isMounted) {
              if (multiPageCanvasRef.current?.loadProjectData) {
                try {
                  multiPageCanvasRef.current.loadProjectData({
                    pages: [{ id: pageId, strokes }],
                  });
                  // console.log(
                  //   `✅ Successfully loaded page ${p.pageNumber} (id: ${pageId})`
                  // );
                  break;
                } catch (loadError) {
                  console.error(
                    `❌ Error loading data to canvas for page ${p.pageNumber} (id: ${pageId}):`,
                    loadError?.message || loadError
                  );
                  break;
                }
              } else {
                console.warn(
                  `⚠️ loadProjectData not available, retrying... (${retries} retries left)`
                );
              }
              const delay2 = new Promise((resolve) => {
                const id = setTimeout(() => {
                  if (isMounted) resolve();
                }, 300);
                timeoutIds.push(id);
              });
              await delay2;
              retries--;
            }
            if (retries === 0 && isMounted) {
              console.error(
                `❌ Failed to load page ${p.pageNumber} (id: ${pageId}) after all retries`
              );
            }

            if (!isMounted) break;

            // Delay giữa các page để tránh quá tải
            const delay3 = new Promise((resolve) => {
              const id = setTimeout(() => {
                if (isMounted) resolve();
              }, 200);
              timeoutIds.push(id);
            });
            await delay3;
          } catch (e) {
            console.error(
              `❌ Load page ${p.pageNumber} failed:`,
              e?.message || e
            );
            // Continue với page tiếp theo thay vì dừng lại
          }
        }

        if (isMounted) {
          // console.log("✅ All pages loaded");
          setIsLoadingProject(false);
        }
      } catch (e) {
        console.error("[DrawingScreen] Auto-load error:", e);
        if (isMounted) {
          setIsLoadingProject(false);
          // Chỉ hiển thị alert nếu component vẫn còn mount
          try {
            Alert.alert(
              "Lỗi",
              "Không thể tải dữ liệu project. Vui lòng thử lại."
            );
          } catch (alertError) {
            console.error("Error showing alert:", alertError);
          }
        }
      }
    };

    loadExistingStrokes().catch((error) => {
      console.error(
        "[DrawingScreen] Unhandled promise rejection in loadExistingStrokes:",
        error
      );
      if (isMounted) {
        setIsLoadingProject(false);
      }
    });

    // ✅ Cleanup function - QUAN TRỌNG để tránh crash khi unmount
    return () => {
      isMounted = false;
      // Clear tất cả timeouts
      timeoutIds.forEach((id) => {
        if (id) clearTimeout(id);
      });
      timeoutIds.length = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteConfig?.projectId]);
  // 💾 SAVE: Presign → Upload to Cloud → Create Pages in DB
  const handleSaveFile = async () => {
    try {
      if (!multiPageCanvasRef.current?.uploadAllPages) {
        alert("❌ Không tìm thấy dữ liệu hoặc ref chưa sẵn sàng!");
        return;
      }

      // 1) Presign + Upload all pages (returns [{ pageId, url }])
      const results = await multiPageCanvasRef.current.uploadAllPages();

      if (!results || results.length === 0) {
        Alert.alert("Không có trang nào được lưu");
        return;
      }

      // 2) Persist to DB: POST /api/pages with projectId and pages list
      const payload = {
        projectId: noteConfig?.projectId,
        pages: results.map((r) => ({ pageNumber: r.pageId, strokeUrl: r.url })),
      };
      await projectService.createPage(payload);

      // 3) Save last upload locally for quick restore
      await AsyncStorage.setItem("lastUploadResults", JSON.stringify(results));

      const urls = results
        .map((r) => `• Page ${r.pageId}: ${r.url}`)
        .join("\n");
      Alert.alert("Đã lưu & ghi DB thành công!", urls);
    } catch (err) {
      console.error("❌ Lưu thất bại:", err);
      Alert.alert(
        "❌ Lưu thất bại",
        err.response?.data?.message ||
          err.message ||
          "Không thể lưu lên cloud/db"
      );
    }
  };

  const handleLoadFile = async () => {
    try {
      // 🟡 Lấy danh sách file đã upload lần gần nhất
      const savedResults = await AsyncStorage.getItem("lastUploadResults");
      if (!savedResults) {
        Alert.alert("Không tìm thấy file nào đã upload trước đó!");
        return;
      }

      const results = JSON.parse(savedResults);

      // 🔹 Lấy trang đầu tiên (hoặc bạn có thể load tất cả vòng lặp)
      const firstFile = results[0];
      if (!firstFile?.url) {
        Alert.alert("Không có URL hợp lệ để load file!");
        return;
      }

      const jsonData = await projectService.getProjectFile(firstFile.url);

      // ✅ Sanitize strokes trước khi load
      if (Array.isArray(jsonData?.strokes)) {
        jsonData.strokes = jsonData.strokes
          .map(sanitizeStroke)
          .filter(Boolean)
          .slice(0, 500);
      }

      // ✅ Load lại vào canvas
      if (multiPageCanvasRef.current?.loadProjectData) {
        multiPageCanvasRef.current.loadProjectData(jsonData);
        Alert.alert(
          "✅ Load thành công",
          `Đã hiển thị lại file ${firstFile.pageId}`
        );
      } else {
        console.warn("⚠️ MultiPageCanvas chưa có hàm loadProjectData");
      }
    } catch (err) {
      console.error("❌ Lỗi load file:", err);
      Alert.alert("Load thất bại", err.message || "Không thể tải file JSON");
    }
  };

  // 📤 EXPORT (local PDF/PNG)
  const handleExportAndSave = useCallback(async (format) => {
    try {
      const allPages = Object.values(pageRefs.current).map(
        (ref) => ref?.getStrokes?.() || []
      );
      const projectName = `Drawing_${format}_${
        new Date().toISOString().split("T")[0]
      }`;

      const { uri, type } = await projectService.exportFile(
        allPages,
        canvasRef,
        format,
        projectName
      );

      Alert.alert("✅ Export success", `File saved: ${uri}`);
    } catch (err) {
      console.error("❌ [DrawingScreen] Export error:", err);
      Alert.alert("Export Error", err.message || "Export failed");
    }
  }, []);

  // 🖼 ===== INSERT IMAGE FROM GALLERY =====
  const handleInsertImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: false,
      quality: 1,
      exif: true, // ✅ Lấy EXIF data
    });

    if (result.canceled) return; // ✅ Sửa từ cancelled thành canceled (Expo update)

    let uri = result.assets?.[0]?.uri || result.uri;
    if (!uri) return;

    try {
      let size = await getImageSize(uri);
      let orientation = result.assets?.[0]?.exif?.Orientation || 1;

      // ✅ Manipulate để apply orientation
      let actions = [];
      switch (orientation) {
        case 2:
          actions = [{ flip: FlipType.horizontal }];
          break;
        case 3:
          actions = [{ rotate: 180 }];
          break;
        case 4:
          actions = [{ flip: FlipType.vertical }];
          break;
        case 5:
          actions = [{ rotate: 90 }, { flip: FlipType.horizontal }];
          break;
        case 6:
          actions = [{ rotate: 90 }];
          break;
        case 7:
          actions = [{ rotate: -90 }, { flip: FlipType.horizontal }];
          break;
        case 8:
          actions = [{ rotate: -90 }];
          break;
        default:
          break;
      }

      if (actions.length > 0) {
        const manipulated = await manipulateAsync(uri, actions, {
          compress: 1,
          format: SaveFormat.JPEG,
        });
        uri = manipulated.uri;
        size = { width: manipulated.width, height: manipulated.height };
      }

      // ✅ Get current zoom level and page dimensions
      const currentZoom = multiPageCanvasRef.current?.getCurrentZoom?.() || 1;
      const screenWidth = Dimensions.get("window").width;

      // Calculate max image width based on zoom and page width
      // When zoomed in (e.g., 2x), image should be smaller to fit viewport
      // Max 80% of page width to prevent overflow
      const maxImageWidth = Math.min(
        (screenWidth * 0.5) / currentZoom, // Adjust for zoom
        400 // Absolute max width
      );

      const scale = Math.min(1, maxImageWidth / size.width);
      const finalWidth = size.width * scale;
      const finalHeight = size.height * scale;

      multiPageCanvasRef.current.addImageStroke({
        uri,
        x: 100,
        y: 100,
        width: finalWidth,
        height: finalHeight,
      });
    } catch (err) {
      Alert.alert("Error", "Failed to load image: " + err.message);
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
        allowsEditing: true,
        quality: 0.9,
      });
      if (!result.canceled) {
        const uri = result.assets[0].uri;
        let imgWidth, imgHeight;
        try {
          const size = await getImageSize(uri);
          imgWidth = size.width;
          imgHeight = size.height;
        } catch (error) {
          console.error("[DrawingScreen] getImageSize error:", error);
          imgWidth = 100;
          imgHeight = 100;
        }

        const maxWidth = 400;
        const scale = Math.min(1, maxWidth / imgWidth);
        const width = imgWidth * scale;
        const height = imgHeight * scale;

        const pageRef = pageRefs.current[activePageId] || canvasRef.current;
        if (pageRef?.addImageStroke) {
          pageRef.addImageStroke({
            uri,
            x: 100,
            y: 100,
            width,
            height,
          });
        } else {
          console.warn(
            "[DrawingScreen] No handler to add image stroke for page",
            activePageId
          );
        }
      }
    } catch (e) {
      Alert.alert("Camera error", e.message || String(e));
    }
  }, [activePageId]);

  // 😄 ===== STICKER =====
  const handleStickerSelect = useCallback(
    async (data) => {
      setStickerModalVisible(false);
      if (!data) {
        Alert.alert("Error", "Invalid sticker data");
        return;
      }

      const { tool, uri, text, fontFamily, fontSize } = data;
      const pageRef = pageRefs.current[activePageId] || canvasRef.current;

      if (!pageRef) {
        console.warn("[DrawingScreen] ❌ No active canvas/page found");
        Alert.alert("Error", "No active canvas available to add sticker");
        return;
      }

      // 🖼️ Static sticker (PNG/JPG)
      if (tool === "sticker" && uri) {
        try {
          const { width: imgWidth, height: imgHeight } = await getImageSize(
            uri
          );
          const maxWidth = 400;
          const scale = Math.min(1, maxWidth / imgWidth);
          const width = imgWidth * scale;
          const height = imgHeight * scale;

          const stroke = {
            id: `sticker-${Date.now()}`,
            tool: "sticker",
            uri,
            width,
            height,
            x: width / 2,
            y: height / 2,
            rotation: 0,
            selected: false,
          };

          pageRef.addStickerStroke?.(stroke);
        } catch (error) {
          console.error(
            "[DrawingScreen] getImageSize error for sticker:",
            error
          );
          Alert.alert("Error", "Failed to load sticker image");
        }
        return;
      }

      // ✨ Animated sticker (Lottie)
      if (tool === "lottie" && uri) {
        const stroke = {
          id: `lottie-${Date.now()}`,
          tool: "lottie",
          uri,
          width: 120,
          height: 120,
          x: 100,
          y: 100,
          loop: true,
        };
        pageRef.addStickerStroke?.(stroke);
        return;
      }

      // 😊 Emoji sticker (render như text nhưng tool riêng)
      if (tool === "emoji" && text) {
        const stroke = {
          id: `emoji-${Date.now()}`,
          tool: "emoji",
          text,
          fontFamily: fontFamily || "NotoColorEmoji-Regular",
          fontSize: fontSize || 36,
          color: "#000",
          x: 120,
          y: 120,
          padding: 8,
        };
        pageRef.addTextStroke?.(stroke);
        return;
      }

      console.warn("[DrawingScreen] Invalid sticker data:", data);
      Alert.alert("Error", "Invalid sticker data");
    },
    [activePageId]
  );

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
      {isLoadingProject && (
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
              padding: 24,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={{ marginTop: 12, fontSize: 16, color: "#374151" }}>
              Đang tải project...
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
                // if (__DEV__) console.log("[DrawingScreen] toggle ruler:", next);
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
              // else {
              //   if (__DEV__)
              //     console.log("[DrawingScreen] rulerPosition:", rulerPosition);
              // }
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
          onLoadCloudFile={handleLoadFile}
          onExportPDF={() => handleExportAndSave("pdf")} // Thêm nút export PDF
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
      <View style={{ flex: 1 }}>
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
