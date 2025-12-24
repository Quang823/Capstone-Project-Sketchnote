import React, {
  useRef,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useDeferredValue,
  useContext,
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
  Modal,
  TouchableOpacity,
  Platform,
  LogBox, // ✅ Added for error suppression
} from "react-native";

// ✅ Suppress React warnings that are handled by our deferred setState fixes
// This is a safety net in case any third-party libraries trigger similar warnings
LogBox.ignoreLogs([
  'Cannot update a component',
  'Cannot update during an existing state transition',
]);
import * as ImagePicker from "expo-image-picker";
import HeaderToolbar from "../../../components/drawing/toolbar/HeaderToolbar";
import ToolbarContainer from "../../../components/drawing/toolbar/ToolbarContainer";
import MultiPageCanvas from "../../../components/drawing/canvas/MultiPageCanvas";
import StickerModal from "../../../components/drawing/media/StickerModal";
import LayerPanel from "../../../components/drawing/layer/LayerPanel";
import PenSettingsPanel from "../../../components/drawing/toolbar/PenSettingsPanel";
import EraserDropdown from "../../../components/drawing/toolbar/EraserDropdown";
import NetInfo from "@react-native-community/netinfo";
import useOrientation from "../../../hooks/useOrientation";
import { useNavigation } from "@react-navigation/native";
import { exportPagesToPdf } from "../../../utils/ExportUtils";
import ExportModal from "../../../components/drawing/modal/ExportModal";
import AIImageChatModal from "../../../components/drawing/modal/AIImageChatModal";
import VersionSelectionModal from "../../../components/modals/VersionSelectionModal";
import { projectService } from "../../../service/projectService";
import { AuthContext } from "../../../context/AuthContext";
import styles from "./DrawingScreen.styles";
import * as offlineStorage from "../../../utils/offlineStorage";
import { saveDrawingLocally } from "../../../utils/drawingLocalSave";
import { manipulateAsync, FlipType, SaveFormat } from "expo-image-manipulator";
import { uploadToCloudinary } from "../../../service/cloudinary";
import LottieView from "lottie-react-native";
import loadingAnimation from "../../../assets/loading.json";
import { useToast } from "../../../hooks/use-toast";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as Print from "expo-print";
import * as MediaLibrary from "expo-media-library";
import { encodeProjectData, decodeProjectData, isEncodedData } from "../../../utils/dataEncoder";
import { useCollaboration } from "../../../hooks/useCollaboration";
// Hàm helper để lấy kích thước hình ảnh
const getImageSize = (uri, abortSignal = null) => {
  return new Promise((resolve, reject) => {
    if (!uri) {
      reject(new Error("Invalid URI"));
      return;
    }

    if (abortSignal?.aborted) {
      reject(new Error("Aborted"));
      return;
    }

    let timeout = null;
    let isResolved = false;

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
    };

    timeout = setTimeout(() => {
      if (!isResolved && !abortSignal?.aborted) {
        isResolved = true;
        cleanup();
        reject(new Error("Image.getSize timed out"));
      }
    }, 5000);

    // ✅ Listen to abort signal
    if (abortSignal) {
      abortSignal.addEventListener(
        "abort",
        () => {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            reject(new Error("Aborted"));
          }
        },
        { once: true }
      );
    }
    Image.getSize(
      uri,
      (width, height) => {
        if (!isResolved && !abortSignal?.aborted) {
          isResolved = true;
          cleanup();
          resolve({ width, height });
        }
      },
      (error) => {
        if (!isResolved && !abortSignal?.aborted) {
          isResolved = true;
          cleanup();
          reject(error);
        }
      }
    );
  });
};

export default function DrawingScreen({ route }) {
  const navigation = useNavigation();
  const noteConfig = route?.params?.noteConfig;

  const safeNoteConfig = React.useMemo(
    () =>
      noteConfig || {
        projectId: Date.now(),
        title: "Quick Note",
        description: "Quick Note",
        hasCover: false,
        orientation: "portrait",
        paperSize: "A4",
        cover: null,
        paper: { template: "blank", color: "#FFFFFF" },
        pages: [],
        projectDetails: null,
      },
    [noteConfig]
  );
  const { user } = useContext(AuthContext);
  const [isExportModalVisible, setExportModalVisible] = useState(false);
  const [exitModalVisible, setExitModalVisible] = useState(false);
  const [aiChatVisible, setAiChatVisible] = useState(false);
  const { toast } = useToast();
  const [creditRefreshCounter, setCreditRefreshCounter] = useState(0);
  const [versionModalVisible, setVersionModalVisible] = useState(false);

  const handleRestoreVersion = useCallback(async (version) => {
    try {
      setVersionModalVisible(false);
      toast({
        title: "Restoring...",
        description: `Restoring version ${version.versionNumber}`,
      });

      const response = await projectService.restoreProjectVersion(
        safeNoteConfig.projectId,
        version.projectVersionId
      );

      if (response?.code === 200) {
        toast({
          title: "Success",
          description: "Version restored successfully",
          variant: "success",
        });
        // Navigate back to Home to reload
        navigation.navigate("Home");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore version",
        variant: "destructive",
      });
    }
  }, [safeNoteConfig.projectId, navigation, toast]);

  // 🔥 Detect if this is a local project (guest mode)
  const isLocalProject = useMemo(() => {
    const projectId = safeNoteConfig?.projectId;
    return projectService.isLocalProject(projectId) || safeNoteConfig?.isLocal === true;
  }, [safeNoteConfig]);

  // 🔄 REALTIME COLLABORATION - useCollaboration hook
  const enableCollaboration = !!safeNoteConfig?.projectDetails?.hasCollaboration && !isLocalProject;

  const {
    isConnected: isCollabConnected,
    updateElement: collabUpdateElement,
    createElement: collabCreateElement,
    deleteElement: collabDeleteElement,
    requestLock: collabRequestLock,
    releaseLock: collabReleaseLock,
    isElementLocked: collabIsElementLocked,
    createPage: collabCreatePage,
  } = useCollaboration({
    projectId: safeNoteConfig?.projectId,
    userId: user?.id,
    userName: user?.fullName || user?.email || `User ${user?.id}`,
    avatarUrl: user?.avatarUrl,
    enabled: enableCollaboration,
    // Handle remote element updates (from other users)
    onElementUpdate: useCallback((data) => {
      if (!multiPageCanvasRef.current) return;
      const { pageId, elementId, changes, transient, userId: remoteUserId } = data;

      // Skip own updates (already applied optimistically)
      if (String(remoteUserId) === String(user?.id)) return;

      // 🔥 Use requestAnimationFrame to avoid setState during render
      requestAnimationFrame(() => {
        try {
          multiPageCanvasRef.current?.updateStrokeById?.(pageId, elementId, changes, {
            fromRemote: true,
            transient
          });
        } catch (err) {
          console.error('[Collab] Error applying remote update:', err);
        }
      });
    }, [user?.id]),
    // Handle remote element creation
    onElementCreate: useCallback((data) => {
      if (!multiPageCanvasRef.current) return;
      const { pageId, element, userId: remoteUserId } = data;

      if (String(remoteUserId) === String(user?.id)) return;

      requestAnimationFrame(() => {
        try {
          multiPageCanvasRef.current?.appendStrokesToPage?.(pageId, [element], { fromRemote: true });
        } catch (err) {
          console.error('[Collab] Error applying remote create:', err);
        }
      });
    }, [user?.id]),
    // Handle remote element deletion
    onElementDelete: useCallback((data) => {
      if (!multiPageCanvasRef.current) return;
      const { pageId, elementId, userId: remoteUserId } = data;

      if (String(remoteUserId) === String(user?.id)) return;

      requestAnimationFrame(() => {
        try {
          multiPageCanvasRef.current?.deleteStrokeById?.(pageId, elementId, { fromRemote: true });
        } catch (err) {
          console.error('[Collab] Error applying remote delete:', err);
        }
      });
    }, [user?.id]),
    // Handle remote page creation
    onPageCreate: useCallback((data) => {
      if (!multiPageCanvasRef.current) return;
      const { page, insertAt, userId: remoteUserId } = data;

      if (String(remoteUserId) === String(user?.id)) return;

      // 🔥 Use requestAnimationFrame to avoid setState during render
      requestAnimationFrame(() => {
        try {
          multiPageCanvasRef.current?.addPageFromRemote?.(page, insertAt);
        } catch (err) {
          console.error('[Collab] Error applying remote page create:', err);
        }
      });
    }, [user?.id]),
  });

  const multiPageCanvasContainerRef = useRef(null);
  // ✅ Validate noteConfig to prevent crash
  useEffect(() => {
    if (!noteConfig) {
      console.warn(
        "[DrawingScreen] No noteConfig provided, using fallback config"
      );
    }
  }, [noteConfig]);

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

    // ✅ ADD: Preserve shapeSettings
    if (stroke.shapeSettings && typeof stroke.shapeSettings === 'object') {
      safe.shapeSettings = {
        shape: stroke.shapeSettings.shape,
        fill: stroke.shapeSettings.fill,
        fillColor: stroke.shapeSettings.fillColor,
        thickness: stroke.shapeSettings.thickness,
        color: stroke.shapeSettings.color,
      };
    }
    // Handle shape-specific properties
    if (safe.fill === true || safe.shapeSettings?.fill === true) {
      safe.fill = true;
      safe.fillColor = safe.fillColor || safe.shapeSettings?.fillColor || safe.shapeSettings?.color || "#000000";
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

      // ✅ Clear realtime RAF
      if (realtimeRAFRef.current) {
        cancelAnimationFrame(realtimeRAFRef.current);
        realtimeRAFRef.current = null;
      }

      // ✅ FIX: Clear inbound queue to release memory
      if (inboundQueueRef.current) {
        inboundQueueRef.current.clear();
      }
      inboundFlushScheduledRef.current = false;

      // ✅ FIX: Clear page refs to release component references
      if (pageRefs.current) {
        Object.keys(pageRefs.current).forEach(key => {
          pageRefs.current[key] = null;
        });
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
  // ✅ Thêm validation và debounce để tránh crash khi chuyển layer liên tục
  const layerSelectTimeoutRef = useRef(null);
  const handleLayerSelect = useCallback(
    (id) => {
      if (layerSelectTimeoutRef.current) {
        clearTimeout(layerSelectTimeoutRef.current);
        layerSelectTimeoutRef.current = null;
      }
      // ✅ Validate layer ID
      if (!id || typeof id !== "string") {
        console.warn("[DrawingScreen] handleLayerSelect: Invalid layer ID");
        return;
      }
      // ✅ Debounce to avoid rapid layer switching
      layerSelectTimeoutRef.current = setTimeout(() => {
        if (!isMountedRef.current) {
          layerSelectTimeoutRef.current = null;
          return;
        }

        // ✅ Get fresh pageLayers at execution time
        setPageLayers((currentPageLayers) => {
          const layers = currentPageLayers[activePageId] || [];
          const layerExists = layers.some((l) => l?.id === id);

          if (!layerExists) {
            console.warn(
              `[DrawingScreen] Layer ${id} not found in page ${activePageId}`
            );
            if (layers.length > 0) {
              setActiveLayerId(layers[0].id);
            }
          } else {
            setActiveLayerId(id);
          }

          return currentPageLayers; // No change to pageLayers
        });

        layerSelectTimeoutRef.current = null;
      }, 50);
    },
    [activePageId] // ✅ Only depend on activePageId, not pageLayers
  );

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

  // 🩹 ===== TAPE TOOL =====
  const [tapeSettings, setTapeSettings] = useState({
    mode: "line", // "line" | "rectangle"
    showAll: true,
    pattern: "diagonal",
    thickness: 4,
    color: "#FDA4AF",
  });

  const handleSelectTape = useCallback((settings) => {
    setTool("tape");
    if (settings) {
      setTapeSettings(prev => ({ ...prev, ...settings }));
    }
  }, []);

  const handleClearTapesOnPage = useCallback(() => {
    setPageLayers((prev) => {
      const newLayers = { ...prev };
      const currentLayers = newLayers[activePageId] || [];

      // Filter out strokes that are tapes
      const updatedLayers = currentLayers.map(layer => ({
        ...layer,
        strokes: layer.strokes.filter(stroke => stroke.tool !== "tape")
      }));

      newLayers[activePageId] = updatedLayers;
      return newLayers;
    });
    toast.show({ type: "success", text1: "Cleared tapes on current page" });
  }, [activePageId, toast]);

  const handleClearTapesOnAllPages = useCallback(() => {
    setPageLayers((prev) => {
      const newLayers = { ...prev };
      Object.keys(newLayers).forEach(pageId => {
        newLayers[pageId] = newLayers[pageId].map(layer => ({
          ...layer,
          strokes: layer.strokes.filter(stroke => stroke.tool !== "tape")
        }));
      });
      return newLayers;
    });
    toast.show({ type: "success", text1: "Cleared tapes on all pages" });
  }, [toast]);

  // 📐 ===== SHAPE TOOL =====
  const [shapeSettings, setShapeSettings] = useState({
    shape: "rect",
    thickness: 2,
    color: "#000000",
    fill: false,
  });

  const handleSelectShape = useCallback((settings) => {
    setTool("shape");
    if (settings) {
      setShapeSettings(prev => ({ ...prev, ...settings }));
    }
  }, []);

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
  const inboundQueueRef = useRef(new Map());
  const inboundFlushScheduledRef = useRef(false);
  const realtimeRAFRef = useRef(null);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for saving indicator
  const [isUploadingAsset, setIsUploadingAsset] = useState(false); // New state for asset uploads
  const lastSyncTimeRef = useRef(0);

  // [NEW] Setup network listener for auto-sync (DISABLED for local projects)
  useEffect(() => {
    // 🔥 Skip auto-sync for local/guest projects
    if (isLocalProject) {
      return;
    }

    const THROTTLE_MS = 10000;
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        const now = Date.now();
        if (now - lastSyncTimeRef.current >= THROTTLE_MS) {
          lastSyncTimeRef.current = now;
          // Only sync if projectService.syncPendingPages exists
          if (typeof projectService.syncPendingPages === 'function') {
            projectService.syncPendingPages();
          }
        }
      }
    });
    return () => {
      unsubscribe();
    };
  }, [isLocalProject]);

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

        let i = 0;
        const total = allStrokes.length;

        const processChunk = () => {
          if (controller.signal.aborted || !multiPageCanvasRef.current) {
            resolve();
            return;
          }

          const startTime = Date.now();
          const batch = [];

          // Process as many as possible in 12ms (leaving ~4ms for UI)
          while (i < total && Date.now() - startTime < 12) {
            const s = allStrokes[i];
            if (s && typeof s === "object") {
              const sanitized = sanitizeStroke(s);
              if (sanitized) batch.push(sanitized);
            }
            i++;
          }

          if (batch.length > 0) {
            try {
              multiPageCanvasRef.current.appendStrokesToPage(pageId, batch);
            } catch (err) {
              console.error("[DrawingScreen] Error appending strokes:", err);
            }
          }

          if (i < total) {
            const rafId = requestAnimationFrame(processChunk);
            rafIds.add(rafId);
          } else {
            resolve();
          }
        };

        const rafId = requestAnimationFrame(processChunk);
        rafIds.add(rafId);
      });
    };

    const loadExistingStrokes = async () => {
      try {
        const projectId = noteConfig?.projectId;
        if (!projectId || controller.signal.aborted) return;

        // 🔥 For local projects, load from FileSystem
        if (isLocalProject) {
          try {
            const { loadDrawingLocally } = require('../../../utils/drawingLocalSave');
            const localData = await loadDrawingLocally(projectId);

            if (localData?.pages && Array.isArray(localData.pages)) {
              // Sort pages to prioritize active page (default to 1)
              const sortedPages = [...localData.pages].sort((a, b) => {
                const idA = a.pageId || a.pageNumber || 0;
                const idB = b.pageId || b.pageNumber || 0;
                if (idA === activePageId) return -1;
                if (idB === activePageId) return 1;
                return 0;
              });

              for (const page of sortedPages) {
                if (controller.signal.aborted) break;

                const pageId = page.pageId || page.pageNumber || 1;
                const strokes = page.dataObject?.strokes || [];

                if (strokes.length > 0) {
                  await loadStrokesInChunks(pageId, strokes);
                }
              }
            }
          } catch (localError) {
            console.error('❌ Failed to load from FileSystem:', localError);
          }
          return;
        }

        // ✅ For cloud projects, load from strokeUrl
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

        // Sort to prioritize active page
        pagesToLoad.sort((a, b) => {
          const idA = getPageId(a);
          const idB = getPageId(b);
          if (idA === activePageId) return -1;
          if (idB === activePageId) return 1;
          return 0;
        });

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
              { signal: controller.signal, preferRemote: true, skipLocal: true }
            );

            if (controller.signal.aborted || !data) continue;

            multiPageCanvasRef.current?.clearPage?.(pageId);

            if (data.template || data.backgroundColor || data.imageUrl) {
              const updates = {};
              if (data.template) updates.template = data.template;
              if (data.backgroundColor)
                updates.backgroundColor = data.backgroundColor;
              if (data.imageUrl) updates.imageUrl = data.imageUrl;
              multiPageCanvasRef.current?.updatePage?.(pageId, updates);
            }

            if (Array.isArray(data?.layers) && data.layers.length > 0) {
              setPageLayers((prev) => {
                const existingLayers = prev[pageId] || [];
                const mergedLayers = data.layers.map((savedLayer) => {
                  const existingLayer = existingLayers.find(
                    (l) => l?.id === savedLayer.id
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
                e?.message || e
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
              "Không thể tải dữ liệu project. Vui lòng thử lại."
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
  const handleSaveFile = useCallback(
    async (options = {}) => {
      const silent = !!options.silent;
      if (isSaving) {
        if (!silent) {
          toast({
            title: "Saving...",
            description: "The saving process is in progress. Please wait.",
            variant: "default",
          });
        }
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
      if (!silent) setIsSaving(true);
      const pagesData = multiPageCanvasRef.current.getAllPagesData();
      if (!pagesData || pagesData.length === 0) {
        toast({
          title: "Notice",
          description: "No data available to save.",
          variant: "default",
        });
        setIsSaving(false);
        return;
      }

      // 🔥 Check if this is a local project (guest mode)
      if (isLocalProject) {
        try {
          const success = await saveDrawingLocally(
            safeNoteConfig.projectId,
            multiPageCanvasRef,
            safeNoteConfig
          );

          if (success && !silent) {
            toast({
              title: "Saved Locally",
              description: "Your drawing has been saved to device storage",
              variant: "success",
            });
          }
        } catch (error) {
          console.error('❌ Failed to save locally:', error);
          if (!silent) {
            toast({
              title: "Save Failed",
              description: error.message || "Failed to save drawing",
              variant: "destructive",
            });
          }
        } finally {
          if (!silent) setIsSaving(false);
        }
        return;
      }

      try {
        // Save all pages locally first (for offline backup)
        for (const page of pagesData) {
          await offlineStorage.saveProjectPageLocally(noteConfig.projectId, page.pageNumber, page.dataObject);
        }
        if (!silent) {
          toast({
            title: "Saved Locally",
            description: "All pages have been saved to your device.",
            variant: "default",
          });
        }
      } catch (localSaveError) {
        console.error(
          "❌ [DrawingScreen] Error saving locally:",
          localSaveError
        );
        if (!silent) {
          toast({
            title: "Storage Error",
            description: "Unable to save data to the device storage.",
            variant: "destructive",
          });
          setIsSaving(false);
        }
        return;
      }
      // Check network status
      const netState = await NetInfo.fetch();
      if (!netState.isConnected || !netState.isInternetReachable) {
        if (!silent) {
          toast({
            title: "Saved Offline",
            description:
              "Your data has been saved locally. It will sync when you're online.",
            variant: "default",
          });
          setIsSaving(false);
        }
        return;
      }
      // If online, proceed with sync
      try {
        const uploadPromises = pagesData.map((page) =>
          projectService.uploadPageToS3(
            noteConfig.projectId,
            page.pageNumber,
            page.dataObject
          )
        );
        const uploadedPagesResults = await Promise.all(uploadPromises);
        const snapshots =
          multiPageCanvasRef.current?.getAllPagesSnapshots?.() || [];
        const snapshotUploads = snapshots.map(async (snap) => {
          const tempUri =
            (FileSystem.cacheDirectory || FileSystem.documentDirectory) +
            `snapshot_${noteConfig.projectId}_${snap.pageNumber}.png`;
          await FileSystem.writeAsStringAsync(tempUri, snap.base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          try {
            const res = await uploadToCloudinary(tempUri);
            return { pageNumber: snap.pageNumber, url: res?.secure_url };
          } finally {
            try {
              await FileSystem.deleteAsync(tempUri, { idempotent: true });
            } catch { }
          }
        });
        const uploadedSnapshots = await Promise.all(snapshotUploads);
        const finalPayload = {
          projectId: noteConfig.projectId,
          pages: uploadedPagesResults.map((result) => {
            const snap = uploadedSnapshots.find(
              (s) => s.pageNumber === result.pageNumber
            );
            // Find original page data to get existing snapshotUrl if new one is not generated
            const originalPage = pagesData.find(
              (p) => p.pageNumber === result.pageNumber
            );
            return {
              pageNumber: result.pageNumber,
              strokeUrl: result.url,
              snapshotUrl: snap?.url || originalPage?.snapshotUrl || "",
            };
          }),
        };
        await projectService.createPage(finalPayload);
        try {
          const refreshed = await projectService.getProjectById(
            noteConfig.projectId
          );
          const serverPages = Array.isArray(refreshed?.pages)
            ? refreshed.pages
            : [];
          multiPageCanvasRef.current?.refreshSnapshots?.(serverPages);
        } catch { }
        if (!silent) {
          toast({
            title: "Success!",
            description:
              "Your project has been saved and synchronized successfully.",
            variant: "default",
          });
        }
      } catch (syncError) {
        console.error("❌ [DrawingScreen] Sync failed:", syncError);
        if (!silent) {
          toast({
            title: "Sync Failed",
            description:
              "Your data is safe locally. We'll try syncing again later.",
            variant: "destructive",
          });
        }
      } finally {
        if (!silent) setIsSaving(false);
      }
    },
    [noteConfig?.projectId, isSaving, toast, isLocalProject, safeNoteConfig]
  ); // ✅ Add all dependencies

  /**
   * Decompress points that were sent using delta encoding
   * @param {Object} compressedPoints - Compressed points data
   * @returns {Array} Array of point objects with x, y
   */
  const decompressPoints = useCallback((compressedPoints) => {
    if (!compressedPoints) return [];

    // Handle non-compressed format (simple array of [x, y])
    if (!compressedPoints.compressed && Array.isArray(compressedPoints.data)) {
      return compressedPoints.data.map(p =>
        Array.isArray(p) ? { x: p[0], y: p[1] } : p
      );
    }

    // Handle compressed format with delta encoding
    if (compressedPoints.compressed && compressedPoints.base && compressedPoints.deltas) {
      const points = [];
      const [baseX, baseY] = compressedPoints.base;
      points.push({ x: baseX, y: baseY });

      let prevX = baseX;
      let prevY = baseY;
      const deltas = compressedPoints.deltas;

      // Deltas are stored as flat array: [dx1, dy1, dx2, dy2, ...]
      for (let i = 0; i < deltas.length; i += 2) {
        const dx = deltas[i] / 100; // Convert back from integer
        const dy = deltas[i + 1] / 100;
        prevX += dx;
        prevY += dy;
        points.push({ x: prevX, y: prevY });
      }

      return points;
    }

    // Fallback: return empty if unrecognized format
    return [];
  }, []);

  const realtimeHandler = useCallback(
    (msg) => {
      try {

        if (!msg) return;

        // ✅ Skip messages from current user to avoid duplicate strokes
        if (msg.userId && user?.id && Number(msg.userId) === Number(user.id)) {
          return;
        }

        // Prefer a full stroke payload if present
        if (msg.payload?.stroke && typeof msg.payload.stroke === "object") {
          const s = msg.payload.stroke;

          // ✅ Handle compressed points if present
          let points = [];
          if (msg.payload?.points && typeof msg.payload.points === "object") {
            // New compressed format
            points = decompressPoints(msg.payload.points);
          } else if (Array.isArray(s.points)) {
            // Legacy format: points inside stroke
            points = s.points
              .map((p) =>
                p && typeof p === "object"
                  ? {
                    x: Number(p.x) || 0,
                    y: Number(p.y) || 0,
                    pressure: p.pressure,
                    thickness: p.thickness,
                    stabilization: p.stabilization,
                  }
                  : null
              )
              .filter(Boolean);
          }

          const sanitized = {
            id:
              s.id || `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
            tool: s.tool || "pen",
            color: s.color || "#2563EB",
            width: s.width || 2,
            opacity: s.opacity ?? 1,
            x: Number(s.x) || 0,
            y: Number(s.y) || 0,
            rotation: s.rotation || 0,
            layerId: s.layerId || "layer1",
            points: points,
            text: s.text,
            fontSize: s.fontSize,
            padding: s.padding,
            uri: s.uri,
            rows: s.rows,
            cols: s.cols,
          };
          const pageId = msg.payload?.pageId || activePageId;
          if (sanitized.points?.length >= 2 || sanitized.tool !== "pen") {
            if (!multiPageCanvasRef.current || !isMountedRef.current) return;
            const q = inboundQueueRef.current.get(pageId) || [];
            q.push(sanitized);
            inboundQueueRef.current.set(pageId, q);

            // ✅ Schedule flush with proper recursive RAF
            if (!inboundFlushScheduledRef.current) {
              inboundFlushScheduledRef.current = true;

              const flushQueue = () => {
                // ✅ Check mounted state
                if (!multiPageCanvasRef.current || !isMountedRef.current) {
                  inboundFlushScheduledRef.current = false;
                  return;
                }

                let hasMore = false;
                inboundQueueRef.current.forEach((arr, pageId) => {
                  if (Array.isArray(arr) && arr.length > 0) {
                    const chunk = arr.splice(0, 50);
                    if (chunk.length > 0 && multiPageCanvasRef.current) {
                      try {
                        multiPageCanvasRef.current.appendStrokesToPage(
                          pageId,
                          chunk
                        );
                      } catch (err) {
                        console.error(
                          "[Realtime] Error appending strokes:",
                          err
                        );
                      }
                    }
                    if (arr.length > 0) hasMore = true;
                  }
                });

                // ✅ CRITICAL: Recursive RAF khi còn data
                if (hasMore && isMountedRef.current) {
                  realtimeRAFRef.current = requestAnimationFrame(flushQueue);
                } else {
                  inboundFlushScheduledRef.current = false;
                  realtimeRAFRef.current = null;
                }
              };

              realtimeRAFRef.current = requestAnimationFrame(flushQueue);
            }
            return;
          }
        }
        let pts = [];
        // Prefer structured page object (page + strokes)
        if (msg.payload?.page && typeof msg.payload.page === "object") {
          try {
            const data = msg.payload.page;
            const incomingStrokes = Array.isArray(data?.strokes)
              ? data.strokes
              : [];
            if (incomingStrokes.length > 0) {
              const pageId = data?.id || msg.payload?.pageId || activePageId;
              const sanitized = incomingStrokes.map((s) => ({
                id:
                  s?.id ||
                  `r_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                tool: s?.tool || "pen",
                color: s?.color || "#2563EB",
                width: s?.width || 2,
                opacity: s?.opacity ?? 1,
                points: Array.isArray(s?.points)
                  ? s.points.map((p) => ({
                    x: Number(p?.x) || 0,
                    y: Number(p?.y) || 0,
                    pressure: p?.pressure,
                    thickness: p?.thickness,
                    stabilization: p?.stabilization,
                  }))
                  : [],
                layerId: s?.layerId || "layer1",
                rotation: s?.rotation || 0,
              }));
              if (
                sanitized.length > 0 &&
                multiPageCanvasRef.current &&
                isMountedRef.current
              ) {
                const q = inboundQueueRef.current.get(pageId) || [];
                q.push(...sanitized);
                inboundQueueRef.current.set(pageId, q);
              }
              return;
            }
          } catch { }
        }
        // Handle other payload types (pageJson, pointsDetailed, etc.)
        // ... rest of your handler code
      } catch (err) {
        console.error("[Realtime] Handler error:", err);
      }
    },
    [activePageId, user?.id, decompressPoints]
  ); // ✅ Added user?.id for filtering own messages

  // ✅ FIX: Use ref to prevent creating multiple intervals
  const handleSaveFileRef = useRef();
  const isSavingRef = useRef(isSaving);

  useEffect(() => {
    handleSaveFileRef.current = handleSaveFile;
    isSavingRef.current = isSaving;
  });

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        if (!isSavingRef.current && handleSaveFileRef.current) {
          await handleSaveFileRef.current({ silent: true });
        }
      } catch (err) {
        console.error("[DrawingScreen] Auto-save error:", err);
      }
    }, 60000); // Auto-save every 60 seconds

    return () => {
      clearInterval(id);
    };
  }, []); // ✅ Empty deps - only create ONE interval
  // ✅ FIX: Use ref for realtimeHandler to prevent reconnection on every render
  const realtimeHandlerRef = useRef();

  useEffect(() => {
    realtimeHandlerRef.current = realtimeHandler;
  });

  useEffect(() => {
    const pid = noteConfig?.projectId;
    const uid = user?.id;
    if (!pid || !uid) return;

    const enableCollab = !!noteConfig?.projectDetails?.hasCollaboration;
    if (enableCollab) {
      // ✅ Use wrapper function that calls current ref
      projectService.realtime.connect(pid, uid, (msg) => {
        realtimeHandlerRef.current?.(msg);
      });
    } else {
      try {
        projectService.realtime.disconnect();
      } catch { }
    }

    return () => {
      try {
        projectService.realtime.disconnect();
      } catch { }
    };
  }, [
    noteConfig?.projectId,
    noteConfig?.projectDetails?.hasCollaboration,
    user?.id,
    // ✅ Removed realtimeHandler from deps to prevent reconnection
  ]);

  // 📤 EXPORT (local PDF/PNG)
  const handleExportFile = async (options) => {
    setExportModalVisible(false);

    // --- PICTURE EXPORT ---
    if (options.selected === "picture") {
      if (!multiPageCanvasContainerRef.current) {
        toast({
          title: "Error",
          description: "Cannot export file. Canvas not found.",
          variant: "destructive",
        });
        return;
      }
      try {
        const uri = await captureRef(multiPageCanvasContainerRef.current, {
          format: "png",
          quality: 1,
        });

        let safeName = String(options.fileName || "Untitled").trim();
        safeName = safeName.replace(/[^a-zA-Z0-9._-]+/g, "_");
        if (!safeName.toLowerCase().endsWith(".png")) safeName += ".png";

        // ✅ Android: Use MediaLibrary to save to Pictures/SketchNote
        if (Platform.OS === "android") {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync({ accessPrivileges: "readOnly" });

            if (status !== 'granted') {
              toast({
                title: "Permission Required",
                description: "Need permission to save to Pictures folder.",
                variant: "destructive",
              });
              return;
            }

            // Save to Pictures/SketchNote folder
            const asset = await MediaLibrary.createAssetAsync(uri);
            let album = await MediaLibrary.getAlbumAsync('SketchNote');
            if (!album) {
              album = await MediaLibrary.createAlbumAsync('SketchNote', asset, false);
            } else {
              await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
            }

            toast({
              title: "Exported Successfully",
              description: `Saved to Pictures/SketchNote/${safeName}`,
              variant: "default",
            });
            return;
          } catch (error) {
            console.error("MediaLibrary error:", error);
            // Fallback to Sharing if MediaLibrary fails
          }
        }

        // iOS or fallback: use Sharing
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "image/png",
            dialogTitle: "Save Image",
          });
        }
      } catch (error) {
        console.error("Error exporting image:", error);
        toast({
          title: "Export Image Failed",
          description: "An error occurred while exporting the image.",
          variant: "destructive",
        });
      }
    }

    // --- PICTURES (ALL PAGES) EXPORT ---
    else if (options.selected === "pictures_all") {
      try {
        const snapshots = multiPageCanvasRef.current?.getAllPagesSnapshots?.() || [];

        if (snapshots.length === 0) {
          toast({
            title: "No Data",
            description: "No pages available to export.",
            variant: "info",
          });
          return;
        }

        // Build selected page numbers from options
        let selectedPageNumbers = [];
        if (options.pageMode === "range" && typeof options.pageRange === "string") {
          const m = options.pageRange.match(/\s*(\d+)\s*-\s*(\d+)\s*/);
          if (m) {
            const start = Math.max(1, parseInt(m[1], 10));
            const end = Math.max(start, parseInt(m[2], 10));
            for (let i = start; i <= end; i++) selectedPageNumbers.push(i);
          }
        } else if (options.pageMode === "list" && typeof options.pageList === "string") {
          selectedPageNumbers = options.pageList
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => Number.isFinite(n) && n >= 1);
        }

        // Filter snapshots by selection
        const selectedSnapshots =
          selectedPageNumbers.length > 0
            ? snapshots.filter(s => selectedPageNumbers.includes(s.pageNumber))
            : snapshots; // All pages if no selection

        if (selectedSnapshots.length === 0) {
          toast({
            title: "No Pages Selected",
            description: "Please select valid pages to export.",
            variant: "info",
          });
          return;
        }

        // Android: Save all images to Pictures/SketchNote
        if (Platform.OS === "android") {
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync({ accessPrivileges: "readOnly" });

            if (status !== 'granted') {
              toast({
                title: "Permission Required",
                description: "Need permission to save to Pictures folder.",
                variant: "destructive",
              });
              return;
            }

            // Save each snapshot
            for (const snap of selectedSnapshots) {
              const tempUri =
                (FileSystem.cacheDirectory || FileSystem.documentDirectory) +
                `page_${snap.pageNumber}.png`;

              await FileSystem.writeAsStringAsync(tempUri, snap.base64, {
                encoding: FileSystem.EncodingType.Base64,
              });

              const asset = await MediaLibrary.createAssetAsync(tempUri);
              let album = await MediaLibrary.getAlbumAsync('SketchNote');
              if (!album) {
                album = await MediaLibrary.createAlbumAsync('SketchNote', asset, false);
              } else {
                await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
              }
            }

            toast({
              title: "Exported Successfully",
              description: `Saved ${selectedSnapshots.length} image(s) to Pictures/SketchNote`,
              variant: "default",
            });
            return;
          } catch (error) {
            console.error("MediaLibrary error:", error);
            // Fallback to SAF for all images
          }
        }

        // Fallback: Use Storage Access Framework to save all images
        if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
          try {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
              let savedCount = 0;

              for (const snap of selectedSnapshots) {
                try {
                  const safUri =
                    await FileSystem.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri,
                      `page_${snap.pageNumber}.png`,
                      "image/png"
                    );

                  await FileSystem.writeAsStringAsync(safUri, snap.base64, {
                    encoding: FileSystem.EncodingType.Base64,
                  });

                  savedCount++;
                } catch (err) {
                  console.error(`Error saving page ${snap.pageNumber}:`, err);
                }
              }

              toast({
                title: "Exported Successfully",
                description: `Saved ${savedCount} image(s) to selected folder`,
                variant: "default",
              });
              return;
            }
          } catch (error) {
            console.error("SAF error:", error);
          }
        }

        // Last resort: Share first image only (iOS or if all else fails)
        const firstSnap = selectedSnapshots[0];
        const tempUri =
          (FileSystem.cacheDirectory || FileSystem.documentDirectory) +
          `page_${firstSnap.pageNumber}.png`;

        await FileSystem.writeAsStringAsync(tempUri, firstSnap.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: "image/png",
            dialogTitle: `Sharing 1 of ${selectedSnapshots.length} image(s)`,
          });
        }
      } catch (error) {
        console.error("Error exporting all images:", error);
        toast({
          title: "Export Failed",
          description: "An error occurred while exporting images.",
          variant: "destructive",
        });
      }
    }
    // --- STARNOTE (JSON) EXPORT ---
    else if (options.selected === "sketchnote") {
      try {
        const pagesData = await multiPageCanvasRef.current.getAllPagesData();
        if (!pagesData || pagesData.length === 0) {
          toast({
            title: "No Data",
            description: "No content to export.",
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

        // 🔒 Encode data for security
        const encodedData = await encodeProjectData(projectData);

        let safeName = `${options.fileName || "Untitled"}.sketchnote`;
        safeName = safeName.replace(/\s/g, "_");
        const internalUri =
          (FileSystem.documentDirectory || FileSystem.cacheDirectory) +
          safeName;
        await FileSystem.writeAsStringAsync(internalUri, encodedData, {
          encoding: "utf8",
        });

        let finalDest = internalUri;
        if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
          try {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const safUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  safeName,
                  "application/json"
                );
              await FileSystem.writeAsStringAsync(safUri, encodedData, {
                encoding: FileSystem.EncodingType.UTF8,
              });

              toast({
                title: "Exported Successfully",
                description: "Saved SketchNote to selected folder",
                variant: "success",
              });
              return;
            }
          } catch { }
        }

        toast({
          title: "Exported",
          description: "SketchNote file ready",
          variant: "success",
        });
      } catch (error) {
        console.error("Error exporting SketchNote:", error);
        toast({
          title: "Export SketchNote Failed",
          description: "An error occurred while exporting the file.",
          variant: "destructive",
        });
      }
    }

    // --- SKETCHNOTE (S3) EXPORT ---
    else if (options.selected === "sketchnote_s3") {
      try {
        setIsSaving(true);

        // Check if online
        const netState = await NetInfo.fetch();
        if (!netState.isConnected || !netState.isInternetReachable) {
          toast({
            title: "Offline",
            description: "S3 export requires internet connection.",
            variant: "destructive",
          });
          setIsSaving(false);
          return;
        }

        const pagesData = multiPageCanvasRef.current?.getAllPagesData?.();
        if (!pagesData || pagesData.length === 0) {
          toast({
            title: "No Data",
            description: "No content to export.",
            variant: "info",
          });
          setIsSaving(false);
          return;
        }

        // Build selected page numbers from options
        let selectedPageNumbers = [];
        if (options.pageMode === "range" && typeof options.pageRange === "string") {
          const m = options.pageRange.match(/\s*(\d+)\s*-\s*(\d+)\s*/);
          if (m) {
            const start = Math.max(1, parseInt(m[1], 10));
            const end = Math.max(start, parseInt(m[2], 10));
            for (let i = start; i <= end; i++) selectedPageNumbers.push(i);
          }
        } else if (options.pageMode === "list" && typeof options.pageList === "string") {
          selectedPageNumbers = options.pageList
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => Number.isFinite(n) && n >= 1);
        }

        // Filter pages by selection
        const selectedPages =
          selectedPageNumbers.length > 0
            ? pagesData.filter(p => selectedPageNumbers.includes(p.pageNumber))
            : pagesData; // All pages if no selection

        if (selectedPages.length === 0) {
          toast({
            title: "No Pages Selected",
            description: "Please select valid pages to export.",
            variant: "info",
          });
          setIsSaving(false);
          return;
        }

        // Upload strokes to S3 (same as save)
        const uploadPromises = selectedPages.map((page) =>
          projectService.uploadPageToS3(
            noteConfig.projectId,
            page.pageNumber,
            page.dataObject
          )
        );
        const uploadedPagesResults = await Promise.all(uploadPromises);

        // Upload snapshots
        const allSnapshots = multiPageCanvasRef.current?.getAllPagesSnapshots?.() || [];
        const selectedSnapshots =
          selectedPageNumbers.length > 0
            ? allSnapshots.filter(s => selectedPageNumbers.includes(s.pageNumber))
            : allSnapshots;

        const snapshotUploads = selectedSnapshots.map(async (snap) => {
          const tempUri =
            (FileSystem.cacheDirectory || FileSystem.documentDirectory) +
            `snapshot_${noteConfig.projectId}_${snap.pageNumber}.png`;
          await FileSystem.writeAsStringAsync(tempUri, snap.base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
          try {
            const res = await uploadToCloudinary(tempUri);
            return { pageNumber: snap.pageNumber, url: res?.secure_url };
          } finally {
            try {
              await FileSystem.deleteAsync(tempUri, { idempotent: true });
            } catch { }
          }
        });
        const uploadedSnapshots = await Promise.all(snapshotUploads);

        // Build project data with S3 URLs
        const projectData = {
          version: "1.0.0",
          createdAt: new Date().toISOString(),
          noteConfig: noteConfig,
          pages: uploadedPagesResults.map((result) => {
            const snap = uploadedSnapshots.find(
              (s) => s.pageNumber === result.pageNumber
            );
            return {
              pageNumber: result.pageNumber,
              strokeUrl: result.url, // ✅ S3 URL instead of raw strokes
              snapshotUrl: snap?.url || "",
            };
          }),
        };

        // 🔒 Encode data for security
        const encodedData = await encodeProjectData(projectData);

        let safeName = `${options.fileName || "Untitled"}.sketchnote`;
        safeName = safeName.replace(/[^a-zA-Z0-9._-]+/g, "_");

        const internalUri =
          (FileSystem.documentDirectory || FileSystem.cacheDirectory) + safeName;
        await FileSystem.writeAsStringAsync(internalUri, encodedData, {
          encoding: "utf8",
        });

        // Android: SAF
        if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
          try {
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
            if (permissions.granted) {
              const safUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  safeName,
                  "application/json"
                );
              await FileSystem.writeAsStringAsync(safUri, encodedData, {
                encoding: FileSystem.EncodingType.UTF8,
              });

              toast({
                title: "Exported Successfully",
                description: `Saved SketchNote (S3) to selected folder`,
                variant: "default",
              });
              setIsSaving(false);
              return;
            }
          } catch { }
        }

        toast({
          title: "Exported",
          description: "SketchNote (S3) file ready",
          variant: "default",
        });
        setIsSaving(false);
      } catch (error) {
        console.error("Error exporting SketchNote S3:", error);
        toast({
          title: "Export Failed",
          description: "An error occurred while exporting.",
          variant: "destructive",
        });
        setIsSaving(false);
      }
    }
    // --- PDF EXPORT (using expo-print) ---
    else if (
      options.selected === "noneditable" ||
      options.selected === "editable"
    ) {
      if (options.selected === "editable") {
        toast({
          title: "Notification",
          description:
            "Exporting editable PDF is not supported yet. A multi-page image PDF will be created instead.",
          variant: "info",
        });
      }

      setIsSaving(true);
      try {
        const pagesData = multiPageCanvasRef.current?.getAllPagesData?.();
        if (!pagesData || pagesData.length === 0) {
          toast({
            title: "No Data",
            description: "No content to export.",
            variant: "info",
          });
          setIsSaving(false);
          return;
        }
        // Use Skia snapshots for reliable per-page capture
        // Build selected page numbers from modal options
        let selectedNums = [];
        if (
          options.pageMode === "range" &&
          typeof options.pageRange === "string"
        ) {
          const m = options.pageRange.match(/\s*(\d+)\s*-\s*(\d+)\s*/);
          if (m) {
            const start = Math.max(1, parseInt(m[1], 10));
            const end = Math.max(start, parseInt(m[2], 10));
            const set = new Set();
            for (let i = start; i <= end; i++) set.add(i);
            selectedNums = Array.from(set.values());
          }
        } else if (
          options.pageMode === "list" &&
          typeof options.pageList === "string"
        ) {
          selectedNums = options.pageList
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => Number.isFinite(n) && n >= 1);
        }

        const pdfPath = await exportPagesToPdf(
          pagesData,
          pageRefs.current,
          options.fileName,
          selectedNums,
          options.quality,
          noteConfig?.orientation || "portrait"
        );

        // ✅ Android: Use SAF for user to choose save location
        if (Platform.OS === "android" && FileSystem.StorageAccessFramework) {
          try {
            let safeName = String(options.fileName || "Untitled").trim();
            safeName = safeName.replace(/[^a-zA-Z0-9._-]+/g, "_");
            if (!safeName.toLowerCase().endsWith(".pdf")) safeName += ".pdf";

            // User selects Downloads or any folder
            const permissions =
              await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

            if (permissions.granted) {
              const safUri =
                await FileSystem.StorageAccessFramework.createFileAsync(
                  permissions.directoryUri,
                  safeName,
                  "application/pdf"
                );

              // Copy PDF from internal to SAF URI
              const base64Data = await FileSystem.readAsStringAsync(pdfPath, {
                encoding: FileSystem.EncodingType.Base64,
              });
              await FileSystem.writeAsStringAsync(safUri, base64Data, {
                encoding: FileSystem.EncodingType.Base64,
              });

              toast({
                title: "Exported Successfully",
                description: `Saved PDF to selected folder`,
                variant: "default",
              });
              setIsSaving(false);
              return;
            }
          } catch (error) {
            console.error("SAF error:", error);
            // Fallback to sharing
          }
        }

        // iOS or fallback: show success message
        toast({
          title: "Exported",
          description: `PDF ready to share`,
          variant: "default",
        });
      } catch (error) {
        console.error("Error exporting multi-page PDF:", error);
        toast({
          title: "Export PDF Failed",
          description: "An error occurred while exporting the PDF.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    }
    // --- OTHER/DEFAULT ---
    else {
      toast({
        title: "Feature Not Supported",
        description: `Exporting to ${options.selected} format is not supported yet.`,
        variant: "info",
      });
    }
  };

  // 📤 SHARE (export then share)
  const handleShareFile = async (options) => {
    setExportModalVisible(false);

    // --- PICTURES (ALL PAGES) SHARE ---
    if (options.selected === "pictures_all") {
      try {
        const snapshots = multiPageCanvasRef.current?.getAllPagesSnapshots?.() || [];
        if (snapshots.length === 0) {
          toast({
            title: "No Data",
            description: "No pages to share.",
            variant: "info",
          });
          return;
        }

        // Build selected page numbers
        let selectedPageNumbers = [];
        if (options.pageMode === "range" && typeof options.pageRange === "string") {
          const m = options.pageRange.match(/\s*(\d+)\s*-\s*(\d+)\s*/);
          if (m) {
            const start = Math.max(1, parseInt(m[1], 10));
            const end = Math.max(start, parseInt(m[2], 10));
            for (let i = start; i <= end; i++) selectedPageNumbers.push(i);
          }
        } else if (options.pageMode === "list" && typeof options.pageList === "string") {
          selectedPageNumbers = options.pageList
            .split(/[,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => Number.isFinite(n) && n >= 1);
        }

        const selectedSnapshots =
          selectedPageNumbers.length > 0
            ? snapshots.filter(s => selectedPageNumbers.includes(s.pageNumber))
            : snapshots;

        if (selectedSnapshots.length === 0) {
          toast({
            title: "No Pages Selected",
            description: "Please select valid pages.",
            variant: "info",
          });
          return;
        }

        // Share first image (Sharing API only supports 1 file)
        const firstSnap = selectedSnapshots[0];
        const tempUri =
          (FileSystem.cacheDirectory || FileSystem.documentDirectory) +
          `share_page_${firstSnap.pageNumber}.png`;

        await FileSystem.writeAsStringAsync(tempUri, firstSnap.base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(tempUri, {
            mimeType: "image/png",
            dialogTitle: selectedSnapshots.length > 1
              ? `Sharing page ${firstSnap.pageNumber} (${selectedSnapshots.length} total pages)`
              : "Share Image",
          });
        } else {
          toast({
            title: "Share Not Available",
            description: "Sharing is not supported on this device.",
            variant: "info",
          });
        }
      } catch (error) {
        console.error("Error sharing images:", error);
        toast({
          title: "Share Failed",
          description: "Unable to share images.",
          variant: "destructive",
        });
      }
      return;
    }

    // --- SKETCHNOTE (S3) SHARE ---
    if (options.selected === "sketchnote_s3") {
      toast({
        title: "Feature Coming Soon",
        description: "SketchNote (S3) sharing will be available soon. Please use Export instead.",
        variant: "info",
      });
      return;
    }

    // --- PICTURE (SINGLE PAGE) SHARE ---
    if (options.selected === "picture") {
      if (!multiPageCanvasContainerRef.current) {
        toast({
          title: "Error",
          description: "Cannot export file. Canvas not found.",
          variant: "destructive",
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
            dialogTitle: "Share Image",
          });
        }
      } catch (error) {
        console.error("Error exporting image for share:", error);
        toast({
          title: "Share Failed",
          description: "Unable to share the image.",
          variant: "destructive",
        });
      }
      return;
    }

    if (options.selected === "sketchnote") {
      try {
        const pagesData = await multiPageCanvasRef.current.getAllPagesData();
        if (!pagesData || pagesData.length === 0) {
          toast({
            title: "No Data",
            description: "No content to export.",
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

        // 🔒 Encode data for security
        const encodedData = await encodeProjectData(projectData);

        const fileName = `${options.fileName || "Untitled"}.sketchnote`;
        const uri = FileSystem.documentDirectory + fileName.replace(/\s/g, "_");
        await FileSystem.writeAsStringAsync(uri, encodedData, {
          encoding: "utf8",
        });
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: "application/json",
            dialogTitle: "Share file SketchNote",
          });
        }
      } catch (error) {
        console.error("Error exporting SketchNote for share:", error);
        toast({
          title: "Share Failed",
          description: "Unable to share the file.",
          variant: "destructive",
        });
      }
      return;
    }

    if (options.selected === "editable" || options.selected === "noneditable") {
      try {
        const pagesData = multiPageCanvasRef.current?.getAllPagesData?.();
        if (!pagesData || pagesData.length === 0) {
          toast({
            title: "No Data",
            description: "No content to export.",
            variant: "info",
          });
          return;
        }
        let selectedNums = [];
        if (
          options.pageMode === "range" &&
          typeof options.pageRange === "string"
        ) {
          const m = options.pageRange.match(/\s*(\d+)\s*-\s*(\d+)\s*/);
          if (m) {
            const start = Math.max(1, parseInt(m[1], 10));
            const end = Math.max(start, parseInt(m[2], 10));
            const set = new Set();
            for (let i = start; i <= end; i++) set.add(i);
            selectedNums = Array.from(set.values());
          }
        } else if (
          options.pageMode === "list" &&
          typeof options.pageList === "string"
        ) {
          selectedNums = options.pageList
            .split(/[\,\s]+/)
            .map((x) => parseInt(x, 10))
            .filter((n) => Number.isFinite(n) && n >= 1);
        }

        const pdfPath = await exportPagesToPdf(
          pagesData,
          pageRefs.current,
          options.fileName,
          selectedNums,
          options.quality,
          noteConfig?.orientation || "portrait"
        );

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(pdfPath, {
            mimeType: "application/pdf",
            dialogTitle: "Share file PDF",
          });
        }
      } catch (error) {
        console.error("Error exporting PDF for share:", error);
        toast({
          title: "Share Failed",
          description: "Unable to share the PDF.",
          variant: "destructive",
        });
      }
    }
  };

  // 🤖 ===== INSERT AI GENERATED IMAGE =====
  const handleAIImageSelect = async (imageUrl) => {
    try {
      if (!imageUrl) return;

      setIsUploadingAsset(true);

      // Get image dimensions
      const size = await getImageSize(imageUrl);

      // Calculate dimensions for canvas
      const currentZoom = multiPageCanvasRef.current?.getCurrentZoom?.() || 1;
      const screenWidth = Dimensions.get("window").width;
      const maxImageWidth = Math.min((screenWidth * 0.5) / currentZoom, 400);
      const scale = Math.min(1, maxImageWidth / size.width);
      const finalWidth = size.width * scale;
      const finalHeight = size.height * scale;

      // Add the stroke with the AI image URL
      multiPageCanvasRef.current.addImageStroke({
        uri: imageUrl,
        x: 100,
        y: 100,
        width: finalWidth,
        height: finalHeight,
      });

      toast({
        title: "Image Added",
        description: "AI-generated image added to canvas",
        variant: "success",
      });

      // Refresh credit balance after successful AI image generation
      setCreditRefreshCounter((prev) => prev + 1);
    } catch (err) {
      console.error("Error inserting AI image:", err);
      toast({
        title: "Insert Image Failed",
        description: "An error occurred while inserting the AI image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAsset(false);
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
          { compress: 0.9, format: SaveFormat.JPEG }
        );
        localUri = manipResult.uri;
        size = { width: manipResult.width, height: manipResult.height };
      }
      // ✅ FIXED: Reduced MAX_DIM to 1024 for better performance on low-end tablets
      const MAX_DIM = 1024; // Reduced from 1600
      if (size.width > MAX_DIM || size.height > MAX_DIM) {
        const scale = MAX_DIM / Math.max(size.width, size.height);
        const newW = Math.round(size.width * scale);
        const newH = Math.round(size.height * scale);
        const resizeResult = await manipulateAsync(
          localUri,
          [{ resize: { width: newW, height: newH } }],
          { compress: 0.85, format: SaveFormat.JPEG }
        );
        localUri = resizeResult.uri;
        size = { width: resizeResult.width, height: resizeResult.height };
      }

      const cloudinaryResponse = await uploadToCloudinary(localUri);
      const cloudUrl = cloudinaryResponse.secure_url;

      if (!cloudUrl) {
        throw new Error(
          "Upload to Cloudinary succeeded but no secure_url was returned."
        );
      }

      // ✅ FIXED: Delete temporary file after successful upload to free memory
      try {
        await FileSystem.deleteAsync(localUri, { idempotent: true });
      } catch (deleteErr) {
        console.warn("[DrawingScreen] Failed to delete temp image:", deleteErr);
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
      toast({
        title: "Insert Image Failed",
        description: "An error occurred while inserting the image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingAsset(false);
    }
  };

  // 📸 ===== OPEN CAMERA =====
  const handleOpenCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        toast({
          title: "Permission Required",
          description: "Camera access is needed.",
          variant: "destructive",
        });
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
      });
      if (!result.canceled) {
        const localUri = result.assets[0].uri;
        setIsUploadingAsset(true);
        let imgWidth = result.assets[0].width;
        let imgHeight = result.assets[0].height;
        // ✅ FIXED: Reduced MAX_DIM to 1024 for better performance on low-end tablets
        const MAX_DIM = 1024; // Reduced from 1600
        let uriToUpload = localUri;
        if (imgWidth > MAX_DIM || imgHeight > MAX_DIM) {
          const scale = MAX_DIM / Math.max(imgWidth, imgHeight);
          const newW = Math.round(imgWidth * scale);
          const newH = Math.round(imgHeight * scale);
          const resizeResult = await manipulateAsync(
            localUri,
            [{ resize: { width: newW, height: newH } }],
            { compress: 0.85, format: SaveFormat.JPEG }
          );
          uriToUpload = resizeResult.uri;
          imgWidth = resizeResult.width;
          imgHeight = resizeResult.height;
        }
        const cloudUrl = await projectService.uploadAsset(
          uriToUpload,
          "image/jpeg"
        );
        if (!cloudUrl) {
          throw new Error("Failed to upload image from camera.");
        }

        // ✅ FIXED: Delete temporary file after successful upload
        try {
          await FileSystem.deleteAsync(uriToUpload, { idempotent: true });
        } catch (deleteErr) {
          console.warn("[DrawingScreen] Failed to delete temp camera image:", deleteErr);
        }

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
      toast({
        title: "Camera Error",
        description: e.message || String(e),
        variant: "destructive",
      });
    } finally {
      setIsUploadingAsset(false);
    }
  }, []);

  // [REWRITTEN] 😄 ===== STICKER (with upload for image stickers) =====
  const handleStickerSelect = useCallback(async (data) => {
    setStickerModalVisible(false);
    if (!data) {
      toast({
        title: "Error",
        description: "Invalid sticker data",
        variant: "destructive",
      });
      return;
    }

    const { tool, uri, text, fontFamily, fontSize } = data;

    try {
      // Sticker is an image from a local URI that needs to be uploaded
      if (tool === "sticker" && uri && !uri.startsWith("http")) {
        setIsUploadingAsset(true);
        let stickerUri = uri;
        const { width: imgWidth0, height: imgHeight0 } = await getImageSize(
          uri
        );
        // ✅ FIXED: Reduced MAX_DIM to 384 for stickers (from 512) to save memory
        const MAX_DIM = 384;
        let imgWidth = imgWidth0;
        let imgHeight = imgHeight0;
        if (imgWidth0 > MAX_DIM || imgHeight0 > MAX_DIM) {
          const scale = MAX_DIM / Math.max(imgWidth0, imgHeight0);
          const newW = Math.round(imgWidth0 * scale);
          const newH = Math.round(imgHeight0 * scale);
          const resized = await manipulateAsync(
            uri,
            [{ resize: { width: newW, height: newH } }],
            { compress: 0.85, format: SaveFormat.PNG }
          );
          stickerUri = resized.uri;
          imgWidth = resized.width;
          imgHeight = resized.height;
        }
        const cloudUrl = await projectService.uploadAsset(
          stickerUri,
          "image/png"
        );
        if (!cloudUrl) {
          throw new Error("Failed to upload sticker.");
        }

        // ✅ FIXED: Delete temporary sticker file after upload
        try {
          await FileSystem.deleteAsync(stickerUri, { idempotent: true });
        } catch (deleteErr) {
          console.warn("[DrawingScreen] Failed to delete temp sticker:", deleteErr);
        }

        const maxWidth = 150;
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
      toast({
        title: "Error",
        description: "Failed to add sticker: " + err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploadingAsset(false);
    }
  }, []);

  // 📊 ===== TABLE TOOL =====
  const handleInsertTable = useCallback((rows, cols) => {
    // Use the exposed insertTable method from MultiPageCanvas
    multiPageCanvasRef.current?.insertTable?.(rows, cols);

    toast({
      title: "Table Inserted",
      description: `${rows}x${cols} table added to canvas`,
      variant: "success",
    });
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
        onBack={() => setExitModalVisible(true)}
        onToggleToolbar={() => setToolbarVisible((v) => !v)}
        onPreview={() => { }} // Sidebar đã tích hợp trong MultiPageCanvas
        onCamera={handleOpenCamera}
        onToggleLayerPanel={() => setShowLayerPanel((v) => !v)}
        isLayerPanelVisible={showLayerPanel}
        onExportPress={() => setExportModalVisible(true)}
        projectId={safeNoteConfig?.projectId}
        onAIChat={() => setAiChatVisible(true)}
        onRefreshCredit={creditRefreshCounter}
        onHistory={() => setVersionModalVisible(true)}
      />
      <Modal
        visible={exitModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setExitModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              width: 360,
              maxWidth: "95%",
              backgroundColor: "#FFFFFF",
              borderRadius: 16,
              padding: 16,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "700",
                color: "#111827",
                marginBottom: 12,
              }}
            >
              Save project before exit?
            </Text>
            <Text style={{ fontSize: 14, color: "#374151", marginBottom: 16 }}>
              Your latest changes can be saved now.
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: "#3B82F6",
                }}
                onPress={async () => {
                  try {
                    await handleSaveFile();
                  } catch { }
                  try {
                    projectService.realtime.disconnect();
                  } catch { }
                  setExitModalVisible(false);
                  // 🔥 Navigate to correct home based on guest mode
                  navigation.navigate(isLocalProject ? "GuestHome" : "Home");
                }}
              >
                <Text
                  style={{ color: "white", fontSize: 14, fontWeight: "600" }}
                >
                  Save & Exit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: 10,
                  alignItems: "center",
                  backgroundColor: "#E5E7EB",
                }}
                onPress={() => {
                  try {
                    projectService.realtime.disconnect();
                  } catch { }
                  setExitModalVisible(false);
                  // 🔥 Navigate to correct home based on guest mode
                  navigation.navigate(isLocalProject ? "GuestHome" : "Home");
                }}
              >
                <Text
                  style={{ color: "#111827", fontSize: 14, fontWeight: "600" }}
                >
                  Exit without Save
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                marginTop: 12,
                paddingVertical: 10,
                borderRadius: 10,
                alignItems: "center",
                backgroundColor: "#F3F4F6",
              }}
              onPress={() => setExitModalVisible(false)}
            >
              <Text
                style={{ color: "#111827", fontSize: 14, fontWeight: "600" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <ExportModal
        visible={isExportModalVisible}
        onClose={() => setExportModalVisible(false)}
        onExport={handleExportFile}
        onShare={handleShareFile}
        hasPro={!!user?.hasActiveSubscription}
        projectId={safeNoteConfig?.projectId}
        pages={safeNoteConfig?.pages}
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
          onInsertTable={handleInsertTable} // ✅ Pass table insert callback

          // ✅ Pass EyeDropper props
          pickedColors={pickedColors}
          onColorPicked={handleColorPicked}

          eraserMode={eraserMode}
          setEraserMode={setEraserMode}
          eraserDropdownVisible={eraserDropdownVisible}
          setEraserDropdownVisible={setEraserDropdownVisible}
          eraserButtonRef={eraserButtonRef}
          tapeSettings={tapeSettings}
          setTapeSettings={setTapeSettings}
          onSelectTape={handleSelectTape}
          onClearTapesOnPage={handleClearTapesOnPage}
          onClearTapesOnAllPages={handleClearTapesOnAllPages}
          // Shape props
          shapeSettings={shapeSettings}
          setShapeSettings={setShapeSettings}
          onSelectShape={handleSelectShape}
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
          key={safeNoteConfig?.projectId}
          ref={multiPageCanvasRef}
          noteConfig={safeNoteConfig}
          projectId={safeNoteConfig?.projectId}
          userId={user?.id}
          enableCollab={!!safeNoteConfig?.projectDetails?.hasCollaboration}
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
          registerPageRef={registerPageRef}
          onActivePageChange={setActivePageId}
          onColorPicked={handleColorPicked}
          tapeSettings={tapeSettings} // ✅ Pass tape settings
          shapeSettings={shapeSettings} // ✅ Pass shape settings
          // 🔄 REALTIME COLLABORATION props
          collabEnabled={enableCollaboration}
          collabConnected={isCollabConnected}
          onCollabElementUpdate={collabUpdateElement}
          onCollabElementCreate={collabCreateElement}
          onCollabElementDelete={collabDeleteElement}
          onCollabRequestLock={collabRequestLock}
          onCollabReleaseLock={collabReleaseLock}
          onCollabIsElementLocked={collabIsElementLocked}
          onCollabPageCreate={collabCreatePage}
          onRequestTextInput={(x, y) => {
            if (tool === "text") {
              setTimeout(() => setEditingText({ x, y, text: "" }), 0);
            }
          }}
        />
        <StickerModal
          visible={stickerModalVisible}
          onClose={() => setStickerModalVisible(false)}
          onSelect={handleStickerSelect}
        />

        <AIImageChatModal
          visible={aiChatVisible}
          onClose={() => setAiChatVisible(false)}
          onImageSelect={handleAIImageSelect}
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
      <VersionSelectionModal
        visible={versionModalVisible}
        onClose={() => setVersionModalVisible(false)}
        projectId={safeNoteConfig.projectId}
        onVersionSelect={handleRestoreVersion}
      />
    </View>
  );
}
